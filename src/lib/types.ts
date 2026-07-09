export interface FeedItem {
  title: string;
  link: string;
  date: string | null;
  author: string | null;
  summary: string | null;
  image: string | null;
  video: string | null;
  translation: string | null;
}

export interface FeedResponse {
  generatedAt: string;
  count: number;
  items: FeedItem[];
  nextCursor: string | null;
}

export interface AdminSource {
  id: string;
  url: string;
  createdAt: string;
}

export interface SourcesResponse {
  sources: AdminSource[];
}

export interface AdminItem {
  id: string;
  source: string;
  title: string;
  link: string;
  published_at: string;
  author: string;
  summary: string;
  image: string;
  video: string;
  translation: string | null;
  created_at: string;
}

export interface ItemsResponse {
  count: number;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  items: AdminItem[];
}

export interface BackfillResponse {
  ok: boolean;
  limit: number;
  translated: number;
  completed: boolean;
  timedOut: boolean;
}

export interface TranslateItemResponse {
  ok: boolean;
  id: string;
  translated: boolean;
  error?: string;
}

export type MediaType = "video" | "image" | "";

export interface MediaInfo {
  type: MediaType;
  url: string;
}

export interface ItemMeta {
  authorText: string;
  timeText: string;
}

export interface FetchFeedOptions {
  force?: boolean;
  cursor?: string;
  limit?: number;
}
