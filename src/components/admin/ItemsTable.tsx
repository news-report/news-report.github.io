"use client";

import { useState, useEffect, useCallback } from "react";
import type { AdminItem } from "@/lib/types";
import { fetchAdminItems, translateItem, getAdminToken } from "@/lib/api";
import adminStyles from "@/styles/admin.module.css";

const PAGE_SIZE = 50;

function formatRelativeDateShort(input: string): string {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.valueOf())) return "";
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return "now";
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;
  if (diffMs < minute) return "now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h`;
  if (diffMs < month) return `${Math.floor(diffMs / day)}d`;
  if (diffMs < year) return `${Math.floor(diffMs / month)}mo`;
  return `${Math.floor(diffMs / year)}y`;
}

export default function ItemsTable() {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [statusText, setStatusText] = useState("");

  const loadItems = useCallback(async (pageNum: number) => {
    if (!getAdminToken()) return;
    try {
      setStatusText("Loading DB items...");
      const payload = await fetchAdminItems(pageNum, PAGE_SIZE);
      setItems(payload.items || []);
      setPage(payload.page);
      setTotalPages(payload.totalPages);
      setHasPrev(payload.hasPrev);
      setHasNext(payload.hasNext);
      setStatusText(
        `Loaded ${payload.count || 0} item(s) out of ${payload.total || 0}.`,
      );
    } catch (err) {
      setStatusText(
        `Failed to load DB items: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  }, []);

  useEffect(() => {
    if (getAdminToken()) loadItems(1);
  }, [loadItems]);

  async function handleTranslate(itemId: string) {
    try {
      await translateItem(itemId);
      await loadItems(page);
    } catch (err) {
      alert(
        `Translation failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  }

  return (
    <section className={adminStyles.panel}>
      <div className={adminStyles.panelTitleRow}>
        <h2 className={adminStyles.heading2}>Latest DB Items</h2>
        <button
          type="button"
          className={adminStyles.btn}
          onClick={() => loadItems(page)}
        >
          Reload
        </button>
      </div>
      <p className={adminStyles.status}>{statusText}</p>
      <div className={adminStyles.tableWrap}>
        <table className={adminStyles.table}>
          <thead>
            <tr>
              <th>Published</th>
              <th>Title</th>
              <th>Link</th>
              <th>Translation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5}>No items in database.</td>
              </tr>
            ) : (
              items.map((item) => {
                const hasTranslation =
                  String(item.translation ?? "").trim() !== "";
                const hasTranslatableText =
                  String(item.summary ?? "").trim() !== "" ||
                  String(item.title ?? "").trim() !== "";

                return (
                  <tr key={item.id}>
                    <td title={item.published_at || ""}>
                      {formatRelativeDateShort(item.published_at)}
                    </td>
                    <td>{item.title || ""}</td>
                    <td>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open
                      </a>
                    </td>
                    <td
                      className={
                        hasTranslation
                          ? adminStyles.translationText
                          : adminStyles.translationEmpty
                      }
                    >
                      {hasTranslation ? item.translation : "\u2014"}
                    </td>
                    <td>
                      {!hasTranslation && hasTranslatableText ? (
                        <button
                          type="button"
                          className={adminStyles.translateBtn}
                          onClick={() => handleTranslate(item.id)}
                        >
                          Translate
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className={adminStyles.pager}>
        <button
          type="button"
          className={adminStyles.btn}
          disabled={!hasPrev}
          onClick={() => loadItems(page - 1)}
        >
          Prev
        </button>
        <p className={adminStyles.pagerIndicator}>
          Page {page} of {totalPages}
        </p>
        <button
          type="button"
          className={adminStyles.btn}
          disabled={!hasNext}
          onClick={() => loadItems(page + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}
