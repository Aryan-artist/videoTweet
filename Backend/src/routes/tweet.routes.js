import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    getAllTweets,
    updateTweet,
} from "../controllers/tweet.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { strictlimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();
router.use(verifyJWT);

router.route("/").get(getAllTweets).post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(strictlimiter,updateTweet).delete(strictlimiter,deleteTweet);

export default router