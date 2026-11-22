import { useState, useEffect, useCallback } from "react";
import { api } from "../api";

const today = () => new Date().toISOString().slice(0, 10);

// draft is an array parallel to data.members: each slot is [dupur, rat]
const blankDraft = (members) => members.map(() => [0, 0]);

// Convert flat API records (member = NAME string) into draft indexed by position in members[]
function listToDraft(members, records) {
  const draft = blankDraft(members);
  records.forEach((r) => {
    const idx = members.indexOf(r.member); // match by name, not by numeric index
    if (idx !== -1) {
      draft[idx] = [r.dupur ?? 0, r.rat ?? 0];
    }
  });
  return draft;
}

export default function Meal({ data, month }) {
  const [date, setDate] = useState(today());
  const [draft, setDraft] = useState(() => blankDraft(data.members));
  const [saved, setSaved] = useState(false);

  const [records, setRecords] = useState([]);   // flat records for the month (getMeals)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Daily summary state ──────────────────────────────────────────────────
  const [dailyList, setDailyList] = useState([]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyError, setDailyError] = useState("");

  // ── Loaders ──────────────────────────────────────────────────────────────

  const reloadDaily = useCallback(() => {
    if (!month) return;
    setDailyLoading(true);
    setDailyError("");
    api
      .getDailyMeals(month)
      .then((res) => setDailyList(Array.isArray(res) ? res : res.data ?? []))
      .catch((err) => setDailyError(err.message))
      .finally(() => setDailyLoading(false));
  }, [month]);

  const reload = useCallback(
    (currentDate) => {
      if (!month) return;
      setLoading(true);
      setError("");
      api
        .getMeals(month)
        .then((res) => {
          const list = Array.isArray(res) ? res : res.data ?? [];
          setRecords(list);
          // rebuild draft for whichever date is currently selected
          setDraft(listToDraft(data.members, list.filter((r) => r.date === (currentDate ?? date))));
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    },
    [month, date, data.members] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    reload();
    reloadDaily();
  }, [month]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Form helpers ─────────────────────────────────────────────────────────

  function changeDate(d) {
    setDate(d);
    setSaved(false);
    // rebuild draft from already-fetched records – no extra network call
    setDraft(listToDraft(data.members, records.filter((r) => r.date === d)));
  }

  function setCell(i, slot, v) {
    const clamped = Math.min(3, Math.max(0, Number(v)));
    setDraft((dr) =>
      dr.map((c, j) => (j !== i ? c : slot === 0 ? [clamped, c[1]] : [c[0], clamped]))
    );
    setSaved(false);
  }

  function setAll(v) {
    setDraft(data.members.map(() => [v, v]));
    setSaved(false);
  }

  // ── Save ─────────────────────────────────────────────────────────────────

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await Promise.all(
        draft.map((c, i) => {
          const dupur = Math.min(3, Math.max(0, c[0]));
          const rat   = Math.min(3, Math.max(0, c[1]));
          // Send the member's NAME string so the server upserts by name, matching Bazar/Joma
          return api.saveMeal({ member: data.members[i], date, dupur, rat });
        })
      );
      // Optimistic update: replace this date's records with what we just saved
      setRecords((prev) => {
        const next = prev.filter((r) => r.date !== date);
        draft.forEach((c, i) =>
          next.push({ member: data.members[i], date, dupur: c[0], rat: c[1] })
        );
        return next;
      });
      setSaved(true);
      reloadDaily(); // refresh daily count table after every save
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Daily summary helpers ─────────────────────────────────────────────────

  // "Who" string – m.member is a NAME string from the server
  function whoString(members) {
    return members
      .filter((m) => (m.dupur + m.rat) > 0)
      .map((m) => `${m.member} (${m.dupur}+${m.rat})`)
      .join(", ");
  }

  const grandDupur = dailyList.reduce((s, r) => s + (r.dupur ?? 0), 0);
  const grandRat   = dailyList.reduce((s, r) => s + (r.rat   ?? 0), 0);
  const grandTotal = dailyList.reduce((s, r) => s + (r.total ?? 0), 0);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Meal entry card ── */}
      <div className="card">
        <label style={{ marginTop: 0 }}>Tarikh</label>
        <input type="date" value={date} onChange={(e) => changeDate(e.target.value)} />

        {loading ? (
          <p className="mu">Loading…</p>
        ) : (
          <div className="wrap">
            <table>
              <thead>
                <tr><th>Naam</th><th>Dupur</th><th>Rat</th></tr>
              </thead>
              <tbody>
                {data.members.map((m, i) => (
                  <tr key={m}>
                    <td>{m}</td>
                    {[0, 1].map((slot) => (
                      <td key={slot}>
                        <select
                          value={draft[i]?.[slot] ?? 0}
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
        )}

        <p className="mu">0 = meal nai, 1 = normal, 2/3 = beshi (guest ba extra).</p>

        <button className="btn" onClick={save} disabled={saving || loading}>
          {saving ? "Saving…" : "Save korun"}
        </button>{" "}
        <button className="btn" style={{ background: "var(--mu)" }} onClick={() => setAll(1)}>
          Shobar 1+1
        </button>{" "}
        <button className="btn" style={{ background: "var(--mu)" }} onClick={() => setAll(0)}>
          Shobar 0
        </button>{" "}
        {saved && <span className="p">Save hoyeche ✓</span>}
        {error && <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>}
      </div>

      {/* ── Daily meal count card ── */}
      <div className="card wrap">
        <b>Daily meal count</b>

        {dailyError && (
          <p style={{ color: "red", margin: "0.4rem 0" }}>{dailyError}</p>
        )}

        {dailyLoading ? (
          <p className="mu">Loading…</p>
        ) : dailyList.length === 0 ? (
          <p className="mu">Ei mashe kono meal data nai</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Din</th>
                <th>Dupur</th>
                <th>Rat</th>
                <th style={{ fontWeight: "bold", color: "var(--acc, #0070f3)" }}>Total</th>
                <th>Ke khaibe</th>
              </tr>
            </thead>
            <tbody>
              {dailyList
                .slice()
                .sort((a, b) => (a.date < b.date ? -1 : 1))
                .map((row) => (
                  <tr key={row.date}>
                    <td>{row.date.slice(5)}</td>
                    <td>{row.dupur}</td>
                    <td>{row.rat}</td>
                    <td style={{ fontWeight: "bold" }}>{row.total}</td>
                    <td className="mu" style={{ fontSize: "0.82rem" }}>
                      {whoString(row.members ?? [])}
                    </td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid var(--bd, #ddd)" }}>
                <td><b>Mot</b></td>
                <td><b>{grandDupur}</b></td>
                <td><b>{grandRat}</b></td>
                <td style={{ fontWeight: "bold" }}><b>{grandTotal}</b></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </>
  );
}
