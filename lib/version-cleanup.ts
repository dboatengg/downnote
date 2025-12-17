import { prisma } from "@/lib/prisma";

/**
 * Cleans up old versions for a document, keeping only the most recent N versions
 * @param documentId - The document ID to cleanup versions for
 * @param retentionCount - Number of versions to keep (default: 20)
 */
export async function cleanupOldVersions(
  documentId: string,
  retentionCount: number = 20
): Promise<void> {
  try {
    // Get version count
    const versionCount = await prisma.documentVersion.count({
      where: { documentId },
    });

    if (versionCount <= retentionCount) {
      return; // Nothing to cleanup
    }

    // Get IDs of versions to keep (most recent N)
    const versionsToKeep = await prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { createdAt: "desc" },
      take: retentionCount,
      select: { id: true },
    });

    const keepIds = versionsToKeep.map((v) => v.id);

    // Delete all versions not in the keep list
    await prisma.documentVersion.deleteMany({
      where: {
        documentId,
        id: { notIn: keepIds },
      },
    });
  } catch (error) {
    // Log error but don't throw - cleanup failures shouldn't break the main flow
    console.error(`Failed to cleanup versions for document ${documentId}:`, error);
  }
}
