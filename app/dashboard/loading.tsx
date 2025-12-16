import { Header } from "@/components/ui/header";
import { FileText, Plus, Clock } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-primary-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <Header />

      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          {/* Greeting Section Skeleton */}
          <div className="space-y-2">
            <div className="h-12 sm:h-14 md:h-16 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse w-3/4 max-w-md" />
            <div className="h-6 sm:h-7 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse w-1/2 max-w-xs" />
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-8 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Plus className="w-7 h-7" />
                </div>
                <span className="text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  Quick Start
                </span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">New Document</h3>
              <p className="text-primary-100">
                Start writing a fresh markdown document
              </p>
            </div>

            <div className="p-8 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <Clock className="w-7 h-7" />
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Coming Soon
                </span>
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                Recent Documents
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Access your recently edited files
              </p>
            </div>
          </div>

          {/* Documents Section Skeleton */}
          <div className="mt-8 sm:mt-12">
            <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-50">
                Your Documents
              </h2>
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            </div>

            {/* Document Cards Skeleton */}
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-2/3" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/3" />
                      <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-full" />
                    </div>
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
