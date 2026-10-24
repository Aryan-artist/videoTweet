import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
    getTweetComments,
    addTweetComment
} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { strictlimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").get(getVideoComments).post(strictlimiter,addComment);
router.route("/t/:tweetId").get(getTweetComments).post(strictlimiter,addTweetComment);
router.route("/c/:commentId").delete(strictlimiter,deleteComment).patch(strictlimiter,updateComment);

export default router