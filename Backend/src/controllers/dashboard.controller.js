import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const subscribers = await Subscription.countDocuments({
        channel: req.user._id
    });

    const subscribed = await Subscription.countDocuments({
        subscriber: req.user._id
    });

    const tweets = await Tweet.countDocuments({
        owner: req.user._id
    });

    const videos = await Video.countDocuments({
        owner: req.user._id
    });

    const views = await Video.aggregate([
        {
            $match:{
                owner: req.user._id
            }
        },
        {
            $group:{
                _id: null,
                totalviews: {
                    $sum: "$views"
                }
            }
        }
    ])

    const likes = await Video.aggregate([
        {
            $match: {
                owner: req.user._id
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: {
                    $sum: {
                        $size: "$likes"
                    }
                }
            }
        }
    ]);

    const totalViews = views[0]?.totalviews || 0
    const totalLikes = likes[0]?.totalLikes || 0;

    const stats = {
        totalVideos:videos,
        totalViews,
        totalLikes,
        totalSubscribers:subscribers,
        totalSubscribed:subscribed,
        totalTweets: tweets
    }

    return res
    .status(200)
    .json(new ApiResponse(200,"DashBoard fetched Successfully",stats))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({
        owner: req.user._id
    }).sort({createdAt: -1})

    return res
    .status(200)
    .json(new ApiResponse(200,"Videos fetched successfully",videos))

})

export {
    getChannelStats, 
    getChannelVideos
    }