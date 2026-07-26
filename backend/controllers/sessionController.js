import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";
import { LIMITS } from "../config/appConfig.js";

export const listSessions = async (req, res, next) => {
  try {
    const sessions = await ChatSession.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select("-chunks"); // omit heavy embedding data from list view
    res.json({ sessions });
  } catch (err) {
    next(err);
  }
};

export const getSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, user: req.user._id }).select(
      "-chunks"
    );
    if (!session) return res.status(404).json({ message: "Session not found" });
    const messages = await ChatMessage.find({ session: session._id }).sort({ createdAt: 1 });
    res.json({ session, messages });
  } catch (err) {
    next(err);
  }
};

export const createSession = async (req, res, next) => {
  try {
    const session = await ChatSession.create({
      user: req.user._id,
      title: req.body.title || "New Session",
    });
    res.status(201).json({ session });
  } catch (err) {
    next(err);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ message: "Session not found" });
    await ChatMessage.deleteMany({ session: session._id });
    res.json({ message: "Session deleted" });
  } catch (err) {
    next(err);
  }
};

export const getDailyLimitStatus = async (req, res, next) => {
  try {
    const user = req.user;
    const now = new Date();
    const resetAt = new Date(user.dailyAnalysisResetAt);
    const isNewDay = now.toDateString() !== resetAt.toDateString();

    res.json({
      limit: LIMITS.DAILY_ANALYSIS_LIMIT,
      used: isNewDay ? 0 : user.dailyAnalysisCount,
      remaining: isNewDay
        ? LIMITS.DAILY_ANALYSIS_LIMIT
        : LIMITS.DAILY_ANALYSIS_LIMIT - user.dailyAnalysisCount,
    });
  } catch (err) {
    next(err);
  }
};
