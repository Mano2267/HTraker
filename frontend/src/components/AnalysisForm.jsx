import { useState } from "react";
import client from "../api/client.js";

export default function AnalysisForm({ sessionId, onAnalyzed }) {
  const [file, setFile] = useState(null);
  const [useSample, setUseSample] = useState(false);
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!useSample && !file) {
      setError("Upload a PDF report or choose the sample report");
      return;
    }

    const formData = new FormData();
    if (useSample) {
      formData.append("useSample", "true");
    } else {
      formData.append("report", file);
    }
    if (age || sex) {
      formData.append("patientInfo", JSON.stringify({ age: age || undefined, sex: sex || undefined }));
    }

    setLoading(true);
    try {
      const { data } = await client.post(`/analysis/${sessionId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onAnalyzed(data.analysis);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="mx-auto w-full max-w-2xl rounded-[28px] border border-sky-100 bg-white/90 p-6 shadow-[0_20px_45px_-25px_rgba(2,132,199,0.35)] backdrop-blur"
      onSubmit={handleSubmit}
    >
      <div className="mb-4">
        <p className="text-sm font-medium text-sky-600">Analysis</p>
        <h2 className="text-xl font-semibold text-slate-800">Analyze a blood report</h2>
        <p className="mt-1 text-sm text-slate-500">
          Upload a PDF or use the sample report to generate a quick clinical summary.
        </p>
      </div>

      <label className="mb-3 flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={useSample}
          onChange={(e) => setUseSample(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
        />
        Use sample report instead of uploading
      </label>

      {!useSample && (
        <div className="mb-4 rounded-2xl border border-dashed border-sky-200 bg-sky-50/70 p-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Upload PDF (max 20MB, 50 pages)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-sky-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Age (optional)</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Sex (optional)</label>
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
          >
            <option value="">-</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2.5 font-semibold text-white shadow-lg shadow-sky-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Analyzing..." : "Analyze Report"}
      </button>
    </form>
  );
}
