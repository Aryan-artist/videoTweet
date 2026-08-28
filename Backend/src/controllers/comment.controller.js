import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { Tweet } from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid VideoId")
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const aggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
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
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                }
            }
        },
        {
            $project: {
                likes: 0
            }
        },
        
    ])

    const options = {
        page: Number(page),
        limit: Number(limit)
    }

    const comments = await Comment.aggregatePaginate(aggregate,options)

    return res
    .status(200)
    .json(new ApiResponse(200,"All Comments fetched successfully",comments))

})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const{content} = req.body

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid VideoId")
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    
    if(!content?.trim()){
        throw new ApiError(400,"Content is required")
    }

    const comment = await Comment.create({
        content: content,
        video: videoId,
        owner: req.user._id
    })

    return res
    .status(201)
    .json(new ApiResponse(201,"Comment Added successfully",comment ))
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId } = req.params
    const {content} = req.body

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid CommentId")
    }

    if(!content?.trim()){
        throw new ApiError(400,"Content is required")
    }

    const comment = await Comment.findOneAndUpdate({
        _id: commentId,
        owner: req.user._id
        },
        {
            $set:{
                content
            }
        },
        {
            new: true
        }
    )

    if(!comment){
        throw new ApiError(404,"Comment not found or Unauthorized access")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,"Comment Updated successfully",comment))

})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId }= req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid commentId")
    }

    const comment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user._id
    })
    if(!comment){
        throw new ApiError(404,"Comment Not Found or Unauthorized")
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200,"Comment successfully deleted",{}))

})

const getTweetComments = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid TweetId")
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const aggregate = Comment.aggregate([
        {
            $match: {
                tweet: new mongoose.Types.ObjectId(tweetId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
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
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                }
            }
        },
        {
            $project: {
                likes: 0
            }
        }
    ])

    const options = {
        page: Number(page),
        limit: Number(limit)
    }

    const comments = await Comment.aggregatePaginate(aggregate,options)

    return res
    .status(200)
    .json(new ApiResponse(200,"Tweet Comments fetched successfully",comments))
})

const addTweetComment = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const {content} = req.body

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid TweetId")
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    
    if(!content?.trim()){
        throw new ApiError(400,"Content is required")
    }

    const comment = await Comment.create({
        content: content,
        tweet: tweetId,
        owner: req.user._id
    })

    return res
    .status(201)
    .json(new ApiResponse(201,"Tweet Comment Added successfully",comment))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment,
    getTweetComments,
    addTweetComment
}

