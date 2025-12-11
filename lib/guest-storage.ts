export interface GuestDocument {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "downnote-documents";
const STORAGE_VERSION_KEY = "downnote-version";
const CURRENT_VERSION = "1.0";

/**
 * Initialize storage with version check and migration if needed
 */
function initializeStorage(): void {
  try {
    const version = localStorage.getItem(STORAGE_VERSION_KEY);

    if (!version) {
      // First time setup
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
    // Add migration logic here if version changes in future
  } catch (error) {
    console.error("Failed to initialize storage:", error);
  }
}

/**
 * Get all guest documents from localStorage
 */
export function getGuestDocuments(): GuestDocument[] {
  try {
    initializeStorage();
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const documents = JSON.parse(stored);

    // Validate and sort by updatedAt (most recent first)
    return Array.isArray(documents)
      ? documents.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      : [];
  } catch (error) {
    console.error("Failed to get guest documents:", error);
    return [];
  }
}

/**
 * Get a single guest document by ID
 */
export function getGuestDocument(id: string): GuestDocument | null {
  try {
    const documents = getGuestDocuments();
    return documents.find((doc) => doc.id === id) || null;
  } catch (error) {
    console.error("Failed to get guest document:", error);
    return null;
  }
}

/**
 * Create a new guest document
 */
export function createGuestDocument(
  title?: string,
  content?: string
): GuestDocument {
  try {
    const now = new Date().toISOString();
    const newDocument: GuestDocument = {
      id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title || "Untitled Document",
      content: content || "# Untitled Document\n\nStart writing...",
      createdAt: now,
      updatedAt: now,
    };

    const documents = getGuestDocuments();
    const updatedDocuments = [newDocument, ...documents];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocuments));

    return newDocument;
  } catch (error) {
    console.error("Failed to create guest document:", error);
    throw new Error("Failed to create document");
  }
}

/**
 * Update an existing guest document
 */
export function updateGuestDocument(
  id: string,
  updates: Partial<Pick<GuestDocument, "title" | "content">>
): GuestDocument | null {
  try {
    const documents = getGuestDocuments();
    const docIndex = documents.findIndex((doc) => doc.id === id);

    if (docIndex === -1) {
      console.error("Document not found:", id);
      return null;
    }

    const updatedDocument: GuestDocument = {
      ...documents[docIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    documents[docIndex] = updatedDocument;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));

    return updatedDocument;
  } catch (error) {
    console.error("Failed to update guest document:", error);
    return null;
  }
}

/**
 * Delete a guest document
 */
export function deleteGuestDocument(id: string): boolean {
  try {
    const documents = getGuestDocuments();
    const filteredDocuments = documents.filter((doc) => doc.id !== id);

    if (filteredDocuments.length === documents.length) {
      // Document not found
      return false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDocuments));
    return true;
  } catch (error) {
    console.error("Failed to delete guest document:", error);
    return false;
  }
}

/**
 * Clear all guest documents
 */
export function clearGuestDocuments(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (error) {
    console.error("Failed to clear guest documents:", error);
  }
}

/**
 * Export guest documents as JSON
 */
export function exportGuestDocuments(): string {
  try {
    const documents = getGuestDocuments();
    return JSON.stringify(documents, null, 2);
  } catch (error) {
    console.error("Failed to export guest documents:", error);
    return "[]";
  }
}

/**
 * Import guest documents from JSON
 */
export function importGuestDocuments(jsonString: string): boolean {
  try {
    const imported = JSON.parse(jsonString);

    if (!Array.isArray(imported)) {
      throw new Error("Invalid import format");
    }

    // Validate each document has required fields
    const validDocuments = imported.filter(
      (doc) =>
        doc.id &&
        doc.title &&
        doc.content !== undefined &&
        doc.createdAt &&
        doc.updatedAt
    );

    if (validDocuments.length === 0) {
      throw new Error("No valid documents found in import");
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(validDocuments));
    return true;
  } catch (error) {
    console.error("Failed to import guest documents:", error);
    return false;
  }
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): {
  used: number;
  total: number;
  percentage: number;
  documentCount: number;
} {
  try {
    const documents = getGuestDocuments();
    const stored = localStorage.getItem(STORAGE_KEY) || "[]";
    const usedBytes = new Blob([stored]).size;
    const totalBytes = 5 * 1024 * 1024; // 5MB typical localStorage limit

    return {
      used: usedBytes,
      total: totalBytes,
      percentage: (usedBytes / totalBytes) * 100,
      documentCount: documents.length,
    };
  } catch (error) {
    console.error("Failed to get storage info:", error);
    return {
      used: 0,
      total: 5 * 1024 * 1024,
      percentage: 0,
      documentCount: 0,
    };
  }
}
