import { useState } from "react";

const today = () => new Date().toISOString().slice(0, 10);

export default function Bazar({ data, setData, month }) {
  const [date, setDate] = useState(today());
  const [by, setBy] = useState(0);
  const [amt, setAmt] = useState("");
  const [note, setNote] = useState("");

  function add() {
    const a = Number(amt);
    if (!(a > 0)) return;
    setData((d) => ({
      ...d,
      bazar: [...d.bazar, { id: Date.now(), date, by, amt: a, note }],
    }));
    setAmt("");
    setNote("");
  }

  function remove(id) {
    if (!window.confirm("Delete korben?")) return;
    setData((d) => ({ ...d, bazar: d.bazar.filter((b) => b.id !== id) }));
  }

  const list = data.bazar
    .filter((b) => b.date.slice(0, 7) === month)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
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
              value={amt}
              onChange={(e) => setAmt(e.target.value)}
            />
          </div>
        </div>
        <label>Ki kena hoilo (optional)</label>
        <input style={{ width: "100%" }} value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="btn" onClick={add}>Bazar add korun</button>
      </div>

      <div className="card wrap">
        <b>Ei mashe mot bazar: {total} taka</b>
        <table>
          <thead>
            <tr><th>Din</th><th>Ke</th><th>Taka</th><th>Note</th><th></th></tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan="5" className="mu">Ei mashe kono bazar nai</td></tr>
            )}
            {list.map((b) => (
              <tr key={b.id}>
                <td>{b.date.slice(5)}</td>
                <td>{data.members[b.by] ?? "?"}</td>
                <td>{b.amt}</td>
                <td>{b.note}</td>
                <td>
                  <button className="btn x" onClick={() => remove(b.id)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}