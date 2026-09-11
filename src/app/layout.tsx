import type { Metadata } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CustomCursor } from "@/components/custom-cursor";
import { AuroraBackground } from "@/components/aurora-background";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { isAdmin } from "@/lib/auth";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: ["500", "600", "700", "800"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Dreamers — Company-wise LeetCode Questions",
  description:
    "Practice previous-year LeetCode questions asked by top companies. Track your progress and chase your dream company.",
};

// Set the theme class before hydration to avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('theme')||'dark';if(t==='dark')document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const admin = await isAdmin().catch(() => false);

  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} ${sora.variable} ${mono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className="min-h-full flex flex-col">
          <ThemeProvider>
            <AuroraBackground />
            <CustomCursor />
            <Navbar isAdmin={admin} />
            <main className="flex-1">{children}</main>
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
