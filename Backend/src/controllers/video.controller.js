import mongoose, {isValidObjectId} from "mongoose"
import jwt from "jsonwebtoken"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {Like} from "../models/like.model.js"
import {Comment} from "../models/comment.model.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const filter = {
        ispublished: true
    }
    if(query) {
        filter.$or = [
            {
                title: {
                    $regex: query,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: query,
                    $options: "i"
                }
            }
        ]
    }

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id")
    }

    if(userId) {
        filter.owner = new mongoose.Types.ObjectId(userId)
    }

    const allowedSortFields = [
        "createdAt",
        "views",
        "title",
        "duration"
    ];

    const sortField = allowedSortFields.includes(sortBy)
        ? sortBy
        : "createdAt";

    const aggregate =  Video.aggregate([      
        {
            $match: filter
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1
                        }
                    }]
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $sort: {
                [sortField]: sortType === "asc" ? 1 : -1
            }
        }
    ])

    const options = {
        page: Number(page),
        limit: Number(limit),
    }

    const videos = await Video.aggregatePaginate(aggregate, options)

    return res
    .status(200)
    .json(new ApiResponse(200, "Videos fetched successfully", videos))
         

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    if(
        [title, description].some(field => field?.trim() === "")
    ) {
        throw new ApiError(400, "Title and description are required")
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if(!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required")
    }
    if(!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoFile?.url || !thumbnail?.url) {
        throw new ApiError(400, "Failed to upload video or thumbnail")
    }

    const video = await Video.create({
        videoFile: videoFile.secure_url || videoFile.url,
        thumbnail: thumbnail.secure_url || thumbnail.url,
        title,
        description,
        owner: req.user._id,
        duration: videoFile.duration || 0
    })

    if(!video) {
        throw new ApiError(500, "Failed to publish video")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, "Video published successfully", video))


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is required")
    }

    const video = await Video.findById(videoId).populate("owner", "username email avatar fullname")
    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    return res.status(200).json(new ApiResponse(200, "Video fetched successfully", video))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    const thumbnailLocalPath = req.file?.path

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is required")
    }

    if(!title?.trim()) {
        throw new ApiError(400, "Title is required to update")
    }

    if(!description?.trim()) {
        throw new ApiError(400, "Description is required to update")
    }

    const updateData = {
        title,
        description,
    }
    
    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        if (!thumbnail?.url) {
            throw new ApiError(400, "Failed to upload thumbnail");
        }

        updateData.thumbnail = thumbnail.secure_url || thumbnail.url;
    }


    const video = await Video.findOneAndUpdate(
        {
            _id: videoId,
            owner: req.user._id
        },
        {
            $set: updateData
        },
        {
            new: true
        }
    )

    if (!video) {
        throw new ApiError(404, "Video not found or unauthorized");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, "Video updated successfully", video))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is required")
    }

    const video = await Video.findOneAndDelete({
        _id: videoId,
        owner: req.user._id
    })

    if (!video) {
        throw new ApiError(404, "Video not found or unauthorized");
    }

    await Likes.deleteMany({
        video: videoId
    })

    await Comments.deleteMany({
        video: videoId
    })


    return res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully", {}))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is required")
    }

    const video = await Video.findOne({
        _id: videoId,
        owner: req.user._id
    })
    if (!video) {
        throw new ApiError(404, "Video not found or unauthorized");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                ispublished: !video.ispublished
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, "Publish status toggled successfully", updatedVideo))
})

const incrementViewCount = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    let shouldIncrement = true;

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
        try {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            if (decodedToken?._id) {
                const user = await User.findById(decodedToken._id);
                const alreadyWatched = user?.watchHistory?.some(
                    (historyId) => historyId.toString() === videoId.toString()
                );

                if (alreadyWatched) {
                    shouldIncrement = false;
                } else {
                    await User.findByIdAndUpdate(decodedToken._id, {
                        $addToSet: { watchHistory: videoId }
                    });
                }
            }
        } catch (error) {
        }
    }

    if (shouldIncrement) {
        video.views = (video.views || 0) + 1;
        await video.save({ validateBeforeSave: false });
    }

    return res.status(200).json(
        new ApiResponse(200, "View recorded successfully", { views: video.views, incremented: shouldIncrement })
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    incrementViewCount
}
