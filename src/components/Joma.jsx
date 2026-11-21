import { useState } from "react";

const today = () => new Date().toISOString().slice(0, 10);

export default function Joma({ data, setData, month }) {
  const [date, setDate] = useState(today());
  const [by, setBy] = useState(0);
  const [amt, setAmt] = useState("");

  function add() {
    const a = Number(amt);
    if (!(a > 0)) return;
    setData((d) => ({
      ...d,
      joma: [...d.joma, { id: Date.now(), date, by, amt: a }],
    }));
    setAmt("");
  }

  function remove(id) {
    if (!window.confirm("Delete korben?")) return;
    setData((d) => ({ ...d, joma: d.joma.filter((j) => j.id !== id) }));
  }

  const list = data.joma
    .filter((j) => j.date.slice(0, 7) === month)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const sums = data.members.map((_, i) =>
    list.filter((j) => j.by === i).reduce((s, j) => s + j.amt, 0)
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
              value={amt}
              onChange={(e) => setAmt(e.target.value)}
            />
          </div>
        </div>
        <button className="btn" onClick={add}>Joma add korun</button>
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
        <table>
          <thead>
            <tr><th>Din</th><th>Ke</th><th>Taka</th><th></th></tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan="4" className="mu">Ei mashe kono joma nai</td></tr>
            )}
            {list.map((j) => (
              <tr key={j.id}>
                <td>{j.date.slice(5)}</td>
                <td>{data.members[j.by] ?? "?"}</td>
                <td>{j.amt}</td>
                <td>
                  <button className="btn x" onClick={() => remove(j.id)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}