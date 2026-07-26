import express from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import { analyzeUploadedReport } from "../controllers/analysisController.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.use(protect);

router.post("/:sessionId", upload.single("report"), analyzeUploadedReport);

export default router;
