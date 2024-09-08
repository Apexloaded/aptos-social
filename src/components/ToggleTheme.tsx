"use client";

import useTheme from "@/hooks/theme.hook";
import { Button } from "./ui/button";
import { MoonIcon, SunMoonIcon } from "lucide-react";

export function ToggleTheme() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <Button onClick={toggleTheme} variant={"icon"} size="icon" className="h-9 w-9">
        {theme === "dark" ? (
          <MoonIcon size={20} className="text-dark dark:text-white" />
        ) : (
          <SunMoonIcon size={20} className="text-dark dark:text-white" />
        )}
      </Button>
    </div>
  );
}
