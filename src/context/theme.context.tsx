"use client";

import { createContext, useContext } from "react";
import useThemeHook from "@/hooks/theme.hook";

export type ThemeContextType = {
  theme: string;
  toggleTheme: () => void;
};

interface Props {
  children: React.ReactNode;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export function ThemeProvider({ children }: Props) {
  const theme = useThemeHook();

  return (
    <ThemeContext.Provider value={{ ...theme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
