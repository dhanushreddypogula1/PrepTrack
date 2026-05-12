import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import { Providers } from "@/components/Providers";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrepTrack Master",
  description:
    "AI-powered placement intelligence platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-slate-950 text-white`}
      >
        <Providers>
          {children}

          <Toaster
            theme="dark"
            position="top-right"
            richColors
          />
        </Providers>
      </body>
    </html>
  );
}