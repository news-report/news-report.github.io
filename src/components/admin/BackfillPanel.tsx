"use client";

import { useState, type FormEvent } from "react";
import { runBackfill, getAdminToken } from "@/lib/api";
import adminStyles from "@/styles/admin.module.css";

interface BackfillPanelProps {
  onBackfillDone: () => void;
}

const DEFAULT_LIMIT = 50;

export default function BackfillPanel({ onBackfillDone }: BackfillPanelProps) {
  const [limit, setLimit] = useState(String(DEFAULT_LIMIT));
  const [statusText, setStatusText] = useState(
    getAdminToken() ? "Ready. Choose row count and run." : "Admin token required.",
  );
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!getAdminToken()) return;

    const parsed = Math.min(Math.max(Number.parseInt(limit, 10) || DEFAULT_LIMIT, 1), 300);
    setLimit(String(parsed));

    try {
      setBusy(true);
      setStatusText(`Running backfill for up to ${parsed} row(s)...`);
      const payload = await runBackfill(parsed);
      setStatusText(
        `Backfill done. Translated ${payload.translated || 0} row(s) (limit ${payload.limit || parsed}).`,
      );
      onBackfillDone();
    } catch (err) {
      setStatusText(`Backfill failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={adminStyles.panel}>
      <h2 className={adminStyles.heading2}>Translation Backfill</h2>
      <form
        className={`${adminStyles.sourceForm} ${adminStyles.backfillForm}`}
        onSubmit={handleSubmit}
      >
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={300}
          step={1}
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          required
        />
        <button
          type="submit"
          className={adminStyles.btn}
          disabled={busy || !getAdminToken()}
        >
          {busy ? "Running..." : "Run Backfill"}
        </button>
      </form>
      <p className={adminStyles.hint}>
        Translates DB rows with empty translation only. Max 300 per run.
      </p>
      <p className={adminStyles.status}>{statusText}</p>
    </section>
  );
}
