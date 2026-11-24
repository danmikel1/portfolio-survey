import "./globals.css";
import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { AstryxRootProvider } from "@/components/providers/AstryxRootProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Client Presentation & Portfolio Workflow Study",
  description:
    "Independent research on how architects, engineers, interior designers, contractors, consultants, and agencies prepare client presentations and portfolios.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#F5F4F0] text-[#18191C]">
        <AstryxRootProvider mode="light">{children}</AstryxRootProvider>
      </body>
    </html>
  );
}
