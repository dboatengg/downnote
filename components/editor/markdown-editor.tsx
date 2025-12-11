"use client";

import { useState, useCallback, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { languages } from "@codemirror/language-data";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import Split from "react-split";
import { useTheme } from "@/components/ui/theme-provider";
import { Eye, Edit, Columns, Download, Save, PanelLeftClose, PanelLeft } from "lucide-react";
import "highlight.js/styles/github-dark.css";

type ViewMode = "split" | "edit" | "preview";

interface MarkdownEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  autoSave?: boolean;
  onToggleSidebar?: () => void;
  showSidebar?: boolean;
}

export function MarkdownEditor({
  initialContent = "",
  onSave,
  autoSave = true,
  onToggleSidebar,
  showSidebar = true,
}: MarkdownEditorProps) {
  const { theme } = useTheme();
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Set default view mode based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 768) {
        setViewMode("split");
      } else {
        setViewMode("edit");
      }
    };
    checkScreenSize();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !onSave) return;

    const timer = setTimeout(() => {
      if (content !== initialContent) {
        setIsSaving(true);
        onSave(content);
        setLastSaved(new Date());
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 2000); // Save 2 seconds after user stops typing

    return () => clearTimeout(timer);
  }, [content, autoSave, onSave, initialContent]);

  const handleChange = useCallback((value: string) => {
    setContent(value);
  }, []);

  const handleManualSave = () => {
    if (onSave) {
      setIsSaving(true);
      onSave(content);
      setLastSaved(new Date());
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `document-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const editorTheme = theme === "dark" ? oneDark : undefined;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          {/* Sidebar Toggle */}
          {onToggleSidebar && !showSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Show sidebar"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          )}
          {onToggleSidebar && showSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden"
              title="Hide sidebar"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          )}

          {/* View Mode Toggles */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode("edit")}
              className={`p-2 rounded transition-colors ${
                viewMode === "edit"
                  ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Edit only"
            >
              <Edit className="w-4 h-4" />
            </button>
            {/* Hide split view on mobile (< 768px) */}
            <button
              onClick={() => setViewMode("split")}
              className={`hidden md:block p-2 rounded transition-colors ${
                viewMode === "split"
                  ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Split view"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`p-2 rounded transition-colors ${
                viewMode === "preview"
                  ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Preview only"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Save Status */}
          {lastSaved && (
            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 ml-4">
              {isSaving ? "Saving..." : `Saved ${formatTime(lastSaved)}`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Manual Save Button */}
          <button
            onClick={handleManualSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950">
        {viewMode === "split" ? (
          <Split
            className="flex h-full"
            sizes={[50, 50]}
            minSize={300}
            gutterSize={8}
            gutterStyle={() => ({
              backgroundColor: theme === "dark" ? "#1e293b" : "#e2e8f0",
              cursor: "col-resize",
            })}
          >
            {/* Editor Pane */}
            <div className="h-full overflow-auto">
              <CodeMirror
                value={content}
                height="100%"
                theme={editorTheme}
                extensions={[
                  markdown({
                    base: markdownLanguage,
                    codeLanguages: languages,
                  }),
                ]}
                onChange={handleChange}
                className="h-full text-base"
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightActiveLine: true,
                  foldGutter: true,
                  dropCursor: true,
                  indentOnInput: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  highlightSelectionMatches: true,
                }}
              />
            </div>

            {/* Preview Pane */}
            <div className="h-full overflow-auto bg-white dark:bg-slate-900">
              <div className="prose prose-slate dark:prose-invert max-w-none p-8">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                >
                  {content || "*Start typing to see preview...*"}
                </ReactMarkdown>
              </div>
            </div>
          </Split>
        ) : viewMode === "edit" ? (
          <div className="h-full overflow-auto">
            <CodeMirror
              value={content}
              height="100%"
              theme={editorTheme}
              extensions={[
                markdown({
                  base: markdownLanguage,
                  codeLanguages: languages,
                }),
              ]}
              onChange={handleChange}
              className="h-full text-base"
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightActiveLine: true,
                foldGutter: true,
                dropCursor: true,
                indentOnInput: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                highlightSelectionMatches: true,
              }}
            />
          </div>
        ) : (
          <div className="h-full overflow-auto bg-white dark:bg-slate-900">
            <div className="prose prose-slate dark:prose-invert max-w-none p-8">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
              >
                {content || "*No content to preview*"}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to format relative time
function formatTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return date.toLocaleDateString();
}
