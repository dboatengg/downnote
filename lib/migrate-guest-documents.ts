import { getGuestDocuments } from "./guest-storage";

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
}

/**
 * Migrates guest documents from localStorage to the database
 * when a user signs in for the first time
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

    // Upload each document to the API
    for (const doc of guestDocs) {
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
    if (result.success && result.migratedCount > 0) {
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
