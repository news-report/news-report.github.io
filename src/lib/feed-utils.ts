import type { FeedItem, ItemMeta, MediaInfo } from "./types";

export function escapeHtml(text: string): string {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getSizeClass(item: FeedItem, hasImage: boolean): string {
  if (!hasImage) return "";

  const key = item.link || item.date || item.summary || "";
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }

  const variants = ["", "size-large", "size-tall"];
  return variants[Math.abs(hash) % variants.length];
}

export function normalizeUrl(url: string): string {
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("pic.x.com/")) return `https://${url}`;
  return url;
}

function isPicXUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "pic.x.com" ||
      parsed.hostname.endsWith(".pic.x.com")
    );
  } catch {
    return (
      url.startsWith("https://pic.x.com/") ||
      url.startsWith("http://pic.x.com/")
    );
  }
}

export function getMedia(item: FeedItem): MediaInfo {
  const video =
    item.video && item.video.trim() !== ""
      ? normalizeUrl(item.video.trim())
      : "";
  if (video) {
    return { type: "video", url: video };
  }

  const image =
    item.image && item.image.trim() !== ""
      ? normalizeUrl(item.image.trim())
      : "";
  if (image) {
    return { type: "image", url: image };
  }

  const link =
    item.link && item.link.trim() !== ""
      ? normalizeUrl(item.link.trim())
      : "";
  if (isPicXUrl(link)) {
    return { type: "image", url: link };
  }

  return { type: "", url: "" };
}

export function getMediaUrl(item: FeedItem): string {
  return getMedia(item).url;
}

export function getItemKey(item: FeedItem): string {
  if (!item || typeof item !== "object") return "";
  if (typeof item.link === "string" && item.link.trim() !== "")
    return item.link.trim();
  if (typeof item.title === "string" && item.title.trim() !== "")
    return item.title.trim();
  if (typeof item.date === "string" && item.date.trim() !== "")
    return item.date.trim();
  if (typeof item.summary === "string" && item.summary.trim() !== "")
    return item.summary.trim();
  return "";
}

export function dedupeItemsByLink(
  items: FeedItem[],
  existingKeys: Set<string> = new Set(),
): FeedItem[] {
  const seen = new Set(existingKeys);
  return (Array.isArray(items) ? items : []).filter((item) => {
    const key = getItemKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = Math.max(0, now - date.getTime());
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h`;
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}d`;

  return date.toLocaleDateString();
}

export function getMeta(item: FeedItem): ItemMeta {
  const date = item.date ? new Date(item.date) : null;
  const hasValidDate =
    date instanceof Date && !Number.isNaN(date.getTime());

  return {
    authorText: item.author ? item.author : "Unknown",
    timeText: hasValidDate ? formatRelativeTime(date) : "",
  };
}

function cleanText(value: string): string {
  const text = String(value || "")
    .replace(/<[^>]*>/g, " ")
    .trim();
  if (!text) return "";
  return removePicXUrl(text).replace(/\s+/g, " ").trim();
}

function extractPicXUrl(text: string): string {
  if (!text || typeof text !== "string") return "";
  const match = text.match(
    /(?:https?:\/\/)?(?:www\.)?pic\.x\.com\/[A-Za-z0-9_-]+/i,
  );
  return match ? match[0].replace(/^www\./i, "") : "";
}

function removePicXUrl(text: string): string {
  if (!text || typeof text !== "string") return text;
  return text
    .replace(
      /(?:https?:\/\/)?(?:www\.)?pic\.x\.com\/[A-Za-z0-9_-]+/gi,
      "",
    )
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function getSummaryText(item: FeedItem): string {
  const translation = cleanText(item.translation ?? "");
  if (translation) return translation;

  const summary = cleanText(item.summary ?? "");
  if (summary) return summary;

  return "Open article";
}
