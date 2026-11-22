const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Request failed");
  return data;
}

export const api = {
  // Bazar: { by, amt, date, note }
  getBazar: (month) => request(`/bazar?month=${month}`),
  addBazar: (body) => request("/bazar", { method: "POST", body: JSON.stringify(body) }),
  deleteBazar: (id) => request(`/bazar/${id}`, { method: "DELETE" }),

  // Joma: { member, amount, date, note }
  getJoma: (month) => request(`/joma?month=${month}`),
  addJoma: (body) => request("/joma", { method: "POST", body: JSON.stringify(body) }),
  deleteJoma: (id) => request(`/joma/${id}`, { method: "DELETE" }),

  // Meal: { member, date, dupur, rat }
  getMeals: (month) => request(`/meals?month=${month}`),
  saveMeal: (body) => request("/meals", { method: "PUT", body: JSON.stringify(body) }),

  // Summary
  getSummary: (month) => request(`/summary?month=${month}`),
    getDailyMeals: (month) => request(`/summary/daily?month=${month}`),
};