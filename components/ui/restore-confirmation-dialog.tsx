"use client";

import { AlertCircle } from "lucide-react";

interface RestoreConfirmationDialogProps {
  isOpen: boolean;
  versionTitle: string;
  versionDate: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function RestoreConfirmationDialog({
  isOpen,
  versionTitle,
  versionDate,
  onConfirm,
  onCancel,
  loading = false,
}: RestoreConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full mx-4 border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                Restore Version?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Are you sure you want to restore this version?
              </p>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {versionTitle}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {versionDate}
                </p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Don&apos;t worry - your current work will be saved as a version
                before restoring, so you can always undo this action.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Restore Version
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
