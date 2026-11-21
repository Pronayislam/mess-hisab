import { useState } from "react";

export default function Members({ data, setData }) {
  const [text, setText] = useState("");

  function rename(i, name) {
    setData((d) => ({
      ...d,
      members: d.members.map((m, j) => (j === i ? name : m)),
    }));
  }

  function restore() {
    try {
      const o = JSON.parse(text);
      if (!Array.isArray(o.members) || !o.meals || !Array.isArray(o.bazar)) throw new Error();
      if (!window.confirm("Ekhonkar shob data muche backup er data boshbe. Thik ache?")) return;
      setData({ ...o, joma: o.joma || [] });
      setText("");
      alert("Restore hoyeche");
    } catch {
      alert("Backup text ta thik nai");
    }
  }

  return (
    <>
      <div className="card">
        {data.members.map((m, i) => (
          <div key={i}>
            <label>Member {i + 1}</label>
            <input value={m} onChange={(e) => rename(i, e.target.value)} />
          </div>
        ))}
        <p className="mu">Naam bodle nile auto save hoy.</p>
      </div>

      <div className="card">
        <b>Backup</b>
        <p className="mu">Nicher text ta copy kore Notes ba WhatsApp e rakho.</p>
        <textarea
          readOnly
          rows="4"
          style={{ width: "100%" }}
          value={JSON.stringify(data)}
          onClick={(e) => e.target.select()}
        />
        <label>Restore: backup text ekhane paste koro</label>
        <textarea
          rows="4"
          style={{ width: "100%" }}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn" onClick={restore}>Restore korun</button>
      </div>
    </>
  );
}