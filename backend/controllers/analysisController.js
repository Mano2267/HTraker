import ChatSession from "../models/ChatSession.js";
import User from "../models/User.js";
import { extractPdfText } from "../utils/pdfExtractor.js";
import { buildVectorStore } from "../services/ragService.js";
import { analyzeReport } from "../services/analysisAgent.js";
import { LIMITS } from "../config/appConfig.js";
import { SAMPLE_REPORT } from "../config/sampleData.js";

const enforceAndBumpDailyLimit = async (user) => {
  const now = new Date();
  const resetAt = new Date(user.dailyAnalysisResetAt);
  const isNewDay = now.toDateString() !== resetAt.toDateString();

  if (isNewDay) {
    user.dailyAnalysisCount = 0;
    user.dailyAnalysisResetAt = now;
  }

  if (user.dailyAnalysisCount >= LIMITS.DAILY_ANALYSIS_LIMIT) {
    const err = new Error(
      `Daily analysis limit reached (${LIMITS.DAILY_ANALYSIS_LIMIT}/day). Try again tomorrow.`
    );
    err.status = 429;
    throw err;
  }

  user.dailyAnalysisCount += 1;
  await user.save();
};

export const analyzeUploadedReport = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { patientInfo, useSample } = req.body;

    const session = await ChatSession.findOne({ _id: sessionId, user: req.user._id });
    if (!session) return res.status(404).json({ message: "Session not found" });

    await enforceAndBumpDailyLimit(req.user);

    let reportText;
    let reportSource;

    if (useSample === "true" || useSample === true) {
      reportText = SAMPLE_REPORT;
      reportSource = "sample";
    } else {
      if (!req.file) {
        return res.status(400).json({ message: "No PDF file uploaded" });
      }
      const maxBytes = LIMITS.MAX_UPLOAD_MB * 1024 * 1024;
      if (req.file.size > maxBytes) {
        return res.status(400).json({ message: `File exceeds ${LIMITS.MAX_UPLOAD_MB}MB limit` });
      }
      reportText = await extractPdfText(req.file.buffer);
      reportSource = "upload";
    }

    // Pull a couple of previous analyses for in-context learning, mirroring the
    // original app's use of prior sessions.
    const previousSessions = await ChatSession.find({
      user: req.user._id,
      analysis: { $ne: "" },
      _id: { $ne: session._id },
    })
      .sort({ updatedAt: -1 })
      .limit(2)
      .select("analysis");

    const { analysis, modelUsed } = await analyzeReport({
      reportText,
      patientInfo: patientInfo ? JSON.parse(patientInfo) : null,
      previousAnalyses: previousSessions.map((s) => s.analysis),
    });

    const chunks = await buildVectorStore(reportText);

    session.reportText = reportText;
    session.reportSource = reportSource;
    session.patientInfo = patientInfo ? JSON.parse(patientInfo) : null;
    session.analysis = analysis;
    session.chunks = chunks;
    session.title = reportSource === "sample" ? "Sample Report Analysis" : "Report Analysis";
    await session.save();

    res.json({
      analysis,
      modelUsed,
      session: {
        id: session._id,
        title: session.title,
        reportSource: session.reportSource,
      },
    });
  } catch (err) {
    next(err);
  }
};
