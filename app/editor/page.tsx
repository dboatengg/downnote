"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/ui/header";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { DocumentSidebar } from "@/components/ui/document-sidebar";
import type { Document } from "@/components/ui/document-sidebar";
import {
  getGuestDocuments,
  createGuestDocument,
  updateGuestDocument,
  deleteGuestDocument,
  exportGuestDocuments,
  importGuestDocuments,
  getStorageInfo,
} from "@/lib/guest-storage";
import { FileText, AlertTriangle } from "lucide-react";
import { extractTitleFromMarkdown } from "@/lib/extract-title";
import { toast } from "sonner";
import { migrateGuestDocuments, hasGuestDocuments } from "@/lib/migrate-guest-documents";

function EditorContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ percentage: 0 });
  const [isCreating, setIsCreating] = useState(false);
  const [initialDocumentSelected, setInitialDocumentSelected] = useState(false);

  const isGuest = !session?.user;

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

    const now = new Date().toISOString();
    const welcomeDoc: Document = {
      id: `doc-${Date.now()}`,
      title: "Welcome to DownNote",
      content: welcomeContent,
      createdAt: now,
      updatedAt: now,
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
      // Save using guest storage
      const docs = [welcomeDoc];
      setDocuments(docs);
      setCurrentDoc(welcomeDoc);
      localStorage.setItem("downnote-documents", JSON.stringify(docs));
    }
  }, [session]);

  // Load documents (from localStorage for guests, API for authenticated users)
  useEffect(() => {
    const loadDocuments = async () => {
      if (status === "loading") return;

      try {
        if (session?.user) {
          // Check if we have guest documents to potentially migrate
          const hasGuest = hasGuestDocuments();

          // Migrate guest documents if any exist
          // The migration function will skip unmodified default welcome notes
          if (hasGuest) {
            const result = await migrateGuestDocuments();

            if (result.success && result.migratedCount > 0) {
              toast.success(`Successfully migrated ${result.migratedCount} document${result.migratedCount > 1 ? 's' : ''} from guest mode!`);
            } else if (result.errors.length > 0) {
              toast.error("Some documents failed to migrate. Please contact support.");
              console.error("Migration errors:", result.errors);
            }
          }

          // Load from API for authenticated users
          const response = await fetch("/api/documents");
          if (response.ok) {
            const docs = await response.json();
            setDocuments(docs);

            // Initial document selection will be handled by the separate useEffect
            // that watches for URL parameter changes
            if (docs.length === 0) {
              // Create welcome document for new authenticated users
              createWelcomeDocument();
            }
          } else {
            toast.error("Failed to load documents");
          }
        } else {
          // Load from guest storage
          const docs = getGuestDocuments();
          setDocuments(docs);
          if (docs.length > 0) {
            setCurrentDoc(docs[0]);
          } else {
            // Create welcome document for new guests
            createWelcomeDocument();
          }

          // Check storage usage
          const info = getStorageInfo();
          setStorageInfo(info);

          if (info.percentage > 80) {
            toast.warning("Storage almost full! Consider signing in for unlimited storage.");
          }
        }
      } catch (error) {
        console.error("Failed to load documents:", error);
        toast.error("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [session, status, createWelcomeDocument]);

  // Handle URL parameter changes to select the correct document
  useEffect(() => {
    if (documents.length === 0 || loading) return;

    const docId = searchParams.get("id");
    console.log("URL changed - Document ID:", docId);
    console.log("Available documents:", documents.map((d) => ({ id: d.id, title: d.title })));

    if (docId) {
      // URL has a specific document ID - try to select it
      const targetDoc = documents.find((d) => d.id === docId);
      console.log("Selecting document from URL:", targetDoc);
      if (targetDoc && targetDoc.id !== currentDoc?.id) {
        setCurrentDoc(targetDoc);
        setInitialDocumentSelected(true);
      } else if (!targetDoc) {
        console.log("Document not found in URL, selecting first document");
        setCurrentDoc(documents[0]);
        setInitialDocumentSelected(true);
      }
    } else if (!currentDoc) {
      // No URL parameter and no current doc - select first document
      console.log("No URL parameter, selecting first document");
      setCurrentDoc(documents[0]);
      setInitialDocumentSelected(true);
    } else {
      // Current doc is already set, mark as initialized
      setInitialDocumentSelected(true);
    }
  }, [searchParams, documents, currentDoc, loading]);

  // Create new document
  const createNewDocument = useCallback(async () => {
    setIsCreating(true);
    try {
      if (session?.user) {
        // Create via API
        const response = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Untitled Document",
            content: "# Untitled Document\n\nStart writing...",
          }),
        });

        if (response.ok) {
          const newDoc = await response.json();
          setDocuments([newDoc, ...documents]);
          setCurrentDoc(newDoc);
          toast.success("Document created");
        } else {
          toast.error("Failed to create document");
        }
      } else {
        // Create in guest storage
        const newDoc = createGuestDocument();
        const updatedDocs = [newDoc, ...documents];
        setDocuments(updatedDocs);
        setCurrentDoc(newDoc);

        // Update storage info
        const info = getStorageInfo();
        setStorageInfo(info);

        toast.success("Document created");
      }
    } catch (error) {
      console.error("Failed to create document:", error);
      toast.error("Failed to create document");
    } finally {
      setIsCreating(false);
    }
  }, [session, documents]);

  // Update document
  const handleUpdateDocument = useCallback(
    async (id: string, updates: { title?: string; content?: string }) => {
      try {
        if (session?.user) {
          // Update via API
          const response = await fetch(`/api/documents/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });

          if (response.ok) {
            const updatedDoc = await response.json();
            setDocuments(
              documents.map((doc) => (doc.id === id ? updatedDoc : doc))
            );
            if (currentDoc?.id === id) {
              setCurrentDoc(updatedDoc);
            }
          } else {
            toast.error("Failed to update document");
          }
        } else {
          // Update in guest storage
          const updatedDoc = updateGuestDocument(id, updates);
          if (updatedDoc) {
            const updatedDocs = documents.map((doc) =>
              doc.id === id ? updatedDoc : doc
            );
            setDocuments(updatedDocs);
            if (currentDoc?.id === id) {
              setCurrentDoc(updatedDoc);
            }
          }
        }
      } catch (error) {
        console.error("Failed to update document:", error);
        toast.error("Failed to update document");
      }
    },
    [session, documents, currentDoc]
  );

  // Save document content
  const saveDocument = useCallback(
    async (content: string) => {
      if (!currentDoc) return;

      // Extract title from markdown content
      const title = extractTitleFromMarkdown(content);

      await handleUpdateDocument(currentDoc.id, { content, title });
    },
    [currentDoc, handleUpdateDocument]
  );

  // Delete document
  const handleDeleteDocument = useCallback(
    async (id: string) => {
      try {
        if (session?.user) {
          // Delete via API
          const response = await fetch(`/api/documents/${id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            const updatedDocs = documents.filter((doc) => doc.id !== id);
            setDocuments(updatedDocs);
            if (currentDoc?.id === id) {
              setCurrentDoc(updatedDocs[0] || null);
            }
            toast.info("Document deleted");
          } else {
            toast.error("Failed to delete document");
          }
        } else {
          // Delete from guest storage
          const success = deleteGuestDocument(id);
          if (success) {
            const updatedDocs = documents.filter((doc) => doc.id !== id);
            setDocuments(updatedDocs);
            if (currentDoc?.id === id) {
              setCurrentDoc(updatedDocs[0] || null);
            }

            // Update storage info
            const info = getStorageInfo();
            setStorageInfo(info);

            toast.info("Document deleted");
          } else {
            toast.error("Failed to delete document");
          }
        }
      } catch (error) {
        console.error("Failed to delete document:", error);
        toast.error("Failed to delete document");
      }
    },
    [session, documents, currentDoc]
  );

  // Export documents
  const handleExport = useCallback(() => {
    try {
      const json = exportGuestDocuments();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `downnote-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Documents exported");
    } catch (error) {
      console.error("Failed to export:", error);
      toast.error("Failed to export documents");
    }
  }, []);

  // Import documents
  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const success = importGuestDocuments(text);

        if (success) {
          const docs = getGuestDocuments();
          setDocuments(docs);
          if (docs.length > 0) {
            setCurrentDoc(docs[0]);
          }
          toast.success("Documents imported");
        } else {
          toast.error("Invalid import file");
        }
      } catch (error) {
        console.error("Failed to import:", error);
        toast.error("Failed to import documents");
      }
    };
    input.click();
  }, []);

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
          <div className="fixed lg:relative inset-y-0 left-0 z-40 shadow-lg lg:shadow-none">
            <DocumentSidebar
              documents={documents}
              currentDocId={currentDoc?.id || null}
              onDocumentSelect={setCurrentDoc}
              onDocumentCreate={createNewDocument}
              onDocumentDelete={handleDeleteDocument}
              onDocumentUpdate={(id, updates) => handleUpdateDocument(id, updates)}
              onExport={isGuest ? handleExport : undefined}
              onImport={isGuest ? handleImport : undefined}
              isGuest={isGuest}
              isCreating={isCreating}
            />
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
          {loading || !initialDocumentSelected ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="w-16 h-16 border-4 border-primary-600 dark:border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">Loading document...</p>
              </div>
            </div>
          ) : currentDoc ? (
            <>
              {/* Storage warning for guests */}
              {isGuest && storageInfo.percentage > 80 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-6 py-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        Storage {storageInfo.percentage.toFixed(0)}% full
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                        Sign in to get unlimited storage and sync across devices
                      </p>
                    </div>
                    <button
                      onClick={() => router.push("/auth/signin")}
                      className="px-4 py-2 rounded-lg bg-amber-600 dark:bg-amber-500 text-white hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors text-sm font-medium flex-shrink-0"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}

              <MarkdownEditor
                key={currentDoc.id}
                initialContent={currentDoc.content}
                onSave={saveDocument}
                autoSave={true}
                onToggleSidebar={() => setShowSidebar(!showSidebar)}
                showSidebar={showSidebar}
                onFocusModeChange={setIsFocusMode}
              />
            </>
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
                  className="px-6 py-3 rounded-lg bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium shadow-sm"
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

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 dark:border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading editor...</p>
        </div>
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
