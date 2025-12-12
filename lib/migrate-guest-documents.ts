import { getGuestDocuments } from "./guest-storage";

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
}

// The default welcome note content - if guest doc matches this, it hasn't been edited
const DEFAULT_WELCOME_CONTENT_START = `# Welcome to DownNote! 📝

A beautiful markdown editor with real-time preview.

## Basic Formatting`;

/**
 * Check if a document is the unmodified default welcome note
 */
function isDefaultWelcomeNote(doc: { title: string; content: string }): boolean {
  return (
    doc.title === "Welcome to DownNote" &&
    doc.content.startsWith(DEFAULT_WELCOME_CONTENT_START)
  );
}

/**
 * Migrates guest documents from localStorage to the database
 * when a user signs in for the first time
 * Only migrates documents that have been modified from the default welcome note
 */
export async function migrateGuestDocuments(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    errors: [],
  };

  try {
    // Get all guest documents from localStorage
    const guestDocs = getGuestDocuments();

    if (guestDocs.length === 0) {
      return result;
    }

    // Filter out unmodified default welcome notes
    const docsToMigrate = guestDocs.filter(doc => !isDefaultWelcomeNote(doc));

    if (docsToMigrate.length === 0) {
      // All documents are unmodified welcome notes, just clear them
      localStorage.removeItem("downnote-documents");
      return result;
    }

    // Upload each document to the API
    for (const doc of docsToMigrate) {
      try {
        const response = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: doc.title,
            content: doc.content,
          }),
        });

        if (response.ok) {
          result.migratedCount++;
        } else {
          result.errors.push(`Failed to migrate: ${doc.title}`);
          result.success = false;
        }
      } catch (error) {
        result.errors.push(`Error migrating ${doc.title}: ${error}`);
        result.success = false;
      }
    }

    // If migration was successful, clear guest documents from localStorage
    if (result.success) {
      localStorage.removeItem("downnote-documents");
    }

    return result;
  } catch (error) {
    result.success = false;
    result.errors.push(`Migration failed: ${error}`);
    return result;
  }
}

/**
 * Check if there are guest documents that need migration
 */
export function hasGuestDocuments(): boolean {
  if (typeof window === "undefined") return false;
  const guestDocs = getGuestDocuments();
  return guestDocs.length > 0;
}
