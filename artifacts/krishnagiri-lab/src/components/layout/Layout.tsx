import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingContact from "./FloatingContact";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background font-sans">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
}
