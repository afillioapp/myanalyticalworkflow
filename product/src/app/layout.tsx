import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BSA Tool",
  description: "Company model and request lifecycle for business systems analysis",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
