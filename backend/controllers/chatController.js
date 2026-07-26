import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";
import { answerFollowUp } from "../services/chatAgent.js";

export const sendMessage = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const session = await ChatSession.findOne({ _id: sessionId, user: req.user._id });
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (!session.analysis) {
      return res.status(400).json({ message: "Run a report analysis before chatting" });
    }

    const recentMessages = await ChatMessage.find({ session: session._id })
      .sort({ createdAt: -1 })
      .limit(6);

    await ChatMessage.create({ session: session._id, role: "user", content: message });

    const answer = await answerFollowUp({
      session,
      question: message,
      recentMessages: recentMessages.reverse(),
    });

    const assistantMsg = await ChatMessage.create({
      session: session._id,
      role: "assistant",
      content: answer,
    });

    session.updatedAt = new Date();
    await session.save();

    res.json({ answer: assistantMsg.content, createdAt: assistantMsg.createdAt });
  } catch (err) {
    next(err);
  }
};
