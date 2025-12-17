interface VersionDecision {
  shouldCreateVersion: boolean;
  reason:
    | "significant_change"
    | "time_threshold"
    | "no_version_needed"
    | "first_version";
}

/**
 * Determines if a new version should be created based on content changes and time elapsed
 * @param currentContent - The current document content
 * @param lastVersionedContent - The content from the last version (null if no versions exist)
 * @param lastVersionTime - The timestamp of the last version (null if no versions exist)
 * @returns Decision object with shouldCreateVersion flag and reason
 */
export function shouldCreateVersion(
  currentContent: string,
  lastVersionedContent: string | null,
  lastVersionTime: Date | null
): VersionDecision {
  // First version - always create
  if (!lastVersionedContent || !lastVersionTime) {
    return { shouldCreateVersion: true, reason: "first_version" };
  }

  // Calculate character difference
  const charDiff = Math.abs(
    currentContent.length - lastVersionedContent.length
  );

  // Significant change threshold: >100 characters
  if (charDiff > 100) {
    return { shouldCreateVersion: true, reason: "significant_change" };
  }

  // Time threshold: >5 minutes
  const minutesSinceLastVersion =
    (Date.now() - lastVersionTime.getTime()) / 1000 / 60;
  if (
    minutesSinceLastVersion > 5 &&
    currentContent !== lastVersionedContent
  ) {
    return { shouldCreateVersion: true, reason: "time_threshold" };
  }

  return { shouldCreateVersion: false, reason: "no_version_needed" };
}

/**
 * Calculates content statistics for version metadata
 * @param content - The document content
 * @returns Object with character and word count
 */
export function calculateContentStats(content: string) {
  const charCount = content.length;
  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  return { charCount, wordCount };
}
