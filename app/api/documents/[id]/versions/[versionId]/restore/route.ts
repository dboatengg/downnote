import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateContentStats } from "@/lib/version-logic";
import { cleanupOldVersions } from "@/lib/version-cleanup";

// POST - Restore a specific version
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, versionId } = await params;

    // Verify document ownership
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check if version history is available (migration run)
    try {
      // Fetch version to restore
      const versionToRestore = await prisma.documentVersion.findFirst({
        where: {
          id: versionId,
          documentId: id, // Ensure version belongs to this document
        },
      });

      if (!versionToRestore) {
        return NextResponse.json(
          { error: "Version not found" },
          { status: 404 }
        );
      }

      // IMPORTANT: Save current state as a version BEFORE restoring
      // This ensures the user can undo the restore operation
      const currentStats = calculateContentStats(document.content);
      await prisma.documentVersion.create({
        data: {
          documentId: id,
          content: document.content,
          title: document.title,
          charCount: currentStats.charCount,
          wordCount: currentStats.wordCount,
        },
      });

      // Update document with restored content
      const updatedDocument = await prisma.document.update({
        where: { id },
        data: {
          content: versionToRestore.content,
          title: versionToRestore.title,
        },
      });

      // Cleanup old versions
      await cleanupOldVersions(id, 20);

      return NextResponse.json(updatedDocument);
    } catch (versionError) {
      console.error("Version restore failed:", versionError);
      return NextResponse.json(
        { error: "Version history not available. Please run database migration." },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Failed to restore version:", error);
    return NextResponse.json(
      { error: "Failed to restore version" },
      { status: 500 }
    );
  }
}
