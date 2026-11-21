import { useState } from "react";
import useLocalStorage from "./hooks/useLocalStorage";
import Members from "./components/Members";
import Bazar from "./components/Bazar";
const initial = {
  members: ["Member 1", "Member 2", "Member 3", "Member 4", "Member 5", "Member 6"],
  meals: {},
  bazar: [],
  joma: [],
};

const TABS = [
  ["meal", "Meal"],
  ["bazar", "Bazar"],
  ["joma", "Joma"],
  ["hisab", "Hisab"],
  ["mem", "Member"],
];

export default function App() {
  const [data, setData] = useLocalStorage("mess_react_v1", initial);
  const [tab, setTab] = useState("meal");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  return (
    <main>
      <h1>🍚 Mess Hisab</h1>

      <div className="card noprint">
        <label style={{ marginTop: 0 }}>Mash</label>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>

      <div className="tabs">
        {TABS.map(([id, label]) => (
          <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

    {tab === "bazar" && <Bazar data={data} setData={setData} month={month} />}
{tab === "mem" && <Members data={data} setData={setData} />}
{!["bazar", "mem"].includes(tab) && (
  <p className="card"> </p>
)}
    </main>
  );
}