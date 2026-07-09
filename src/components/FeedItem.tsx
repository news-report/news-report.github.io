import type { FeedItem } from "@/lib/types";
import * as utils from "@/lib/feed-utils";
import cardsStyles from "@/styles/cards.module.css";

interface FeedItemProps {
  item: FeedItem;
}

export default function FeedItem({ item }: FeedItemProps) {
  const media = utils.getMedia(item);
  const hasMedia = media.url !== "";
  const meta = utils.getMeta(item);
  const summaryText = utils.getSummaryText(item);
  const safeTitle = utils.escapeHtml(item.title || "Feed item");
  const sizeClass = utils.getSizeClass(item, hasMedia);

  let mediaElement: React.ReactNode = null;
  if (media.type === "video") {
    mediaElement = (
      <video
        className={cardsStyles.feedItemVideo}
        controls
        playsInline
        preload="metadata"
      >
        <source src={utils.escapeHtml(media.url)} />
      </video>
    );
  } else if (media.url !== "") {
    mediaElement = (
      <img
        src={utils.escapeHtml(media.url)}
        alt={safeTitle}
        className={cardsStyles.feedItemImage}
        loading="lazy"
      />
    );
  }

  const sizeClassStr =
    sizeClass === "size-large"
      ? cardsStyles.sizeLarge
      : sizeClass === "size-tall"
        ? cardsStyles.sizeTall
        : "";

  return (
    <li
      className={`${cardsStyles.feedItem} ${sizeClassStr}`}
      data-item-key={utils.escapeHtml(utils.getItemKey(item))}
    >
      <div className={cardsStyles.feedItemContent}>
        {mediaElement}
        <p className={cardsStyles.summary}>
          {utils.escapeHtml(summaryText)}
        </p>
        {(meta.authorText || meta.timeText) ? (
          <div className={cardsStyles.meta}>
            {meta.authorText ? (
              <span className={cardsStyles.metaAuthor}>
                {utils.escapeHtml(meta.authorText)}
              </span>
            ) : null}
            {meta.authorText && meta.timeText ? (
              <span className={cardsStyles.metaDot}>•</span>
            ) : null}
            {meta.timeText ? (
              <span className={cardsStyles.metaTime}>
                {utils.escapeHtml(meta.timeText)}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  );
}
