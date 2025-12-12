"use client";

import Link from "next/link";
import { FileText, Clock, MoreVertical } from "lucide-react";

type Document = {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
};

export function DocumentCard({ doc }: { doc: Document }) {
  const contentPreview = doc.content.slice(0, 150) || "Empty document";
  const lastEdited = new Date(doc.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      new Date(doc.updatedAt).getFullYear() !== new Date().getFullYear()
        ? "numeric"
        : undefined,
  });

  return (
    <Link
      href={`/editor?id=${doc.id}`}
      className="group p-6 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {doc.title}
            </h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
            {contentPreview}
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last edited {lastEdited}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            // TODO: Add document options menu
          }}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical className="w-5 h-5 text-slate-400" />
        </button>
      </div>
    </Link>
  );
}
