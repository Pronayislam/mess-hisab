import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatDateShort } from "../utils/format";

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
  const { isAdmin } = useAuth();
  const { addToast } = useToast();
  const [date, setDate] = useState(today());
  const [draft, setDraft] = useState(() => blankDraft(data.members));
  const [saved, setSaved] = useState(false);

  const [records, setRecords] = useState([]); // flat records for the month (getMeals)
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
    if (!isAdmin) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await Promise.all(
        draft.map((c, i) => {
          const dupur = Math.min(3, Math.max(0, c[0]));
          const rat = Math.min(3, Math.max(0, c[1]));
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
      addToast({
        title: "Meal saved",
        message: `Entries for ${formatDateShort(date)} saved successfully.`,
      });
    } catch (err) {
      setError(err.message);
      addToast({ variant: "error", title: "Save failed", message: err.message });
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
  const grandRat = dailyList.reduce((s, r) => s + (r.rat ?? 0), 0);
  const grandTotal = dailyList.reduce((s, r) => s + (r.total ?? 0), 0);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Meal entry card ── */}
      <div className="card section">
        <div className="card-header flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-brand-600">🍛</span>
            <h2 className="text-base font-semibold text-slate-800">Today's Meals</h2>
          </div>
          <div className="flex items-center gap-2">
            <label className="label mb-0">Date</label>
            <input
              type="date"
              className="input w-auto max-w-xs"
              value={date}
              onChange={(e) => changeDate(e.target.value)}
            />
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <span className="text-slate-400 text-sm">Loading meals…</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="w-32">Member</th>
                      <th className="text-center">Lunch</th>
                      <th className="text-center">Dinner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.members.map((m, i) => (
                      <tr key={m} className="group">
                        <td className="font-medium text-slate-700">{m}</td>
                        <td className="text-center">
                          {isAdmin ? (
                            <select
                              className="select w-full text-center bg-white"
                              value={draft[i]?.[0] ?? 0}
                              onChange={(e) => setCell(i, 0, Number(e.target.value))}
                            >
                              {[0, 1, 2, 3].map((n) => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="inline-flex items-center justify-center min-w-[2.5rem] px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700">
                              {draft[i]?.[0] ?? 0}
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          {isAdmin ? (
                            <select
                              className="select w-full text-center bg-white"
                              value={draft[i]?.[1] ?? 0}
                              onChange={(e) => setCell(i, 1, Number(e.target.value))}
                            >
                              {[0, 1, 2, 3].map((n) => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="inline-flex items-center justify-center min-w-[2.5rem] px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700">
                              {draft[i]?.[1] ?? 0}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                0 = no meal · 1 = normal · 2/3 = extra (guest)
              </p>

              {isAdmin && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="btn btn-primary" onClick={save} disabled={saving || loading}>
                    {saving ? "Saving…" : "Save Meals"}
                  </button>
                  <button className="btn btn-outline" onClick={() => setAll(1)} disabled={saving || loading}>
                    Set All 1+1
                  </button>
                  <button className="btn btn-outline" onClick={() => setAll(0)} disabled={saving || loading}>
                    Set All 0
                  </button>
                  {saved && (
                    <span className="mt-1 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                      ✓ Saved
                    </span>
                  )}
                </div>
              )}

              {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
            </>
          )}
        </div>
      </div>

      {/* ── Daily meal count card ── */}
      <div className="card section">
        <div className="card-header">
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <span>📅</span> Daily Meal Count
          </h2>
        </div>
        <div className="card-body p-0">
          {dailyError && (
            <div className="p-4 text-xs text-red-600 bg-red-50 border-b border-red-100">
              {dailyError}
            </div>
          )}

          {dailyLoading ? (
            <div className="px-6 py-4 text-center text-slate-400 text-sm">
              Loading daily counts…
            </div>
          ) : dailyList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <p className="text-sm text-slate-500">No meal data for this month yet.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="w-20">Date</th>
                      <th className="text-center">Lunch</th>
                      <th className="text-center">Dinner</th>
                      <th className="text-right">Total</th>
                      <th>Who</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyList
                      .slice()
                      .sort((a, b) => (a.date < b.date ? -1 : 1))
                      .map((row) => (
                        <tr key={row.date} className="group">
                          <td className="font-medium text-slate-700">{formatDateShort(row.date)}</td>
                          <td className="text-center">{row.dupur}</td>
                          <td className="text-center">{row.rat}</td>
                          <td className="text-right font-semibold text-brand-600">{row.total}</td>
                          <td className="text-xs text-slate-500 max-w-[200px] truncate">
                            {whoString(row.members ?? []) || "—"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold border-t border-slate-200">
                      <td className="text-slate-600">Month total</td>
                      <td className="text-center">{grandDupur}</td>
                      <td className="text-center">{grandRat}</td>
                      <td className="text-right text-brand-700">{grandTotal}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
