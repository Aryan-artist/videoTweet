import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid ChannelId")
    }

    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    if (req.user._id.toString() === channelId) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const existing = await Subscription.findOneAndDelete({
        subscriber: req.user._id,
        channel: channelId
    })

    if(!existing){
        const subscribe = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })

        return res
        .status(201)
        .json(new ApiResponse(201,"Subscription Added",subscribe))
    }

    return res
    .status(200)
    .json(new ApiResponse(200,"Subscription removed",{}))
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid ChannelId")
    }

    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    if (req.user._id.toString() !== channelId) {
        throw new ApiError(403, "You are not authorized to view other users' subscribers");
    }

    const subscribers = await Subscription.find({
        channel: channelId
    }).populate("subscriber","username avatar")

    return res
    .status(200)
    .json(new ApiResponse(200,"Subscribers fetched Successfully",{ count: subscribers.length, subscribers}))

})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"Invalid SubscriberId")
    }

    if((req.user._id.toString() !== subscriberId)){
        throw new ApiError(403,"Unauthorized Subscriber")
    }

    const channels = await Subscription.find({
        subscriber: subscriberId
    }).populate("channel","username avatar")

    return res
    .status(200)
    .json(new ApiResponse(200,"Channels fetched successfully",{count:channels.length, channels}))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}