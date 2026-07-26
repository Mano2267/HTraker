import { useEffect, useState } from "react";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import logo from "../assets/logo.png";

export default function Sidebar({ activeId, onSelect, onNewSession, refreshKey }) {
  const { logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [limitStatus, setLimitStatus] = useState(null);

  const loadSessions = async () => {
    const { data } = await client.get("/sessions");
    setSessions(data.sessions);
  };

  const loadLimit = async () => {
    const { data } = await client.get("/sessions/limit-status");
    setLimitStatus(data);
  };

  useEffect(() => {
    loadSessions();
    loadLimit();
  }, [refreshKey]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this session?")) return;
    await client.delete(`/sessions/${id}`);
    loadSessions();
    if (activeId === id) onSelect(null);
  };

  return (
    <aside className="flex h-full w-[280px] flex-col border-r border-sky-100 bg-slate-950/95 p-5 text-slate-100 shadow-2xl shadow-sky-950/20 lg:w-72">
      <div className="mb-6 flex items-center gap-3">
        <img src={logo} alt="HIA Logo" className="h-10 w-10 rounded-lg object-contain" />
        <div>
          <p className="text-sm font-semibold text-white">HIA Workspace</p>
          <p className="text-xs text-slate-400">Insightful reports</p>
        </div>
      </div>

      <button
        className="mb-4 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 font-semibold text-white shadow-lg shadow-sky-300/30 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl"
        onClick={onNewSession}
      >
        + New Session
      </button>

      {limitStatus && (
        <div className="mb-4 rounded-2xl border border-sky-900/60 bg-sky-950/60 px-3 py-2 text-xs text-sky-200">
          Analyses today: {limitStatus.used}/{limitStatus.limit}
        </div>
      )}

      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {sessions.map((s) => (
          <div
            key={s._id}
            className={`group flex cursor-pointer items-center justify-between rounded-2xl border px-3 py-3 text-sm transition duration-200 ${
              activeId === s._id
                ? "border-sky-400/50 bg-sky-500/10 text-sky-200 shadow-sm"
                : "border-transparent text-slate-300 hover:border-sky-900/60 hover:bg-slate-800/80"
            }`}
            onClick={() => onSelect(s._id)}
          >
            <span className="truncate pr-2">{s.title}</span>
            <button
              className="rounded-full p-1 text-slate-400 transition hover:bg-slate-700 hover:text-white"
              onClick={(e) => handleDelete(s._id, e)}
            >
              ✕
            </button>
          </div>
        ))}
        {sessions.length === 0 && <p className="px-2 py-4 text-sm text-slate-500">No sessions yet</p>}
      </div>

      <button
        className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition hover:border-sky-500 hover:text-white"
        onClick={logout}
      >
        Logout
      </button>
    </aside>
  );
}
