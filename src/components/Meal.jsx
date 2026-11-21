import { useState } from "react";

const today = () => new Date().toISOString().slice(0, 10);

export default function Meal({ data, setData }) {
  const load = (d) => data.members.map((_, i) => data.meals[d]?.[i] ?? [1, 1]);

  const [date, setDate] = useState(today());
  const [draft, setDraft] = useState(() => load(today()));
  const [saved, setSaved] = useState(false);

  function changeDate(d) {
    setDate(d);
    setDraft(load(d));
    setSaved(false);
  }

  function setCell(i, slot, v) {
    setDraft((dr) =>
      dr.map((c, j) => (j !== i ? c : slot === 0 ? [v, c[1]] : [c[0], v]))
    );
    setSaved(false);
  }

  function setAll(v) {
    setDraft((dr) => dr.map(() => [v, v]));
    setSaved(false);
  }

  function save() {
    const obj = {};
    draft.forEach((c, i) => (obj[i] = c));
    setData((d) => ({ ...d, meals: { ...d.meals, [date]: obj } }));
    setSaved(true);
  }

  return (
    <div className="card">
      <label style={{ marginTop: 0 }}>Tarikh</label>
      <input type="date" value={date} onChange={(e) => changeDate(e.target.value)} />

      <div className="wrap">
        <table>
          <thead>
            <tr><th>Naam</th><th>Dupur</th><th>Rat</th></tr>
          </thead>
          <tbody>
            {data.members.map((m, i) => (
              <tr key={i}>
                <td>{m}</td>
                {[0, 1].map((slot) => (
                  <td key={slot}>
                    <select
                      value={draft[i]?.[slot] ?? 1}
                      onChange={(e) => setCell(i, slot, Number(e.target.value))}
                    >
                      {[0, 1, 2, 3].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mu">0 = meal nai, 1 = normal, 2/3 = beshi (guest ba extra).</p>

      <button className="btn" onClick={save}>Save korun</button>{" "}
      <button className="btn" style={{ background: "var(--mu)" }} onClick={() => setAll(1)}>
        Shobar 1+1
      </button>{" "}
      <button className="btn" style={{ background: "var(--mu)" }} onClick={() => setAll(0)}>
        Shobar 0
      </button>{" "}
      {saved && <span className="p">Save hoyeche ✓</span>}
    </div>
  );
}