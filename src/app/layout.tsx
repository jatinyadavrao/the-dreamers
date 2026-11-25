import type { Metadata, Viewport } from "next";
import { Onest, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { CommandPalette } from "@/components/site/command-palette";
import { InlineScript } from "@/components/inline-script";
import { MotionProvider } from "@/components/motion-provider";
import { getCurrentUser, emailIsAdmin } from "@/lib/auth";

const onest = Onest({ variable: "--font-onest", subsets: ["latin"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-jbmono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  // absolute URLs for the share image; set NEXT_PUBLIC_SITE_URL to override (previews, another domain)
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.thedreamers.in"),
  title: {
    default: "The Dreamers: company-wise LeetCode questions for coding interviews",
    template: "%s · The Dreamers",
  },
  description:
    "See which LeetCode questions Amazon, Google and 198 other companies ask, sorted by how often each one comes up. Free forever.",
  applicationName: "The Dreamers",
  openGraph: {
    type: "website",
    siteName: "The Dreamers",
    title: "The Dreamers: company-wise LeetCode questions for coding interviews",
    description: "See which LeetCode questions Amazon, Google and 198 other companies ask, sorted by how often each one comes up.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#18191b",
};

// the visitor's theme before first paint: dark unless they picked light
const themeScript = `(function(){try{var t=localStorage.getItem('theme')||'dark';if(t==='dark')document.documentElement.classList.add('dark');else{var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','#eff0f1')}}catch(e){document.documentElement.classList.add('dark');}})();`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser().catch(() => null);
  const admin = emailIsAdmin(user?.email);

  return (
    <html lang="en" className={`${onest.variable} ${mono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body className="flex min-h-full flex-col">
        <AuthProvider initialUser={user ? { email: user.email, name: user.name } : null}>
          <ThemeProvider>
            <MotionProvider>
            <Navbar isAdmin={admin} />
            <main id="main" className="flex-1 pt-[var(--nav)]">
              {children}
            </main>
            <Footer />
            <CommandPalette />
            </MotionProvider>
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
