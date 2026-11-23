import { useState, useEffect } from "react";
import { api } from "../api";
import { useToast } from "../context/ToastContext";
import { formatDateShort, formatTaka } from "../utils/format";

const today = () => new Date().toISOString().slice(0, 10);

export default function Joma({ data, month }) {
  const { addToast } = useToast();
  const [date, setDate] = useState(today());
  const [by, setBy] = useState(data.members[0] ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load joma entries on mount and whenever month changes
  useEffect(() => {
    if (!month) return;
    setLoading(true);
    setError("");
    api
      .getJoma(month)
      .then((res) => setList(Array.isArray(res) ? res : res.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [month]);

  function reload() {
    setLoading(true);
    setError("");
    api
      .getJoma(month)
      .then((res) => setList(Array.isArray(res) ? res : res.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function add() {
    const a = Number(amount);
    if (!(a > 0)) return;
    setSubmitting(true);
    setError("");
    try {
      await api.addJoma({ member: by, amount: a, date, note });
      setAmount("");
      setNote("");
      reload();
      addToast({ title: "Payment received", message: formatTaka(a) + " from " + by + " on " + formatDateShort(date) });
    } catch (err) {
      setError(err.message);
      addToast({ variant: "error", title: "Add failed", message: err.message });
    } finally {
      setSubmitting(false);
    }
  }
  async function remove(entry) {
    if (!window.confirm("Delete this entry?")) return;
    setError("");
    try {
      await api.deleteJoma(entry._id);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  const sorted = [...list].sort((a, b) => (a.date < b.date ? 1 : -1));

  // Per-member totals for the summary card — member field is a name string
  const sums = data.members.map((name) =>
    list.filter((j) => j.member === name).reduce((s, j) => s + (j.amount ?? j.amt ?? 0), 0)
  );
  const total = list.reduce((s, j) => s + (j.amount ?? j.amt ?? 0), 0);

  return (
    <>
      <div className="card section">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <span className="text-brand-600">💰</span>
            <h2 className="text-base font-semibold text-slate-800">Record Joma (Deposit)</h2>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Who paid</label>
              <select className="select input" value={by} onChange={(e) => setBy(e.target.value)}>
                {data.members.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Amount (৳)</label>
              <input
                type="number"
                min="0"
                inputMode="decimal"
                className="input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <button
                className="btn btn-primary"
                onClick={add}
                disabled={submitting || !(Number(amount) > 0)}
              >
                {submitting ? "Adding…" : "Record Joma"}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <label className="label">Note (optional)</label>
            <input
              className="input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Monthly deposit"
            />
          </div>

          {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
        </div>
      </div>

      <div className="card section">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-brand-600">📋</span>
              <h2 className="text-base font-semibold text-slate-800">Joma Summary</h2>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Total collected</div>
              <div className="text-sm font-semibold text-slate-700">{formatTaka(total)}</div>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th className="text-right">Joma</th>
                </tr>
              </thead>
              <tbody>
                {data.members.length === 0 && (
                  <tr>
                    <td colSpan="2" className="text-center py-8 text-slate-400">
                      Add members first.
                    </td>
                  </tr>
                )}
                {data.members.map((m) => (
                  <tr key={m} className="group">
                    <td className="font-medium text-slate-700">{m}</td>
                    <td className="text-right font-medium">{formatTaka(sums[data.members.indexOf(m)] ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card section">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <span className="text-brand-600">🧾</span>
            <h2 className="text-base font-semibold text-slate-800">Joma List</h2>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-20">Date</th>
                  <th>Member</th>
                  <th className="text-right">Amount</th>
                  <th>Note</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-400">
                      No joma entries for this month yet.
                    </td>
                  </tr>
                )}
                {sorted.map((entry) => (
                  <tr key={entry._id} className="group">
                    <td className="font-medium text-slate-700">{formatDateShort(entry.date)}</td>
                    <td>{entry.member ?? "—"}</td>
                    <td className="text-right font-medium">{formatTaka(entry.amount ?? entry.amt)}</td>
                    <td className="text-xs text-slate-500 truncate max-w-xs">{entry.note ?? "—"}</td>
                    <td className="text-right">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(entry)}
                        aria-label="Delete"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loading && <p className="px-6 py-4 text-center text-slate-400 text-sm">Loading…</p>}
        </div>
      </div>
    </>
  );
}
