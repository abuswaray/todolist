import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Todo - Intelligent Task Management",
  description: "A sophisticated todo application with advanced features, smart filtering, and beautiful UI built with Next.js and Tailwind CSS.",
  keywords: "todo, task management, productivity, next.js, tailwind css",
  authors: [{ name: "Smart Todo Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
