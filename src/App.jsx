import { useEffect, useState } from "react";
import useLocalStorage from "./hooks/useLocalStorage";
import Members from "./components/Members";
import Bazar from "./components/Bazar";
import Joma from "./components/Joma";
import Meal from "./components/Meal";
import Hisab from "./components/Hisab";
const initial = {
  members: ["Pronay", "Hasibul", "Mim", "Rabbi bhai", "Tamim", "Aditto"],
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

  useEffect(() => {
    setData((d) => {
      const names = d.members ?? [];
      const isDefaultNames = names.every((name, i) => name === `Member ${i + 1}`);

      return isDefaultNames ? { ...d, members: initial.members } : d;
    });
  }, [setData]);

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

{tab === "meal" && <Meal data={data} setData={setData} />}
{tab === "bazar" && <Bazar data={data} setData={setData} month={month} />}
{tab === "joma" && <Joma data={data} setData={setData} month={month} />}
{tab === "hisab" && <Hisab data={data} month={month} />}
{tab === "mem" && <Members data={data} setData={setData} />}
    </main>
  );
}