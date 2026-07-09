import { describe, it, expect } from "vitest";
import {
  dedupeItemsByLink,
  formatRelativeTime,
  getMedia,
  getMediaUrl,
  getMeta,
  getSizeClass,
  getSummaryText,
  normalizeUrl,
} from "../src/lib/feed-utils";
import type { FeedItem } from "../src/lib/types";

describe("dedupeItemsByLink", () => {
  it("removes duplicates and skips existing keys", () => {
    const existing = new Set(["https://x.com/existing/status/1"]);
    const items: FeedItem[] = [
      { link: "https://x.com/a/status/1", summary: "first", title: "", date: null, author: null, image: null, video: null, translation: null },
      { link: "https://x.com/a/status/1", summary: "duplicate", title: "", date: null, author: null, image: null, video: null, translation: null },
      { link: "https://x.com/existing/status/1", summary: "already rendered", title: "", date: null, author: null, image: null, video: null, translation: null },
      { link: "https://x.com/b/status/2", summary: "second", title: "", date: null, author: null, image: null, video: null, translation: null },
    ];

    const deduped = dedupeItemsByLink(items, existing);
    expect(deduped).toHaveLength(2);
    expect(deduped[0].link).toBe("https://x.com/a/status/1");
    expect(deduped[1].link).toBe("https://x.com/b/status/2");
  });
});

describe("normalizeUrl", () => {
  it("handles protocol-relative and pic.x.com shorthand", () => {
    expect(normalizeUrl("//cdn.example.com/x.jpg")).toBe("https://cdn.example.com/x.jpg");
    expect(normalizeUrl("pic.x.com/abc123")).toBe("https://pic.x.com/abc123");
    expect(normalizeUrl("https://example.com/a.jpg")).toBe("https://example.com/a.jpg");
  });
});

describe("getMedia", () => {
  it("prefers video over image when both exist", () => {
    const media = getMedia({
      video: "https://video.twimg.com/ext_tw_video/1/pu/vid/avc1/720x1280/test.mp4",
      image: "https://pbs.twimg.com/media/test.jpg",
      title: "", link: "", date: null, author: null, summary: null, translation: null,
    });
    expect(media.type).toBe("video");
    expect(media.url).toBe("https://video.twimg.com/ext_tw_video/1/pu/vid/avc1/720x1280/test.mp4");
  });
});

describe("getMediaUrl", () => {
  it("prioritizes item.image and falls back to pic.x.com link", () => {
    const url1 = getMediaUrl({
      image: "//img.cdn.com/i.jpg", link: "https://pic.x.com/abc",
      title: "", date: null, author: null, summary: null, video: null, translation: null,
    });
    expect(url1).toBe("https://img.cdn.com/i.jpg");

    const url2 = getMediaUrl({
      image: "", link: "pic.x.com/abc",
      title: "", date: null, author: null, summary: null, video: null, translation: null,
    });
    expect(url2).toBe("https://pic.x.com/abc");

    const url3 = getMediaUrl({
      image: "", link: "https://example.com",
      title: "", date: null, author: null, summary: null, video: null, translation: null,
    });
    expect(url3).toBe("");
  });

  it("does not use pic.x.com URL embedded in summary", () => {
    const mediaUrl = getMediaUrl({
      image: "", link: "https://x.com/foo/status/1", summary: "Some update pic.x.com/uwe1b8w4qb",
      title: "", date: null, author: null, video: null, translation: null,
    });
    expect(mediaUrl).toBe("");
  });
});

describe("getSizeClass", () => {
  it("returns only allowed variants", () => {
    const variants = new Set(["", "size-large", "size-tall"]);
    const value = getSizeClass(
      { link: "https://x.com/1", date: "2026-01-01T00:00:00Z", summary: "hello", title: "", author: null, image: null, video: null, translation: null },
      true,
    );
    expect(variants.has(value)).toBe(true);
    expect(getSizeClass({} as FeedItem, false)).toBe("");
  });
});

describe("getMeta", () => {
  it("returns author and relative time text", () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const meta = getMeta({
      author: "x.com", date: oneHourAgo,
      title: "", link: "", summary: null, image: null, video: null, translation: null,
    });
    expect(meta.authorText).toBe("x.com");
    expect(/^[0-9]+h$/.test(meta.timeText)).toBe(true);
  });
});

describe("formatRelativeTime", () => {
  it("handles recent timestamps", () => {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    expect(formatRelativeTime(twoMinutesAgo)).toBe("2m");
  });
});

describe("getSummaryText", () => {
  it("removes embedded pic.x.com URL", () => {
    const summary = getSummaryText({
      summary: "Foreign Minister Abbas Araghchi was scheduled to speak at the Council but his name was removed pic.x.com/l0aKxeXHhK",
      title: "", link: "", date: null, author: null, image: null, video: null, translation: null,
    });
    expect(summary.includes("pic.x.com/l0aKxeXHhK")).toBe(false);
    expect(summary).toBe("Foreign Minister Abbas Araghchi was scheduled to speak at the Council but his name was removed");
  });

  it("prefers translation over summary", () => {
    const summary = getSummaryText({
      summary: "English summary", translation: "\u062E\u0644\u0627\u0635\u0647 \u0641\u0627\u0631\u0633\u06CC",
      title: "", link: "", date: null, author: null, image: null, video: null,
    });
    expect(summary).toBe("\u062E\u0644\u0627\u0635\u0647 \u0641\u0627\u0631\u0633\u06CC");
  });

  it("cleans translated HTML and keeps translated text", () => {
    const summary = getSummaryText({
      summary: "English summary", translation: "<p>  \u062E\u0644\u0627\u0635\u0647 <strong>\u0641\u0627\u0631\u0633\u06CC</strong> </p>",
      title: "", link: "", date: null, author: null, image: null, video: null,
    });
    expect(summary).toBe("\u062E\u0644\u0627\u0635\u0647 \u0641\u0627\u0631\u0633\u06CC");
  });

  it("falls back to summary when translation has no text", () => {
    const summary = getSummaryText({
      summary: "English summary", translation: "<p><br></p>",
      title: "", link: "", date: null, author: null, image: null, video: null,
    });
    expect(summary).toBe("English summary");
  });
});
