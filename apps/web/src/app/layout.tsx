import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "BugSense AI — Intelligent Debugging & Code Security",
  description: "Paste code, logs, or stack traces and get a structured bug report powered by AI.",
  icons: {
    icon: "/bugsense-logo.png",
    apple: "/bugsense-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} min-h-screen antialiased`}>
        <AuthProvider>
          <div className="grid-bg min-h-screen">
            <Navbar />
            <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8">{children}</main>
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
