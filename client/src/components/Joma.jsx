import { useState, useEffect } from "react";
import { api } from "../api";

const today = () => new Date().toISOString().slice(0, 10);

export default function Joma({ data, month }) {
  const [date, setDate] = useState(today());
  const [by, setBy] = useState(0);
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
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(entry) {
    if (!window.confirm("Delete korben?")) return;
    setError("");
    try {
      await api.deleteJoma(entry._id);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  const sorted = [...list].sort((a, b) => (a.date < b.date ? 1 : -1));

  // Per-member totals for the summary card
  const sums = data.members.map((_, i) =>
    list.filter((j) => j.member === i || j.by === i).reduce((s, j) => s + (j.amount ?? j.amt ?? 0), 0)
  );

  return (
    <>
      <div className="card">
        <div className="row">
          <div>
            <label style={{ marginTop: 0 }}>Tarikh</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label style={{ marginTop: 0 }}>Ke dilo</label>
            <select value={by} onChange={(e) => setBy(Number(e.target.value))}>
              {data.members.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ marginTop: 0 }}>Taka</label>
            <input
              type="number"
              min="0"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
        <label>Note (optional)</label>
        <input style={{ width: "100%" }} value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="btn" onClick={add} disabled={submitting}>
          {submitting ? "Adding…" : "Joma add korun"}
        </button>
        {error && <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>}
      </div>

      <div className="card wrap">
        <b>Ei mashe mot joma</b>
        <table>
          <thead>
            <tr><th>Naam</th><th>Joma</th></tr>
          </thead>
          <tbody>
            {data.members.map((m, i) => (
              <tr key={i}><td>{m}</td><td>{sums[i]}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card wrap">
        {loading ? (
          <p className="mu">Loading…</p>
        ) : (
          <table>
            <thead>
              <tr><th>Din</th><th>Ke</th><th>Taka</th><th></th></tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan="4" className="mu">Ei mashe kono joma nai</td></tr>
              )}
              {sorted.map((entry) => (
                <tr key={entry._id}>
                  <td>{entry.date.slice(5)}</td>
                  <td>{data.members[entry.member ?? entry.by] ?? "?"}</td>
                  <td>{entry.amount ?? entry.amt}</td>
                  <td>
                    <button className="btn x" onClick={() => remove(entry)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
