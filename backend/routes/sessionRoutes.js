import express from "express";
import { protect } from "../middleware/auth.js";
import {
  listSessions,
  getSession,
  createSession,
  deleteSession,
  getDailyLimitStatus,
} from "../controllers/sessionController.js";

const router = express.Router();

router.use(protect);

router.get("/", listSessions);
router.post("/", createSession);
router.get("/limit-status", getDailyLimitStatus);
router.get("/:id", getSession);
router.delete("/:id", deleteSession);

export default router;
