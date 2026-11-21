export default function Hisab({ data, month }) {
  const n = data.members.length;
  const meals = Array(n).fill(0);
  const joma = Array(n).fill(0);
  let totalBazar = 0;

  Object.entries(data.meals).forEach(([date, day]) => {
    if (date.slice(0, 7) !== month) return;
    Object.entries(day).forEach(([i, c]) => {
      if (+i < n) meals[+i] += c[0] + c[1];
    });
  });

  data.bazar.forEach((b) => {
    if (b.date.slice(0, 7) === month) totalBazar += b.amt;
  });

  data.joma.forEach((j) => {
    if (j.date.slice(0, 7) === month && j.by < n) joma[j.by] += j.amt;
  });

  const totalMeal = meals.reduce((a, b) => a + b, 0);
  const rate = totalMeal ? totalBazar / totalMeal : 0;

  return (
    <>
      <h2 style={{ fontSize: "1.1rem", margin: "0 0 10px" }}>Hisab report: {month}</h2>

      <div className="noprint">
        <button className="btn" style={{ margin: "0 0 12px" }} onClick={() => window.print()}>
          Print / PDF
        </button>
      </div>

      <div className="card row">
        <div>
          <div className="mu">Mot bazar</div>
          <div className="big">{totalBazar}</div>
        </div>
        <div>
          <div className="mu">Mot meal</div>
          <div className="big">{totalMeal}</div>
        </div>
        <div>
          <div className="mu">Meal rate</div>
          <div className="big">{rate.toFixed(2)}</div>
        </div>
      </div>

      <div className="card wrap">
        <table>
          <thead>
            <tr>
              <th>Naam</th><th>Meal</th><th>Khoroch</th><th>Joma dise</th><th>Hisab</th>
            </tr>
          </thead>
          <tbody>
            {data.members.map((m, i) => {
              const cost = meals[i] * rate;
              const bal = joma[i] - cost;
              return (
                <tr key={i}>
                  <td>{m}</td>
                  <td>{meals[i]}</td>
                  <td>{cost.toFixed(0)}</td>
                  <td>{joma[i]}</td>
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
      </div>
    </>
  );
}