/**
 * Extracts the first heading from markdown content
 * @param content - The markdown content
 * @returns The extracted title or "Untitled Document" if no heading found
 */
export function extractTitleFromMarkdown(content: string): string {
  if (!content || content.trim() === "") {
    return "Untitled Document";
  }

  // Split content into lines
  const lines = content.split("\n");

  // Find the first line that starts with #
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("#")) {
      // Remove all # characters and whitespace from the beginning
      const title = trimmedLine.replace(/^#+\s*/, "").trim();
      // Return the title if it's not empty
      if (title) {
        return title;
      }
    }
  }

  // If no heading found, return default
  return "Untitled Document";
}
