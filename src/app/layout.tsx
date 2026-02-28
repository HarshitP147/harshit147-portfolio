import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const outfit = Outfit({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Harshit Pandit | Software Engineer",
  description: "Software Engineer with a passion for building scalable and efficient applications. Experienced in full-stack development, cloud computing, and DevOps practices. Always eager to learn new technologies and improve my skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script id="theme-init" strategy="beforeInteractive">{`
          (function() {
            try {
              var stored = localStorage.getItem("theme");
              var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
              var theme = stored === "light" || stored === "dark" ? stored : (prefersDark ? "dark" : "light");
              document.documentElement.classList.remove("light", "dark");
              document.documentElement.classList.add(theme);
            } catch (e) {}
          })();
        `}</Script>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
