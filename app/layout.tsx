import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/ui/providers";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "DownNote - Modern Markdown Editor",
  description: "A beautiful, modern markdown editor for writers and developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <NextTopLoader
          color="#0ea5e9"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
        />
        <Providers>{children}</Providers>
        <Analytics />
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
