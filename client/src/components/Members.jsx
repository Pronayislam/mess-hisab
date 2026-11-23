import { useState } from "react";
import { useToast } from "../context/ToastContext";

export default function Members({ data, setData }) {
  const { addToast } = useToast();
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  function rename(i, name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setData((d) => ({
      ...d,
      members: d.members.map((m, j) => (j === i ? trimmed : m)),
    }));
  }

  function copyBackup() {
    const json = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast({ title: "Backup copied", message: "Paste this into Notes or WhatsApp for safekeeping." });
    });
  }

  function restore() {
    try {
      const o = JSON.parse(text);
      if (!Array.isArray(o.members) || !o.meals || !Array.isArray(o.bazar)) throw new Error();
      if (!window.confirm("Replace all current data with the backup? This cannot be undone.")) return;
      setData({ ...o, joma: o.joma || [] });
      setText("");
      addToast({ title: "Restored", message: "Data restored from backup." });
    } catch {
      addToast({ variant: "error", title: "Invalid backup", message: "The backup text could not be parsed." });
    }
  }

  return (
    <>
      <div className="card section">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <span className="text-brand-600">👥</span>
            <h2 className="text-base font-semibold text-slate-800">Members</h2>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.members.map((m, i) => (
              <div key={i}>
                <label className="label">Member {i + 1}</label>
                <input
                  className="input"
                  value={m}
                  onChange={(e) => rename(i, e.target.value)}
                />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Renames save automatically. Edit names to keep bazar/joma history accurate.
          </p>
        </div>
      </div>

      <div className="card section">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <span className="text-brand-600">💾</span>
            <h2 className="text-base font-semibold text-slate-800">Backup &amp; Restore</h2>
          </div>
        </div>
        <div className="card-body">
          <p className="text-sm text-slate-500 mb-4">
            Copy the JSON below and keep it safe (Notes, WhatsApp, email). It contains your full
            mess data for this month.
          </p>

          <div className="relative mb-4">
            <textarea
              readOnly
              rows="5"
              className="input font-mono text-xs"
              value={JSON.stringify(data, null, 2)}
              onClick={(e) => e.target.select()}
            />
            <button
              className="absolute right-2 top-2 btn btn-outline btn-sm"
              onClick={copyBackup}
              title="Copy to clipboard"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4">
            <label className="label">Restore from backup</label>
            <textarea
              rows="4"
              className="input font-mono text-xs"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste backup JSON here…"
            />
          </div>
          <button className="btn btn-outline" onClick={restore}>
            Restore Backup
          </button>
        </div>
      </div>
    </>
  );
}