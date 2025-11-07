import type { Metadata } from "next";
import { Reddit_Sans, Sora } from "next/font/google";
import "./globals.css";

const redditSans = Reddit_Sans({
  variable: "--font-reddit-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ebolt - Kirish",
  description: "Ebolt tizimiga kirish",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body
        className={`${redditSans.variable} ${sora.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
