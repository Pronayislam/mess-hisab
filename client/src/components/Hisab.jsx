import { useState, useEffect } from "react";
import { api } from "../api";
import { useToast } from "../context/ToastContext";
import { formatTaka, formatCompact } from "../utils/format";

export default function Hisab({ data, month }) {
  const { addToast } = useToast();
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
      .then((res) => {
        setSummary(res);
        addToast({ title: "Hisab refreshed", message: "Settlement report for " + new Date(month + "-01").toLocaleDateString(undefined, { month: "long", year: "numeric" }) });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [month, addToast]);

  const totalBazar = summary?.totalBazar ?? 0;
  const totalMeals = summary?.totalMeals ?? 0;
  const mealRate = summary?.mealRate ?? 0;
  const members = summary?.members ?? [];

  return (
    <div className="section">
      <div className="section-header">
        <div className="flex items-center gap-2">
          <span className="text-brand-600">📊</span>
          <h2 className="text-base font-semibold text-slate-800">Settlement Report</h2>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => window.print()}
          title="Print / PDF"
        >
          Print / PDF
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 mb-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="stat-label">Total Bazar</div>
          <div className="stat-value">{formatTaka(totalBazar)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Meals</div>
          <div className="stat-value">{formatCompact(totalMeals)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Meal Rate</div>
          <div className="stat-value">{formatTaka(mealRate)}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-32">Member</th>
                  <th className="text-center">Meals</th>
                  <th className="text-right">Cost</th>
                  <th className="text-right">Paid</th>
                  <th className="text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-400">
                      Calculating settlement…
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-400">
                      No settlement data for this month yet.
                    </td>
                  </tr>
                ) : (
                  members.map((row, i) => {
                    const name = data.members[row.member] ?? row.member;
                    const bal = row.balance ?? (row.joma - row.cost);
                    const owed = Number(row.cost).toFixed(0);
                    const paid = Number(row.joma ?? 0).toFixed(0);
                    const isCredit = bal >= 0;
                    return (
                      <tr key={i} className="group">
                        <td className="font-medium text-slate-700">{name}</td>
                        <td className="text-center">{row.meals}</td>
                        <td className="text-right text-slate-600">{formatTaka(row.cost ?? 0)}</td>
                        <td className="text-right text-slate-600">{paid}</td>
                        <td className={`text-right font-semibold ${isCredit ? "text-green-700" : "text-red-700"}`}>
                          {isCredit ? "Receives " : "Pays "}
                          {formatTaka(Math.abs(bal))}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t border-slate-200">
                  <td className="text-slate-600">Net</td>
                  <td className="text-center">{formatCompact(totalMeals)} meals</td>
                  <td className="text-right text-slate-600">{formatTaka(totalBazar)}</td>
                  <td className="text-right text-slate-600"></td>
                  <td className="text-right text-slate-600"></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mx-6 mt-3 mb-6 text-xs text-slate-500">
            Cost = meals × meal rate · Balance = paid − cost. Green = member receives money, red = member pays.
          </p>
        </div>
      </div>
    </div>
  );
}
