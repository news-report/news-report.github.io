import FeedList from "@/components/FeedList";
import layoutStyles from "@/styles/layout.module.css";

export default function HomePage() {
  return (
    <main className={layoutStyles.shell}>
      <FeedList />
    </main>
  );
}
