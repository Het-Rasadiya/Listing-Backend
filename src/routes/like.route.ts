import express from "express";
import { addLike, checkLike, getAllLikedListingByUser } from "../controllers/like.controller.js";
import { verifyToken } from "../middlewares/verfiyToken.js";
const router = express.Router();

router.post("/", verifyToken, addLike);
router.get("/check", verifyToken, checkLike);
router.get("/user", verifyToken, getAllLikedListingByUser);

export default router;
