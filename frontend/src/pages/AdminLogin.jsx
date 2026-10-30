import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { hasToken, api, saveToken } from "../utils/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (hasToken()) return <Navigate to="/admin/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { token } = await api.post("/auth/login", { username, password });
      saveToken(token);
      navigate("/admin/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-line bg-panel p-8"
      >
      <Link
        to="/"
        className="action-button mb-6 rounded-full border border-line px-4 py-2 text-sm text-neutral-300"
      >
        Back to Home Page
      </Link>
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Private area</p>
        <h1 className="mt-2 text-2xl font-semibold">Admin sign in</h1>
        <label className="mt-7 block text-sm text-neutral-300">
          Username
          <input
            autoComplete="username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-2 w-full rounded-xl border border-line bg-canvas px-4 py-3 outline-none focus:border-neutral-500"
          />
        </label>
        <label className="mt-4 block text-sm text-neutral-300">
          Password
          <input
            autoComplete="current-password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-line bg-canvas px-4 py-3 outline-none focus:border-neutral-500"
          />
        </label>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="action-button action-button-primary mt-6 w-full rounded-xl px-4 py-3 font-semibold"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
