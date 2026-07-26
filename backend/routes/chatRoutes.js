import express from "express";
import { protect } from "../middleware/auth.js";
import { sendMessage } from "../controllers/chatController.js";

const router = express.Router();

router.use(protect);

router.post("/:sessionId", sendMessage);

export default router;
