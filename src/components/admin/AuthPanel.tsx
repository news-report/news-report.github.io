"use client";

import { useState, type FormEvent } from "react";
import { fetchSources, setAdminToken, clearAdminToken, getAdminToken } from "@/lib/api";
import adminStyles from "@/styles/admin.module.css";

interface AuthPanelProps {
  onUnlock: () => void;
}

export default function AuthPanel({ onUnlock }: AuthPanelProps) {
  const [token, setToken] = useState("");
  const [statusText, setStatusText] = useState(
    getAdminToken() ? "Admin unlocked for this tab session." : "Enter admin token to access this panel.",
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const candidate = token.trim();
    if (!candidate) return;

    setAdminToken(candidate);
    setToken("");

    try {
      await fetchSources();
      setStatusText("Admin unlocked for this tab session.");
      onUnlock();
    } catch (err) {
      clearAdminToken();
      setStatusText(`Auth failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  return (
    <section className={adminStyles.panel}>
      <h2 className={adminStyles.heading2}>Admin Auth</h2>
      <form className={adminStyles.sourceForm} onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter admin token"
          required
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button type="submit" className={adminStyles.btn}>
          Unlock
        </button>
      </form>
      <p className={adminStyles.status}>{statusText}</p>
    </section>
  );
}
