"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import type { AdminSource } from "@/lib/types";
import { fetchSources, addSource, deleteSource, getAdminToken } from "@/lib/api";
import adminStyles from "@/styles/admin.module.css";

export default function SourceManager() {
  const [sources, setSources] = useState<AdminSource[]>([]);
  const [url, setUrl] = useState("");
  const [statusText, setStatusText] = useState("");

  const loadSources = useCallback(async () => {
    if (!getAdminToken()) return;
    try {
      setStatusText("Loading sources...");
      const payload = await fetchSources();
      setSources(payload.sources || []);
      setStatusText(`Loaded ${payload.sources?.length || 0} source(s).`);
    } catch (err) {
      setStatusText(`Failed to load sources: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }, []);

  useEffect(() => {
    if (getAdminToken()) loadSources();
  }, [loadSources]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || !getAdminToken()) return;

    try {
      setStatusText("Adding source...");
      const payload = await addSource(trimmed);
      setUrl("");
      setSources(payload.sources || []);
      setStatusText("Source added.");
    } catch (err) {
      setStatusText(`Failed to add source: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  async function handleRemove(id: string) {
    try {
      setStatusText("Removing source...");
      const payload = await deleteSource(id);
      setSources(payload.sources || []);
      setStatusText("Source removed.");
    } catch (err) {
      setStatusText(`Failed to remove source: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  return (
    <>
      <section className={adminStyles.panel}>
        <h2 className={adminStyles.heading2}>Add Source</h2>
        <form className={adminStyles.sourceForm} onSubmit={handleAdd}>
          <input
            type="url"
            placeholder="https://example.com/feed.xml"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button type="submit" className={adminStyles.btn}>
            Add
          </button>
        </form>
        <p className={adminStyles.status}>{statusText}</p>
      </section>

      <section className={adminStyles.panel}>
        <div className={adminStyles.panelTitleRow}>
          <h2 className={adminStyles.heading2}>Configured Sources</h2>
          <button type="button" className={adminStyles.btn} onClick={loadSources}>
            Refresh
          </button>
        </div>
        <ul className={adminStyles.sourcesList}>
          {sources.length === 0 ? (
            <li className={adminStyles.sourceRow}>
              <p className={adminStyles.sourceUrl}>No RSS sources configured.</p>
            </li>
          ) : (
            sources.map((source) => (
              <li key={source.id} className={adminStyles.sourceRow}>
                <p className={adminStyles.sourceUrl}>{source.url}</p>
                <button
                  type="button"
                  className={`${adminStyles.btn} ${adminStyles.deleteBtn}`}
                  onClick={() => handleRemove(source.id)}
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </>
  );
}
