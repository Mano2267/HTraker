import { useEffect, useState } from "react";
import client from "../api/client.js";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Sidebar from "../components/Sidebar.jsx";
import AnalysisForm from "../components/AnalysisForm.jsx";
import ChatWindow from "../components/ChatWindow.jsx";

export default function Dashboard() {
  const [activeId, setActiveId] = useState(null);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadSession = async (id) => {
    if (!id) {
      setSessionDetail(null);
      return;
    }
    const { data } = await client.get(`/sessions/${id}`);
    setSessionDetail(data);
  };

  useEffect(() => {
    loadSession(activeId);
  }, [activeId]);

  const handleNewSession = async () => {
    const { data } = await client.post("/sessions", {});
    setRefreshKey((k) => k + 1);
    setActiveId(data.session._id);
  };

  const handleAnalyzed = (analysis) => {
    setSessionDetail((prev) => ({
      ...prev,
      session: { ...prev.session, analysis },
    }));
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.22),_transparent_30%),linear-gradient(135deg,_#f8fbff_0%,_#eef7ff_100%)]">
      <div className="sticky top-0 h-screen shrink-0">
        <Sidebar
          activeId={activeId}
          onSelect={setActiveId}
          onNewSession={handleNewSession}
          refreshKey={refreshKey}
        />
      </div>

      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-7">
          {!activeId && (
            <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-sky-100 bg-white/70 p-8 text-center shadow-sm backdrop-blur">
              <div>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-2xl">
                  ✨
                </div>
                <p className="text-lg font-medium text-slate-700">
                  Select a session from the sidebar, or create a new one to get started.
                </p>
              </div>
            </div>
          )}
          {activeId && sessionDetail && !sessionDetail.session.analysis && (
            <div className="flex min-h-[60vh] items-center justify-center">
              <AnalysisForm sessionId={activeId} onAnalyzed={handleAnalyzed} />
            </div>
          )}
          {activeId && sessionDetail && sessionDetail.session.analysis && (
            <div className="h-[calc(100vh-180px)] min-h-[500px]">
              <ChatWindow
                sessionId={activeId}
                analysis={sessionDetail.session.analysis}
                initialMessages={sessionDetail.messages}
              />
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
}
