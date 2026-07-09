import type {
  FeedResponse,
  SourcesResponse,
  ItemsResponse,
  BackfillResponse,
  TranslateItemResponse,
  FetchFeedOptions,
} from "./types";

const API_URL = "https://irannews-api.mahdibnd.workers.dev/api/feed";

function getAdminBase(): string {
  return `${new URL(API_URL).origin}/api/admin`;
}

export async function fetchFeed(
  options: FetchFeedOptions = {},
): Promise<FeedResponse> {
  const { force = false, cursor = "", limit = 0 } = options;
  const url = new URL(API_URL);

  if (force) url.searchParams.set("refresh", "1");
  if (cursor) url.searchParams.set("cursor", cursor);
  if (limit) url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function adminRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = sessionStorage.getItem("news-report-admin-token") || "";
  const mergedHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const adminBase = getAdminBase();
  const response = await fetch(`${adminBase}${path}`, {
    ...options,
    headers: mergedHeaders,
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.error) message = payload.error;
    } catch { }
    if (response.status === 401) {
      sessionStorage.removeItem("news-report-admin-token");
    }
    throw new Error(message);
  }

  return response.json();
}

export function getAdminToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("news-report-admin-token") || "";
}

export function setAdminToken(token: string): void {
  sessionStorage.setItem("news-report-admin-token", token);
}

export function clearAdminToken(): void {
  sessionStorage.removeItem("news-report-admin-token");
}

export function fetchSources(): Promise<SourcesResponse> {
  return adminRequest<SourcesResponse>("/sources");
}

export function addSource(url: string): Promise<SourcesResponse> {
  return adminRequest<SourcesResponse>("/sources", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export function deleteSource(id: string): Promise<SourcesResponse> {
  return adminRequest<SourcesResponse>(`/sources?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function fetchAdminItems(
  page: number,
  limit: number = 50,
): Promise<ItemsResponse> {
  return adminRequest<ItemsResponse>(
    `/items?limit=${limit}&page=${page}`,
  );
}

export function runBackfill(limit: number): Promise<BackfillResponse> {
  return adminRequest<BackfillResponse>(
    `/translate/backfill?limit=${limit}`,
    { method: "POST" },
  );
}

export function translateItem(
  id: string,
): Promise<TranslateItemResponse> {
  return adminRequest<TranslateItemResponse>(
    `/translate/item?id=${encodeURIComponent(id)}`,
    { method: "POST" },
  );
}
