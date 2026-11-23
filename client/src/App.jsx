import { useEffect, useState } from "react";
import useLocalStorage from "./hooks/useLocalStorage";
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

export default function App() {
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

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="app-container">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/25">
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
        </header>

        <div className="card mb-6">
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
              <div className="sm:col-span-4 text-right sm:text-left mt-4 sm:mt-0">
                <span className="text-sm font-medium text-slate-500 block mb-1">
                  Viewing
                </span>
                <span className="text-base font-semibold text-brand-700">
                  {monthLabel(month)}
                </span>
              </div>
              <div className="sm:col-span-4 flex justify-end sm:justify-start gap-2 mt-4 sm:mt-0">
                <button className="btn btn-outline" onClick={() => window.print()}>
                  Print / PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex gap-1 mb-6" aria-label="Sections">
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