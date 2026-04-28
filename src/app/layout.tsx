import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({ weight: "500", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Peek Monitor",
  description: "Dashboard interno de monitoreo de Peek",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('peek-monitor-theme');if(t==='light')return;if(t==='dark'){document.documentElement.classList.add('dark');return;}if(window.matchMedia('(prefers-color-scheme: light)').matches)return;document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-dvh bg-background text-foreground`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
