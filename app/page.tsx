import Link from "next/link";
import { Header } from "@/components/ui/header";
import { FileText, Zap, Lock, Cloud, Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-primary-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Modern Markdown Editor
          </div>

          <h1 className="text-6xl md:text-7xl font-serif font-bold text-slate-900 dark:text-slate-50 leading-tight">
            Write. Preview.
            <br />
            <span className="text-primary-600 dark:text-primary-400">
              Publish.
            </span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            DownNote is a beautiful, modern markdown editor built for writers
            and developers. Write with focus, preview in real-time, and sync
            your work across all devices.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link
              href="/editor"
              className="group px-8 py-4 rounded-lg bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 transition-all font-medium text-lg shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              Start Writing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/auth/signin"
              className="px-8 py-4 rounded-lg border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-lg"
            >
              Sign In
            </Link>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-500 pt-4">
            No account required to start writing. Sign in to sync your
            documents.
          </p>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-32 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="Lightning Fast"
            description="Real-time preview with zero lag. See your markdown rendered instantly."
          />
          <FeatureCard
            icon={<Lock className="w-6 h-6" />}
            title="Privacy First"
            description="Your documents are yours. Work offline or sync securely to the cloud."
          />
          <FeatureCard
            icon={<Cloud className="w-6 h-6" />}
            title="Cloud Sync"
            description="Access your work from anywhere. Sign in to sync across all your devices."
          />
          <FeatureCard
            icon={<FileText className="w-6 h-6" />}
            title="Guest Mode"
            description="Start writing immediately. No account needed. Documents saved locally."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-sm text-slate-600 dark:text-slate-400">
          <p>
            Built with ❤️ by{" "}
            <a
              href="https://github.com/dboatengg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Dickson
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
