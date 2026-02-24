import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/app-context";

export const metadata: Metadata = {
  title: "Video Buddy",
  description: "Turn YouTube videos into interactive mindmaps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
