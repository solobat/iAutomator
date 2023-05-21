import { useEffect, useState } from "react";

export default function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(
    window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark"
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme)").media !== "not all") {
      window
        .matchMedia("(prefers-color-scheme: light)")
        .addEventListener("change", (e) => {
          setTheme(e.matches ? "light" : "dark");
        });
    }
  }, []);

  return theme;
}
