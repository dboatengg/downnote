import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractTitleFromMarkdown } from "@/lib/extract-title";
import {
  shouldCreateVersion,
  calculateContentStats,
} from "@/lib/version-logic";
import { cleanupOldVersions } from "@/lib/version-cleanup";

// GET - Get single document
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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

    return NextResponse.json(document);
  } catch (error) {
    console.error("Failed to fetch document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

// PATCH - Update document
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { content } = body;
    let { title } = body;

    // If content is provided but title is not, extract title from content
    if (content !== undefined && title === undefined) {
      title = extractTitleFromMarkdown(content);
    }

    // Verify ownership
    const existing = await prisma.document.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Fetch latest version for comparison (if content is being updated)
    // Wrap in try-catch in case migration hasn't run yet
    let latestVersion = null;
    let versionDecision: {
      shouldCreateVersion: boolean;
      reason: "significant_change" | "time_threshold" | "no_version_needed" | "first_version";
    } = {
      shouldCreateVersion: false,
      reason: "no_version_needed",
    };

    if (content !== undefined) {
      try {
        latestVersion = await prisma.documentVersion.findFirst({
          where: { documentId: id },
          orderBy: { createdAt: "desc" },
          select: { content: true, createdAt: true },
        });

        versionDecision = shouldCreateVersion(
          content,
          latestVersion?.content || null,
          latestVersion?.createdAt || null
        );
      } catch (versionQueryError) {
        // Table might not exist yet if migration hasn't run
        console.log(
          "Version history not available (migration may not have run yet)"
        );
      }
    }

    // Update document
    const document = await prisma.document.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
      },
    });

    // Create version if needed
    if (versionDecision.shouldCreateVersion && content !== undefined) {
      try {
        const stats = calculateContentStats(content);
        await prisma.documentVersion.create({
          data: {
            documentId: id,
            content,
            title: title || document.title,
            charCount: stats.charCount,
            wordCount: stats.wordCount,
          },
        });

        // Cleanup old versions (keep last 20)
        await cleanupOldVersions(id, 20);
      } catch (versionError) {
        // Log error but don't fail the request - version creation is non-critical
        console.error("Failed to create version:", versionError);
      }
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Failed to update document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

// DELETE - Delete document
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.document.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Document deleted" });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
