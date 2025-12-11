"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Trash2,
  Clock,
  Search,
  X,
  Edit2,
  Check,
  Download,
  Upload,
  AlertCircle,
} from "lucide-react";

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentSidebarProps {
  documents: Document[];
  currentDocId: string | null;
  onDocumentSelect: (doc: Document) => void;
  onDocumentCreate: () => void;
  onDocumentDelete: (id: string) => void;
  onDocumentUpdate?: (id: string, updates: { title?: string }) => void;
  onExport?: () => void;
  onImport?: () => void;
  isGuest?: boolean;
}

export function DocumentSidebar({
  documents,
  currentDocId,
  onDocumentSelect,
  onDocumentCreate,
  onDocumentDelete,
  onDocumentUpdate,
  onExport,
  onImport,
  isGuest = false,
}: DocumentSidebarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [hoveredDocId, setHoveredDocId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Filter documents based on search
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartEdit = (doc: Document) => {
    setEditingId(doc.id);
    setEditTitle(doc.title);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim() && onDocumentUpdate) {
      onDocumentUpdate(id, { title: editTitle.trim() });
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteConfirm({ id, title });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDocumentDelete(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  return (
    <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onDocumentCreate}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          New Document
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Document count */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          {filteredDocuments.length}{" "}
          {filteredDocuments.length === 1 ? "document" : "documents"}
          {searchQuery && ` found`}
        </p>
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8">
            {searchQuery ? (
              <>
                <Search className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  No documents found
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-primary-600 dark:text-primary-400 text-sm mt-2 hover:underline"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  No documents yet
                </p>
                <button
                  onClick={onDocumentCreate}
                  className="text-primary-600 dark:text-primary-400 text-sm mt-2 hover:underline"
                >
                  Create your first
                </button>
              </>
            )}
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                currentDocId === doc.id
                  ? "bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-transparent"
              }`}
              onClick={() => onDocumentSelect(doc)}
              onMouseEnter={() => setHoveredDocId(doc.id)}
              onMouseLeave={() => setHoveredDocId(null)}
            >
              {editingId === doc.id ? (
                // Edit mode
                <div onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(doc.id);
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                    className="w-full px-2 py-1 text-sm font-medium rounded border border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                  />
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={() => handleSaveEdit(doc.id)}
                      className="flex-1 px-2 py-1 rounded bg-primary-600 text-white hover:bg-primary-700 text-xs font-medium"
                    >
                      <Check className="w-3 h-3 mx-auto" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 px-2 py-1 rounded bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-400 dark:hover:bg-slate-500 text-xs font-medium"
                    >
                      <X className="w-3 h-3 mx-auto" />
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 dark:text-slate-50 truncate text-sm">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="w-3 h-3" />
                      {formatDate(doc.updatedAt)}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 transition-opacity flex-shrink-0 ${hoveredDocId === doc.id ? 'opacity-100' : 'opacity-0'}`}>
                    {onDocumentUpdate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(doc);
                        }}
                        className="p-1 rounded hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 transition-colors"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc.id, doc.title);
                      }}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Actions */}
      {(onExport || onImport) && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex gap-2">
            {onExport && (
              <button
                onClick={onExport}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            )}
            {onImport && (
              <button
                onClick={onImport}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-medium"
              >
                <Upload className="w-3.5 h-3.5" />
                Import
              </button>
            )}
          </div>
        </div>
      )}

      {/* Guest Notice */}
      {isGuest && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                Guest Mode
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Documents saved locally only
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/auth/signin")}
            className="w-full text-xs px-3 py-2 rounded-lg bg-amber-600 dark:bg-amber-500 text-white hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors font-medium"
          >
            Sign in to sync across devices
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  Delete Document?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-50">
                    &ldquo;{deleteConfirm.title}&rdquo;
                  </span>
                  ?
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2.5 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600 transition-colors font-medium shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to format dates
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
