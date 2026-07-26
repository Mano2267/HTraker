import { useAuth } from "../context/AuthContext.jsx";
import logo from "../assets/logo.png";

export default function Header() {
  const { user } = useAuth();
  return (
    <header className="border-b border-sky-100 bg-white/80 px-5 py-3 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={logo} alt="HIA Logo" className="h-10 w-auto" />
          <div>
            <p className="text-xs font-medium text-sky-600">Clinical assistant</p>
            <h2 className="text-sm font-semibold text-slate-800">
              Welcome, {user?.name || user?.email}
            </h2>
          </div>
        </div>
        <div className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-sm text-sky-700">
          Live insights
        </div>
      </div>
    </header>
  );
}
