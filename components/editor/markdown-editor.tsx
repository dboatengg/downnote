"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { languages } from "@codemirror/language-data";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkEmoji from "remark-emoji";
import remarkAbbr from "@syenchuk/remark-abbr";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import Split from "react-split";
import { useTheme } from "@/components/ui/theme-provider";
import { Eye, Edit, Columns, Download, Save, PanelLeftClose, PanelLeft, Maximize2, Minimize2, FileText, ChevronUp, ChevronDown } from "lucide-react";
import { calculateTextStats, formatReadingTime } from "@/lib/word-count";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";

type ViewMode = "split" | "edit" | "preview";

interface MarkdownEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  autoSave?: boolean;
  onToggleSidebar?: () => void;
  showSidebar?: boolean;
  onFocusModeChange?: (isFocusMode: boolean) => void;
}

export function MarkdownEditor({
  initialContent = "",
  onSave,
  autoSave = true,
  onToggleSidebar,
  showSidebar = true,
  onFocusModeChange,
}: MarkdownEditorProps) {
  const { theme } = useTheme();
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showStats, setShowStats] = useState(() => {
    // Load preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('downnote-show-stats');
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Calculate text statistics
  const stats = calculateTextStats(content);

  // Save stats preference to localStorage
  useEffect(() => {
    localStorage.setItem('downnote-show-stats', JSON.stringify(showStats));
  }, [showStats]);

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

  // Synchronized scrolling between editor and preview
  useEffect(() => {
    if (viewMode !== "split") return;

    const editorEl = editorRef.current;
    const previewEl = previewRef.current;

    if (!editorEl || !previewEl) return;

    let editorScroller: HTMLElement | null = null;
    let isScrolling = false;

    const handleEditorScroll = () => {
      if (isScrolling) return;
      isScrolling = true;

      const percentage = editorScroller!.scrollTop / (editorScroller!.scrollHeight - editorScroller!.clientHeight);
      const targetScroll = percentage * (previewEl.scrollHeight - previewEl.clientHeight);

      if (isFinite(targetScroll)) {
        previewEl.scrollTop = targetScroll;
      }

      requestAnimationFrame(() => {
        isScrolling = false;
      });
    };

    const handlePreviewScroll = () => {
      if (isScrolling) return;
      isScrolling = true;

      const percentage = previewEl.scrollTop / (previewEl.scrollHeight - previewEl.clientHeight);
      const targetScroll = percentage * (editorScroller!.scrollHeight - editorScroller!.clientHeight);

      if (isFinite(targetScroll)) {
        editorScroller!.scrollTop = targetScroll;
      }

      requestAnimationFrame(() => {
        isScrolling = false;
      });
    };

    const timer = setTimeout(() => {
      editorScroller = editorEl.querySelector('.cm-scroller') as HTMLElement;
      if (!editorScroller) return;

      editorScroller.addEventListener("scroll", handleEditorScroll);
      previewEl.addEventListener("scroll", handlePreviewScroll);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (editorScroller) {
        editorScroller.removeEventListener("scroll", handleEditorScroll);
        previewEl.removeEventListener("scroll", handlePreviewScroll);
      }
    };
  }, [viewMode]);


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

  const toggleFocusMode = () => {
    const newFocusMode = !isFocusMode;
    setIsFocusMode(newFocusMode);

    // Notify parent component about focus mode change
    if (onFocusModeChange) {
      onFocusModeChange(newFocusMode);
    }

    // Hide sidebar when entering focus mode, show when exiting
    if (newFocusMode && onToggleSidebar && showSidebar) {
      onToggleSidebar();
    } else if (!newFocusMode && onToggleSidebar && !showSidebar) {
      onToggleSidebar();
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

  // Custom styles for light mode editor text
  const lightModeStyles = theme !== "dark"
    ? EditorView.theme({
        "&": {
          color: "#1e293b", // slate-800
          backgroundColor: "#ffffff",
        },
        ".cm-content": {
          caretColor: "#1e293b",
        },
        "&.cm-focused .cm-cursor": {
          borderLeftColor: "#1e293b",
        },
        "&.cm-focused .cm-selectionBackground, ::selection": {
          backgroundColor: "#bfdbfe", // blue-200
        },
        ".cm-activeLine": {
          backgroundColor: "#f8fafc", // slate-50
        },
        ".cm-activeLineGutter": {
          backgroundColor: "#f1f5f9", // slate-100
        },
        ".cm-gutters": {
          backgroundColor: "#f8fafc",
          color: "#94a3b8", // slate-400
          border: "none",
        },
        ".cm-line": {
          color: "#1e293b", // slate-800 - default text
        },
        // Markdown specific syntax
        ".cm-header": {
          color: "#0f172a", // slate-900 - headers
          fontWeight: "600",
        },
        ".cm-strong": {
          color: "#0f172a", // slate-900 - bold
          fontWeight: "700",
        },
        ".cm-emphasis": {
          color: "#334155", // slate-700 - italic
          fontStyle: "italic",
        },
        ".cm-link": {
          color: "#2563eb", // blue-600 - links
        },
        ".cm-url": {
          color: "#3b82f6", // blue-500 - urls
        },
        ".cm-meta": {
          color: "#64748b", // slate-500 - metadata (like ###)
        },
        ".cm-comment": {
          color: "#64748b", // slate-500 - comments
        },
      })
    : EditorView.theme({});

  return (
    <div className="flex flex-col h-full relative">
      {/* Focus Mode Indicator */}
      {isFocusMode && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-primary-600 dark:bg-primary-500 text-white text-xs font-medium rounded-full shadow-lg">
          <Maximize2 className="w-3 h-3" />
          <span>Focus Mode</span>
          <button
            onClick={toggleFocusMode}
            className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
            title="Exit focus mode"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className={`flex items-center justify-between px-3 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all ${
        isFocusMode ? "opacity-0 h-0 overflow-hidden py-0" : "opacity-100"
      }`}>
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
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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

          {/* Focus Mode Button */}
          <button
            onClick={toggleFocusMode}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
            title="Enter focus mode"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Focus</span>
          </button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
        {viewMode === "split" ? (
          <>
            <Split
              className="flex h-full"
              sizes={[50, 50]}
              minSize={300}
              gutterSize={10}
              direction="horizontal"
              cursor="col-resize"
              gutterStyle={(_dimension, gutterSize) => ({
                backgroundColor: theme === "dark" ? "#1e293b" : "#e2e8f0",
                cursor: "col-resize",
                width: `${gutterSize}px`,
                position: "relative",
              })}
              gutterAlign="center"
            >
            {/* Editor Pane */}
            <div ref={editorRef} className="h-full overflow-auto">
              <CodeMirror
                value={content}
                height="100%"
                theme={editorTheme}
                extensions={[
                  markdown({
                    base: markdownLanguage,
                    codeLanguages: languages,
                  }),
                  EditorView.lineWrapping,
                  lightModeStyles,
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
            <div
              ref={previewRef}
              className="h-full overflow-auto bg-white dark:bg-slate-900 [&::-webkit-scrollbar]:hidden"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <div className="prose prose-slate dark:prose-invert max-w-none p-8">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks, remarkEmoji, remarkAbbr, remarkMath]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeKatex]}
                >
                  {content || "*Start typing to see preview...*"}
                </ReactMarkdown>
              </div>
            </div>
          </Split>
          </>
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
                EditorView.lineWrapping,
                lightModeStyles,
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
                remarkPlugins={[remarkGfm, remarkBreaks, remarkEmoji, remarkAbbr, remarkMath]}
                rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeKatex]}
              >
                {content || "*No content to preview*"}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {!isFocusMode && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between px-3 sm:px-6 py-2">
            {/* Left: Stats */}
            <div className="flex items-center gap-4">
              {showStats ? (
                <>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="font-medium">{stats.words.toLocaleString()}</span>
                    <span className="hidden sm:inline">words</span>
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-600">•</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-medium">{stats.characters.toLocaleString()}</span>
                    <span className="hidden sm:inline"> characters</span>
                    <span className="sm:hidden">ch</span>
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-600 hidden sm:block">•</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block">
                    {formatReadingTime(stats.readingTime)}
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-500 italic">
                  Stats hidden
                </div>
              )}
            </div>

            {/* Right: Toggle & Save Status */}
            <div className="flex items-center gap-3">
              {/* Save Status */}
              {lastSaved && (
                <div className="text-xs text-slate-500 dark:text-slate-500 hidden sm:block">
                  {isSaving ? (
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                      Saving...
                    </span>
                  ) : (
                    <span>Saved {formatTime(lastSaved)}</span>
                  )}
                </div>
              )}

              {/* Stats Toggle Button */}
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={showStats ? "Hide stats" : "Show stats"}
              >
                {showStats ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {showStats ? "Hide" : "Show"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
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
