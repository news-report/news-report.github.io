import headerStyles from "@/styles/header.module.css";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  status: string;
  onRefresh: () => void;
}

export default function Header({ status, onRefresh }: HeaderProps) {
  return (
    <header className={headerStyles.masthead}>
      <p className={headerStyles.brand}>News Report</p>
      <div className={headerStyles.mastheadActions}>
        <ThemeToggle />
        <button
          type="button"
          className={headerStyles.refreshBtn}
          onClick={onRefresh}
        >
          Refresh
        </button>
        <span className={headerStyles.status}>{status}</span>
      </div>
    </header>
  );
}
