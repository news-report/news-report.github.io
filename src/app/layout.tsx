import type { ReactNode } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import "@/styles/globals.css";

export const metadata = {
  title: "News Report",
  description: "Curated news feed",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var key = "news-report-theme";
                var stored = localStorage.getItem(key);
                var theme = "light";
                if (stored === "dark" || stored === "light") {
                  theme = stored;
                } else {
                  theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                }
                document.documentElement.setAttribute("data-theme", theme);
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
