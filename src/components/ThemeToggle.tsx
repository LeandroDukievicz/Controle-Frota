"use client";

import { Moon, Sun } from "lucide-react";
import { useStore } from "@/lib/store";

export function ThemeToggle() {
  const { dark, toggleTheme } = useStore();
  return (
    <button type="button" className="icon-btn tap" onClick={toggleTheme} aria-label={dark ? "Tema claro" : "Tema escuro"}>
      {dark ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
    </button>
  );
}
