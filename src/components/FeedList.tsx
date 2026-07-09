"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { FeedItem as FeedItemType } from "@/lib/types";
import { fetchFeed } from "@/lib/api";
import { dedupeItemsByLink } from "@/lib/feed-utils";
import Header from "./Header";
import FeedItemCard from "./FeedItem";
import cardsStyles from "@/styles/cards.module.css";
import layoutStyles from "@/styles/layout.module.css";

export default function FeedList() {
  const [items, setItems] = useState<FeedItemType[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [status, setStatus] = useState("Loading...");
  const [updatedText, setUpdatedText] = useState("");
  const nextCursorRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  const loadFeed = useCallback(
    async (options: { force?: boolean; append?: boolean } = {}) => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;

      const { force = false, append = false } = options;
      setStatus(force ? "Refreshing..." : append ? "Loading more..." : "Loading...");

      try {
        const data = await fetchFeed({
          force,
          cursor: append ? nextCursorRef.current ?? "" : "",
        });

        setUpdatedText(
          data.generatedAt
            ? `Updated ${new Date(data.generatedAt).toLocaleString()}`
            : "",
        );

        if (append) {
          setItems((prev) => {
            const existingKeys = new Set(
              prev.map((item) => item.link || item.title || ""),
            );
            return [...prev, ...dedupeItemsByLink(data.items, existingKeys)];
          });
        } else {
          setItems(dedupeItemsByLink(data.items));
        }

        nextCursorRef.current = data.nextCursor;
        setNextCursor(data.nextCursor);
        setStatus("Updated");
      } catch {
        setStatus("Failed to load");
        if (!append) setItems([]);
      }

      isLoadingRef.current = false;
    },
    [],
  );

  useEffect(() => {
    loadFeed({ force: false, append: false });
  }, [loadFeed]);

  const handleRefresh = useCallback(() => {
    nextCursorRef.current = null;
    setNextCursor(null);
    loadFeed({ force: true, append: false });
  }, [loadFeed]);

  const handleLoadMore = useCallback(() => {
    if (!nextCursorRef.current) return;
    loadFeed({ append: true });
  }, [loadFeed]);

  return (
    <>
      <Header status={status} onRefresh={handleRefresh} />

      <div className={layoutStyles.feedMeta}>
        <p className={layoutStyles.updated}>{updatedText}</p>
      </div>

      <ul className={cardsStyles.feedList}>
        {items.length === 0 && status !== "Loading..." && status !== "Loading more..." ? (
          <li className={`${cardsStyles.feedItem} ${cardsStyles.noItems}`}>
            No additional items.
          </li>
        ) : (
          items.map((item, idx) => (
            <FeedItemCard key={item.link || idx} item={item} />
          ))
        )}
      </ul>

      <div className={layoutStyles.feedActions}>
        <button
          type="button"
          className={layoutStyles.loadMore}
          disabled={!nextCursor || isLoadingRef.current}
          onClick={handleLoadMore}
        >
          {nextCursor ? "Load more" : "No more items"}
        </button>
      </div>
    </>
  );
}
