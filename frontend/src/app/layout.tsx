import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Recruit AI - Optimize your CV & get more interviews",
    template: "%s | Recruit AI",
  },
  description:
    "Optimize your application with AI and see exactly when recruiters open your CV or read your emails in real-time.",
  keywords: [
    "CV optimization",
    "ATS",
    "resume",
    "cover letter",
    "job search",
    "AI",
    "career",
  ],
  authors: [{ name: "Recruit AI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Recruit AI",
    title: "Recruit AI - Optimize your CV & get more interviews",
    description:
      "Optimize your application with AI and see exactly when recruiters open your CV or read your emails in real-time.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recruit AI - Optimize your CV & get more interviews",
    description:
      "Optimize your application with AI and see exactly when recruiters open your CV or read your emails in real-time.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
