import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "BSA Tool",
  description: "Company model and request lifecycle for business systems analysis",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="top">
          <Link href="/" className="brand">
            BSA Tool
          </Link>
          <nav aria-label="Main">
            <Link href="/">Requests</Link>
            <Link href="/people">People</Link>
            <Link href="/model">Company model</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
