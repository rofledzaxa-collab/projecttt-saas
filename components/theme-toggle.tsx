"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const d = saved ? saved === "dark" : true;
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <Button variant="ghost" onClick={toggle} aria-label="Toggle theme">
      {dark ? <Sun size={16} /> : <Moon size={16} />}
      <span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span>
    </Button>
  );
}
