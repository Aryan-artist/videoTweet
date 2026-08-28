import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import { User } from "../models/user.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name?.trim()){
        throw new ApiError(400,"Name is required")
    }

    const playlist = await Playlist.create({
        name,
        description: description?.trim() || "My Playlist",
        owner: req.user._id
    })

    return res
    .status(201)
    .json(new ApiResponse(201,"Playlist created succesfully",playlist))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid UserId")
    }

    const playlists = await Playlist.find({
        owner: userId
    }).populate("videos", "thumbnail videoFile title duration views");


    return res
    .status(200)
    .json(new ApiResponse(200,"Playlist fetched successfully",playlists))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid PlaylsitId")
    }

    const playlist = await Playlist.findById(playlistId)
        .populate("owner", "username avatar")
        .populate({
            path: "videos",
            populate: {
                path: "owner",
                select: "username avatar"
            }
        });

    if(!playlist){
        throw new ApiError(404,"Playlist not Found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,"Playlist Fetched successfully",playlist))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid PlaylistId")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid VideoId")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }

    const playlist = await Playlist.findOneAndUpdate(
    {
        _id: playlistId,
        owner: req.user._id
    },
    {
        $addToSet: {
            videos: videoId
        }
    },
    {
        new: true
    }
);

    if (!playlist) {
        throw new ApiError(404,"Playlist not found or unauthorized");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,"Playlist Updated successfully",playlist))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid PlaylistId")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid VideoId")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }

    const playlist = await Playlist.findOneAndUpdate(
    {
        _id: playlistId,
        owner: req.user._id
    },
    {
        $pull: {
            videos: videoId
        }
    },
    {
        new: true
    }
);

    if (!playlist) {
        throw new ApiError(404,"Playlist not found or unauthorized");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,"Playlist Updated successfully",playlist))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid PlaylistId")
    }

    const playlist = await Playlist.findOneAndDelete({
        owner: req.user._id,
        _id: playlistId
    })

    if(!playlist){
        throw new ApiError(404,"Playlist not found or unauthorized access")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,"Playlist Deleted successfully",{}))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid PlaylistId")
    }

    if(!name?.trim() || !description?.trim()){
        throw new ApiError(400,"Name and Description is required")
    }

    const playlist = await Playlist.findOneAndUpdate({
        owner: req.user._id,
        _id: playlistId
    },
    {
        $set: {
            name,
            description
        }
    },
    {
        new: true
    }
)

    if(!playlist){
        throw new ApiError(404,"Playlist not found or unauthorized access")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,"Playlist Updated successfully",playlist))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
