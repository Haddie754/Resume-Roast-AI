import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "FireThis — Get Fired Up. Get Hired.",
  description:
    "Brutally honest AI feedback on your resume — built for college students, with dedicated F-1 / OPT support. Get hired faster.",
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
