import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TEHKNÉ STORYFORGE — Story Lab",
  description: "Forge an idea into a universe."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
