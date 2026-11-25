import { useEffect, useState } from "react";
import useLocalStorage from "./hooks/useLocalStorage";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Members from "./components/Members";
import Bazar from "./components/Bazar";
import Joma from "./components/Joma";
import Meal from "./components/Meal";
import Hisab from "./components/Hisab";
import { monthLabel } from "./utils/format";

const initial = {
  members: ["Pronay", "Hasibul", "Mim", "Rabbi bhai", "Tamim", "Aditto"],
  meals: {},
  bazar: [],
  joma: [],
};

const TABS = [
  { id: "meal", label: "Meal", icon: "🍛" },
  { id: "bazar", label: "Bazar", icon: "🛒" },
  { id: "joma", label: "Joma", icon: "💰" },
  { id: "hisab", label: "Hisab", icon: "📊" },
  { id: "mem", label: "Members", icon: "👥" },
];

function FullScreenLoader() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-xl text-white shadow-lg shadow-brand-600/25 mb-4">
        🍚
      </div>
      <div className="flex items-center gap-2.5 text-slate-700 font-medium text-sm">
        <span
          className="inline-block w-4 h-4 border-2 border-brand-600/30 border-t-brand-600 rounded-full animate-spin"
          aria-hidden="true"
        />
        <span>{slow ? "Waking up server, please wait..." : "Restoring session…"}</span>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading, logout, isAdmin } = useAuth();
  const [data, setData] = useLocalStorage("mess_react_v1", initial);
  const [tab, setTab] = useState("meal");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    setData((d) => {
      const names = d.members ?? [];
      const isDefaultNames = names.every((name, i) => name === `Member ${i + 1}`);

      return isDefaultNames ? { ...d, members: initial.members } : d;
    });
  }, [setData]);

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="app-container">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/25 shrink-0">
              🍚
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Mess Hisab
              </h1>
              <p className="text-sm text-slate-500">
                Monthly meal, bazar &amp; expense management
              </p>
            </div>
          </div>

          <div className="no-print flex items-center justify-between sm:justify-end gap-2.5 bg-white border border-slate-200 rounded-2xl px-3.5 py-2 shadow-card">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold text-slate-800 truncate max-w-[140px] sm:max-w-[180px]">
                {user.name || user.username}
              </span>
              <span
                className={
                  isAdmin
                    ? "badge bg-brand-50 text-brand-700 border border-brand-200"
                    : "badge-neutral"
                }
              >
                {isAdmin ? "Admin" : "Member"}
              </span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="btn btn-outline btn-sm shrink-0"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="card mb-6 no-print">
          <div className="card-body">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-4">
                <label className="label">Select Month</label>
                <input
                  type="month"
                  className="input"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </div>
              <div className="sm:col-span-4 sm:text-left">
                <span className="text-sm font-medium text-slate-500 block mb-1">
                  Viewing
                </span>
                <span className="text-base font-semibold text-brand-700">
                  {monthLabel(month)}
                </span>
              </div>
              <div className="sm:col-span-4 flex justify-start sm:justify-end gap-2">
                <button className="btn btn-outline" onClick={() => window.print()}>
                  Print / PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex flex-wrap gap-1.5 mb-6 no-print" aria-label="Sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? "tab-active" : ""}`}
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        <section className="section">
          {tab === "meal" && <Meal data={data} month={month} />}
          {tab === "bazar" && (
            <Bazar data={data} setData={setData} month={month} />
          )}
          {tab === "joma" && (
            <Joma data={data} setData={setData} month={month} />
          )}
          {tab === "hisab" && <Hisab data={data} month={month} />}
          {tab === "mem" && <Members data={data} setData={setData} />}
        </section>
      </div>
    </main>
  );
}
