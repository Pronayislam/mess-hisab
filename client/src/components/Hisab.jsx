import { useState, useEffect } from "react";
import { api } from "../api";

export default function Hisab({ data, month }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!month) return;
    setLoading(true);
    setError("");
    setSummary(null);
    api
      .getSummary(month)
      .then((res) => setSummary(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [month]);

  const totalBazar = summary?.totalBazar ?? 0;
  const totalMeals = summary?.totalMeals ?? 0;
  const mealRate   = summary?.mealRate   ?? 0;
  const members    = summary?.members    ?? [];

  return (
    <>
      <h2 style={{ fontSize: "1.1rem", margin: "0 0 10px" }}>Hisab report: {month}</h2>

      <div className="noprint">
        <button className="btn" style={{ margin: "0 0 12px" }} onClick={() => window.print()}>
          Print / PDF
        </button>
      </div>

      {error && <p style={{ color: "red", marginBottom: "0.75rem" }}>{error}</p>}

      <div className="card row">
        <div>
          <div className="mu">Mot bazar</div>
          <div className="big">{loading ? "…" : totalBazar}</div>
        </div>
        <div>
          <div className="mu">Mot meal</div>
          <div className="big">{loading ? "…" : totalMeals}</div>
        </div>
        <div>
          <div className="mu">Meal rate</div>
          <div className="big">{loading ? "…" : mealRate.toFixed(2)}</div>
        </div>
      </div>

      <div className="card wrap">
        {loading ? (
          <p className="mu">Loading…</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Naam</th><th>Meal</th><th>Khoroch</th><th>Joma dise</th><th>Hisab</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 && (
                  <tr><td colSpan="5" className="mu">Ei mashe kono data nai</td></tr>
                )}
                {members.map((row, i) => {
                  const name = data.members[row.member] ?? row.member;
                  const bal  = row.balance ?? (row.joma - row.cost);
                  return (
                    <tr key={i}>
                      <td>{name}</td>
                      <td>{row.meals}</td>
                      <td>{Number(row.cost).toFixed(0)}</td>
                      <td>{row.joma}</td>
                      <td className={bal >= 0 ? "p" : "d"}>
                        {bal >= 0 ? "Pabe " : "Dibe "}
                        {Math.abs(bal).toFixed(0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mu">Khoroch = meal × rate. Hisab = joma − khoroch.</p>
          </>
        )}
      </div>
    </>
  );
}
