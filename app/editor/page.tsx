"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { FileText, Plus, Trash2, Clock, PanelLeftClose, PanelLeft } from "lucide-react";
import { extractTitleFromMarkdown } from "@/lib/extract-title";

interface Document {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export default function EditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Show sidebar by default on desktop
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 1024) {
        setShowSidebar(true);
      }
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Create welcome document with markdown guide
  const createWelcomeDocument = useCallback(async () => {
    const welcomeContent = `# Welcome to DownNote! 📝

A beautiful markdown editor with real-time preview.

## Basic Formatting

You can make text **bold**, *italic*, or ***both***.
You can also use ~~strikethrough~~ text.

## Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4

## Lists

### Unordered Lists
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered Lists
1. First step
2. Second step
3. Third step

## Links and Images

[Visit DownNote](https://downnote.app)

![Alt text](https://via.placeholder.com/400x200?text=Sample+Image)

## Code

Inline code: \`const greeting = "Hello World";\`

\`\`\`javascript
// Code block with syntax highlighting
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));
\`\`\`

## Tables

| Feature | Status | Priority |
|---------|--------|----------|
| Markdown | ✅ | High |
| Dark Mode | ✅ | High |
| Auto-save | ✅ | Medium |

## Blockquotes

> "The best way to predict the future is to invent it."
>
> — Alan Kay

## Callouts / Admonitions

> **NOTE**
> This is a note callout. Use it for important information that users should be aware of.

> \`TIP\`
> This is a tip callout. Use it to share helpful advice or best practices.

> ***WARNING***
> This is a warning callout. Use it to alert users about potential issues or important considerations.

> ~~**DANGER**~~
> This is a danger callout. Use it for critical warnings that require immediate attention.

## Task Lists

- [x] Create account
- [x] Write first document
- [ ] Explore all features
- [ ] Share with friends

## Horizontal Rule

---

## Getting Started

1. **Edit Mode** - Write your markdown
2. **Preview Mode** - See the rendered output
3. **Split Mode** - See both side by side (desktop)

Start editing to see your changes in real-time! 🚀`;

    const welcomeDoc: Document = {
      id: `doc-${Date.now()}`,
      title: "Welcome to DownNote",
      content: welcomeContent,
      updatedAt: new Date().toISOString(),
    };

    if (session?.user) {
      // Save to API
      try {
        const response = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: welcomeDoc.title,
            content: welcomeDoc.content,
          }),
        });

        if (response.ok) {
          const savedDoc = await response.json();
          setDocuments([savedDoc]);
          setCurrentDoc(savedDoc);
        }
      } catch (error) {
        console.error("Failed to create welcome document:", error);
      }
    } else {
      // Save to localStorage
      const docs = [welcomeDoc];
      setDocuments(docs);
      setCurrentDoc(welcomeDoc);
      localStorage.setItem("downnote-documents", JSON.stringify(docs));
    }
  }, [session, setDocuments, setCurrentDoc]);

  // Load documents (from localStorage for guests, API for authenticated users)
  useEffect(() => {
    const loadDocuments = async () => {
      if (status === "loading") return;

      if (session?.user) {
        // Load from API for authenticated users
        try {
          const response = await fetch("/api/documents");
          if (response.ok) {
            const docs = await response.json();
            setDocuments(docs);
            if (docs.length > 0) {
              setCurrentDoc(docs[0]);
            } else {
              // Create welcome document for new authenticated users
              createWelcomeDocument();
            }
          }
        } catch (error) {
          console.error("Failed to load documents:", error);
        }
      } else {
        // Load from localStorage for guests
        const saved = localStorage.getItem("downnote-documents");
        if (saved) {
          const docs = JSON.parse(saved);
          setDocuments(docs);
          if (docs.length > 0) {
            setCurrentDoc(docs[0]);
          } else {
            // Create welcome document for new guests
            createWelcomeDocument();
          }
        } else {
          // First time guest - create welcome document
          createWelcomeDocument();
        }
      }
      setLoading(false);
    };

    loadDocuments();
  }, [session, status, createWelcomeDocument]);

  // Create new document
  const createNewDocument = async () => {
    const content = "# Untitled Document\n\nStart writing...";
    const title = extractTitleFromMarkdown(content);

    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title,
      content,
      updatedAt: new Date().toISOString(),
    };

    if (session?.user) {
      // Save to API
      try {
        const response = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
          }),
        });

        if (response.ok) {
          const savedDoc = await response.json();
          setDocuments([savedDoc, ...documents]);
          setCurrentDoc(savedDoc);
        }
      } catch (error) {
        console.error("Failed to create document:", error);
      }
    } else {
      // Save to localStorage
      const updatedDocs = [newDoc, ...documents];
      setDocuments(updatedDocs);
      setCurrentDoc(newDoc);
      localStorage.setItem("downnote-documents", JSON.stringify(updatedDocs));
    }
  };

  // Save document
  const saveDocument = async (content: string) => {
    if (!currentDoc) return;

    // Extract title from markdown content
    const title = extractTitleFromMarkdown(content);

    const updatedDoc = {
      ...currentDoc,
      title,
      content,
      updatedAt: new Date().toISOString(),
    };

    if (session?.user) {
      // Save to API
      try {
        await fetch(`/api/documents/${currentDoc.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
        });

        const updatedDocs = documents.map((doc) =>
          doc.id === currentDoc.id ? updatedDoc : doc
        );
        setDocuments(updatedDocs);
        setCurrentDoc(updatedDoc);
      } catch (error) {
        console.error("Failed to save document:", error);
      }
    } else {
      // Save to localStorage
      const updatedDocs = documents.map((doc) =>
        doc.id === currentDoc.id ? updatedDoc : doc
      );
      setDocuments(updatedDocs);
      setCurrentDoc(updatedDoc);
      localStorage.setItem("downnote-documents", JSON.stringify(updatedDocs));
    }
  };

  // Delete document
  const deleteDocument = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    if (session?.user) {
      // Delete from API
      try {
        await fetch(`/api/documents/${docId}`, {
          method: "DELETE",
        });

        const updatedDocs = documents.filter((doc) => doc.id !== docId);
        setDocuments(updatedDocs);
        if (currentDoc?.id === docId) {
          setCurrentDoc(updatedDocs[0] || null);
        }
      } catch (error) {
        console.error("Failed to delete document:", error);
      }
    } else {
      // Delete from localStorage
      const updatedDocs = documents.filter((doc) => doc.id !== docId);
      setDocuments(updatedDocs);
      if (currentDoc?.id === docId) {
        setCurrentDoc(updatedDocs[0] || null);
      }
      localStorage.setItem("downnote-documents", JSON.stringify(updatedDocs));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading editor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {!isFocusMode && <Header />}

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div className="fixed lg:relative inset-y-0 left-0 z-40 w-64 lg:w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shadow-lg lg:shadow-none">
            {/* Sidebar Header with Toggle */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-slate-50">Documents</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="hidden lg:block p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Hide sidebar"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </div>

            {/* New Document Button */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <button
                onClick={createNewDocument}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                New Document
              </button>
            </div>

            {/* Documents List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {documents.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  No documents yet
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                      currentDoc?.id === doc.id
                        ? "bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500"
                        : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-transparent"
                    }`}
                    onClick={() => setCurrentDoc(doc)}
                  >
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDocument(doc.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Guest Notice */}
            {!session && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-yellow-50 dark:bg-yellow-900/20">
                <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-2">
                  <strong>Guest Mode:</strong> Documents saved locally
                </p>
                <button
                  onClick={() => router.push("/auth/signin")}
                  className="w-full text-xs px-3 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700 transition-colors font-medium"
                >
                  Sign in to sync
                </button>
              </div>
            )}
          </div>
        )}

        {/* Overlay for mobile when sidebar is open */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {currentDoc ? (
            <MarkdownEditor
              key={currentDoc.id}
              initialContent={currentDoc.content}
              onSave={saveDocument}
              autoSave={true}
              onToggleSidebar={() => setShowSidebar(!showSidebar)}
              showSidebar={showSidebar}
              onFocusModeChange={setIsFocusMode}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <FileText className="w-24 h-24 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-2">
                  No Document Selected
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Create a new document or select one from the sidebar
                </p>
                <button
                  onClick={createNewDocument}
                  className="px-6 py-3 rounded-lg bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium"
                >
                  Create Your First Document
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
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
