import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Resume Roast — Find out if your resume is cooked",
  description:
    "Upload your resume and get a brutally honest AI roast with fixes that actually help you get interviews.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
