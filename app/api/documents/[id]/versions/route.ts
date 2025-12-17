import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List all versions for a document
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

    // Fetch versions (most recent first)
    // Return empty array if table doesn't exist yet (migration not run)
    try {
      const versions = await prisma.documentVersion.findMany({
        where: { documentId: id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          createdAt: true,
          charCount: true,
          wordCount: true,
          // Don't send full content in list - only when restoring
        },
      });

      return NextResponse.json(versions);
    } catch (versionError) {
      // Table might not exist yet if migration hasn't run
      console.log("Version history not available (migration may not have run yet)");
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Failed to fetch versions:", error);
    return NextResponse.json(
      { error: "Failed to fetch versions" },
      { status: 500 }
    );
  }
}
