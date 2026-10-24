import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { strictlimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route("/").post(createPlaylist)

router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(strictlimiter,updatePlaylist)
    .delete(strictlimiter,deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(strictlimiter,addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(strictlimiter,removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router