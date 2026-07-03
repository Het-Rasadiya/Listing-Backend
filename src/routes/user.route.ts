import express from "express";
import {
  adminAllStates,
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/verfiyToken.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/profile",verifyToken, getUserProfile);
router.get("/admin", verifyToken, adminAllStates);

export default router;
