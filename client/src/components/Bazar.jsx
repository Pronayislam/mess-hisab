import { useState, useEffect } from "react";
import { api } from "../api";

const today = () => new Date().toISOString().slice(0, 10);

export default function Bazar({ data, month }) {
  const [date, setDate] = useState(today());
  const [by, setBy] = useState(data.members[0] ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load bazar entries whenever month changes
  useEffect(() => {
    if (!month) return;
    setLoading(true);
    setError("");
    api
      .getBazar(month)
      .then((res) => setList(Array.isArray(res) ? res : res.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [month]);

  function reload() {
    setLoading(true);
    setError("");
    api
      .getBazar(month)
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
      await api.addBazar({ by, amt: a, date, note });
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
      await api.deleteBazar(entry._id);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  const sorted = [...list].sort((a, b) => (a.date < b.date ? 1 : -1));
  const total = list.reduce((s, b) => s + b.amt, 0);

  return (
    <>
      <div className="card">
        <div className="row">
          <div>
            <label style={{ marginTop: 0 }}>Tarikh</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label style={{ marginTop: 0 }}>Ke korlo</label>
            <select value={by} onChange={(e) => setBy(e.target.value)}>
              {data.members.map((m) => (
                <option key={m} value={m}>{m}</option>
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
        <label>Ki kena hoilo (optional)</label>
        <input style={{ width: "100%" }} value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="btn" onClick={add} disabled={submitting}>
          {submitting ? "Adding…" : "Bazar add korun"}
        </button>
        {error && <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>}
      </div>

      <div className="card wrap">
        <b>Ei mashe mot bazar: {total} taka</b>
        {loading ? (
          <p className="mu">Loading…</p>
        ) : (
          <table>
            <thead>
              <tr><th>Din</th><th>Ke</th><th>Taka</th><th>Note</th><th></th></tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan="5" className="mu">Ei mashe kono bazar nai</td></tr>
              )}
              {sorted.map((entry) => (
                <tr key={entry._id}>
                  <td>{entry.date.slice(5)}</td>
                  <td>{entry.by ?? "?"}</td>
                  <td>{entry.amt}</td>
                  <td>{entry.note}</td>
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
