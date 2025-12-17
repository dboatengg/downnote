"use client";

import { useState, useEffect } from "react";
import {
  History,
  X,
  RotateCcw,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Version {
  id: string;
  title: string;
  createdAt: string;
  charCount: number;
  wordCount: number;
}

interface VersionHistorySidebarProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (versionId: string) => void;
}

export function VersionHistorySidebar({
  documentId,
  isOpen,
  onClose,
  onRestore,
}: VersionHistorySidebarProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch versions when sidebar opens
  useEffect(() => {
    if (isOpen && documentId) {
      fetchVersions();
    }
  }, [isOpen, documentId]);

  const fetchVersions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/documents/${documentId}/versions`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data);
      } else {
        setError("Failed to load version history");
      }
    } catch (err) {
      setError("Failed to load version history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Version History
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
              <button
                onClick={fetchVersions}
                className="mt-4 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No version history yet
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                Versions are created automatically after significant changes
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {index === 0 && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                            Latest
                          </span>
                        )}
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {version.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatDistanceToNow(new Date(version.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <span>{version.wordCount} words</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onRestore(version.id)}
                      disabled={index === 0}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                      title={
                        index === 0
                          ? "This is the current version"
                          : "Restore this version"
                      }
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span className="hidden sm:inline">Restore</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Only the last 20 versions are kept. Restoring a version will save
            your current work first.
          </p>
        </div>
      </div>
    </>
  );
}
