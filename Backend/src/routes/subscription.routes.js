import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { strictlimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();
router.use(verifyJWT);

router
    .route("/c/:channelId")
    .get(getUserChannelSubscribers)
    .post(strictlimiter,toggleSubscription);

router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router