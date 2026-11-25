const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "mess_token";

let unauthorizedHandler = null;

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors (e.g. private mode or restricted storage)
  }
}

async function request(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Unable to reach the server. Please check your internet connection and try again."
    );
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    if (!path.startsWith("/auth/login")) {
      setStoredToken(null);
      unauthorizedHandler?.();
    }
    throw new Error(data.message || data.error || "Session expired. Please log in again.");
  }

  if (res.status === 403) {
    throw new Error("You don't have permission to do this");
  }

  if (!res.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
}

export const api = {
  // Auth
  login: (usernameOrBody, password) => {
    const body =
      typeof usernameOrBody === "object" && usernameOrBody !== null
        ? usernameOrBody
        : { username: usernameOrBody, password };
    return request("/auth/login", { method: "POST", body: JSON.stringify(body) });
  },
  me: () => request("/auth/me"),

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
