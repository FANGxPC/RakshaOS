import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-primary" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display" });

export const metadata = {
  title: "RakshaOS | AI Digital Safety Layer",
  description: "Detects scams, fraud, manipulation, and risky digital actions before they cause harm.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased min-h-screen flex flex-col relative overflow-x-hidden">
        {/* Animated background subtle gradient blobs */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]"></div>
        </div>
        
        {children}
      </body>
    </html>
  );
}
