"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/components/ui/theme-provider";
import { Sun, Moon, FileText, LogOut, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignOut = () => {
    setShowSignOutModal(false);
    signOut({ callbackUrl: "/" });
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
          <span className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-slate-50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            DownNote
          </span>
        </Link>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
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

          {/* User Menu */}
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* User Info */}
              <div className="flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    width={24}
                    height={24}
                    alt={session.user.name || "User"}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                )}
                {/* Hide name on mobile, show on sm and up */}
                <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300">
                  {session.user?.name || session.user?.email}
                </span>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={() => setShowSignOutModal(true)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium text-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={() => setShowSignOutModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Sign Out
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to sign out? Any unsaved changes will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600 transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
