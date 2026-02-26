import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TaskBar } from "@/components/layout/TaskBar";
import { Navbar } from "@/components/layout/Navbar";
import { UserProvider } from '@auth0/nextjs-auth0/client';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FABT - AI Booking Platform",
  description: "Boring Logistics handled by AI, Live Music handled by Humans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <UserProvider>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <Navbar />
          <main style={{ paddingBottom: '8rem' }}>
            {children}
          </main>
          <TaskBar />
        </body>
      </UserProvider>
    </html>
  );
}
