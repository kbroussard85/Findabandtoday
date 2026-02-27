import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { UserProvider } from '@auth0/nextjs-auth0/client';

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
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
        <body className={`${montserrat.variable} ${geistMono.variable} antialiased`}>
          <Navbar />
          <main>
            {children}
          </main>
        </body>
      </UserProvider>
    </html>
  );
}
