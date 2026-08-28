import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, "Health check successful", {
        status: "OK",
        message: "Service is running smoothly",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    }))
})

export {
    healthcheck
    }
    