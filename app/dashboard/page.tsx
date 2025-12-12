import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/ui/header";
import { DocumentCard } from "@/components/dashboard/document-card";
import { FileText, Plus, Clock } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const user = session.user;
  const currentHour = new Date().getHours();
  let greeting = "Good evening";

  if (currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour < 18) {
    greeting = "Good afternoon";
  }

  const firstName = user.name?.split(" ")[0] || "there";

  // Fetch user's documents
  const documents = await prisma.document.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 10, // Show latest 10 documents
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-primary-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <Header />

      <main className="flex-1 px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Greeting Section */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-slate-50">
              {greeting}, {firstName}!
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Ready to write something amazing today?
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/editor"
              className="group p-8 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Plus className="w-7 h-7" />
                </div>
                <span className="text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  Quick Start
                </span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">New Document</h3>
              <p className="text-primary-100">
                Start writing a fresh markdown document
              </p>
            </Link>

            <div className="p-8 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <Clock className="w-7 h-7" />
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Coming Soon
                </span>
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                Recent Documents
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Access your recently edited files
              </p>
            </div>
          </div>

          {/* Documents Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                Your Documents
              </h2>
              <Link
                href="/editor"
                className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
              >
                Create New →
              </Link>
            </div>

            {documents.length === 0 ? (
              /* Empty State */
              <div className="p-12 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  No documents yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Start creating your first markdown document
                </p>
                <Link
                  href="/editor"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create Document
                </Link>
              </div>
            ) : (
              /* Documents List */
              <div className="grid gap-4">
                {documents.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
