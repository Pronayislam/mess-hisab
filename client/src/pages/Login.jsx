import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slowServer, setSlowServer] = useState(false);
  const [error, setError] = useState("");

  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setError("");
    setSubmitting(true);
    setSlowServer(false);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSlowServer(true);
    }, 5000);

    try {
      await login(trimmedUser, password);
    } catch (err) {
      setError(err?.message || "Unable to log in. Please try again.");
    } finally {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setSubmitting(false);
      setSlowServer(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center text-2xl text-white shadow-lg shadow-brand-600/25 mb-3">
            🍚
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Mess Hisab
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to view meals, bazar &amp; monthly accounts
          </p>
        </div>

        {/* Login card */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-800">
              Account Login
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="card-body space-y-4" noValidate>
            <div>
              <label htmlFor="username" className="label">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                autoFocus
                className="input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="input pr-16"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={submitting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-medium text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full py-3"
            >
              {submitting && (
                <span
                  className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
                  aria-hidden="true"
                />
              )}
              <span>
                {submitting
                  ? slowServer
                    ? "Waking up server, please wait..."
                    : "Logging in…"
                  : "Login"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
