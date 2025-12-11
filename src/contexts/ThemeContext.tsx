"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to apply theme to DOM
const applyTheme = (newTheme: Theme) => {
  if (typeof document === "undefined") return;
  
  if (newTheme === "dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    // Get saved theme or system preference
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme ? savedTheme : prefersDark ? "dark" : "light";
    
    // Sync context state with DOM
    setTheme(initialTheme);
    applyTheme(initialTheme);
    localStorage.setItem("theme", initialTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      applyTheme(newTheme);
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
