"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("library-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = storedTheme ? storedTheme === "dark" : prefersDark;

    setIsDark(resolved);
    document.documentElement.classList.toggle("dark", resolved);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("library-theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
      aria-label="Toggle dark mode"
    >
      <span className="text-base">{isDark ? "☀️" : "🌙"}</span>
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
