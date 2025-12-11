import Link from "next/link";
import { Header } from "@/components/ui/header";
import { FileText, Zap, Lock, Cloud, Sparkles, ArrowRight, Github, Star, GitFork, Heart } from "lucide-react";

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

        {/* CTA Section - Contribute */}
        <div className="max-w-4xl mx-auto mt-32 mb-20">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-500 dark:via-primary-600 dark:to-primary-700 p-12 shadow-2xl">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }}></div>
            </div>

            <div className="relative z-10 text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
                <Heart className="w-4 h-4" />
                Open Source
              </div>

              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">
                Join Me in Building DownNote
              </h2>

              <p className="text-lg text-primary-100 max-w-2xl mx-auto leading-relaxed">
                DownNote is open source and I'd love your help! Star the project,
                contribute code, report bugs, or suggest features. Every contribution makes a difference!
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                <a
                  href="https://github.com/dboatengg/downnote"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group px-8 py-4 rounded-lg bg-white text-primary-700 hover:bg-primary-50 transition-all font-medium text-lg shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                >
                  <Star className="w-5 h-5 group-hover:fill-primary-700 transition-all" />
                  Star on GitHub
                </a>

                <a
                  href="https://github.com/dboatengg/downnote"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-lg border-2 border-white/30 backdrop-blur-sm text-white hover:bg-white/10 transition-colors font-medium text-lg flex items-center gap-2"
                >
                  <Github className="w-5 h-5" />
                  View Source
                </a>

                <a
                  href="https://github.com/dboatengg/downnote/fork"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-lg border-2 border-white/30 backdrop-blur-sm text-white hover:bg-white/10 transition-colors font-medium text-lg flex items-center gap-2"
                >
                  <GitFork className="w-5 h-5" />
                  Fork Project
                </a>
              </div>

              {/* Stats or additional info */}
              <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-white">
                <div className="space-y-1">
                  <div className="text-3xl font-bold">MIT</div>
                  <div className="text-sm text-primary-100">License</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">100%</div>
                  <div className="text-sm text-primary-100">Free Forever</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">❤️</div>
                  <div className="text-sm text-primary-100">Contributors Welcome</div>
                </div>
              </div>
            </div>
          </div>
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
