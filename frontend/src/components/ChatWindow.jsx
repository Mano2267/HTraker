import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import client from "../api/client.js";

export default function ChatWindow({ sessionId, analysis, initialMessages = [] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg = { role: "user", content: input, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const { data } = await client.post(`/chat/${sessionId}`, { message: userMsg.content });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, createdAt: data.createdAt },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err.response?.data?.message || "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-4">
      {analysis && (
        <div className="rounded-[24px] border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold text-slate-800">📋 Analysis</h3>
          <div className="text-sm leading-6 text-slate-600">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto rounded-[24px] border border-sky-100 bg-white/80 p-4 shadow-sm">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
              m.role === "user"
                ? "ml-auto bg-gradient-to-r from-sky-500 to-cyan-400 text-white"
                : "border border-sky-100 bg-slate-50 text-slate-700"
            }`}
          >
            <ReactMarkdown>{m.content}</ReactMarkdown>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {analysis && (
        <form className="flex gap-2 rounded-[24px] border border-sky-100 bg-white/90 p-2 shadow-sm" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Ask a follow-up question about this report..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-2xl border border-transparent bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-300 focus:bg-white"
          />
          <button
            type="submit"
            disabled={sending}
            className="rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "..." : "Send"}
          </button>
        </form>
      )}
    </div>
  );
}
