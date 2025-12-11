import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/ui/providers";
import { Toaster } from "sonner";

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
        <Providers>{children}</Providers>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
