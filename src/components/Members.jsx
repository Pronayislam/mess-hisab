export default function Members({ data, setData }) {
  function rename(i, name) {
    setData((d) => ({
      ...d,
      members: d.members.map((m, j) => (j === i ? name : m)),
    }));
  }

  return (
    <div className="card">
      {data.members.map((m, i) => (
        <div key={i}>
          <label>Member {i + 1}</label>
          <input value={m} onChange={(e) => rename(i, e.target.value)} />
        </div>
      ))}
    </div>
  );
}