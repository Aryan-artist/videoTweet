import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })

    return res 
    .status(200)
    .json(new ApiResponse(200, "Tweet created successfully", tweet))

})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
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
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likeDetails"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "tweet",
                as: "commentDetails"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likeDetails"
                },
                commentsCount: {
                    $size: "$commentDetails"
                },
                isLiked: {
                    $cond: {
                        if: {$in: [req.user?._id, "$likeDetails.likedBy"]},
                        then: true,
                        else: false
                    }
                },
                ownerDetails: {
                    $first: "$ownerDetails"
                }
            }
        },
        {
            $match: {
                ownerDetails: { $ne: null }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                likeDetails: 0,
                commentDetails: 0
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, "User tweets fetched successfully", tweets))
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.findOneAndUpdate(
        {
            _id: tweetId,
            owner: req.user._id
        },
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    );

    if (!tweet) {
        throw new ApiError(404, "Tweet not found or unauthorized");
    }
        
    return res
        .status(200)
        .json(new ApiResponse(200, "Tweet updated successfully", tweet))

})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: req.user._id
    });

    if (!tweet) {
        throw new ApiError(404, "Tweet not found or unauthorized");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully", {}))


})

const getAllTweets = asyncHandler(async (req, res) => {
    const tweets = await Tweet.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
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
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likeDetails"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "tweet",
                as: "commentDetails"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likeDetails"
                },
                commentsCount: {
                    $size: "$commentDetails"
                },
                isLiked: {
                    $cond: {
                        if: {
                            $and: [
                                {$ne: [req.user, null]},
                                {$in: [req.user?._id, "$likeDetails.likedBy"]}
                            ]
                        },
                        then: true,
                        else: false
                    }
                },
                ownerDetails: {
                    $first: "$ownerDetails"
                }
            }
        },
        {
            $match: {
                ownerDetails: { $ne: null }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                likeDetails: 0,
                commentDetails: 0
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, "All tweets fetched successfully", tweets))
})

export {
    createTweet,
    getUserTweets,
    getAllTweets,
    updateTweet,
    deleteTweet
}
