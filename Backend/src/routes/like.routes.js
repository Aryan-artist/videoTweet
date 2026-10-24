import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { strictlimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();
router.use(verifyJWT);

router.route("/toggle/v/:videoId").post(strictlimiter,toggleVideoLike);
router.route("/toggle/c/:commentId").post(strictlimiter,toggleCommentLike);
router.route("/toggle/t/:tweetId").post(strictlimiter,toggleTweetLike);
router.route("/videos").get(getLikedVideos);

export default router