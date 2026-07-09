"use client";

import { useTheme } from "@/context/ThemeContext";
import headerStyles from "@/styles/header.module.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      className={headerStyles.themeToggle}
      onClick={toggleTheme}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
