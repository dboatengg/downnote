"use client";

import Link from "next/link";
import { useTheme } from "@/components/ui/theme-provider";
import { Sun, Moon, FileText } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <span className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            DownNote
          </span>
        </Link>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            )}
          </button>

          {/* Sign In Button (we'll make this functional later) */}
          <Link
            href="/auth/signin"
            className="px-4 py-2 rounded-lg bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium text-sm"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
