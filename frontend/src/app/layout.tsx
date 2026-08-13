import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Lingo — Spanish path",
  description: "Duolingo-style lesson loop assignment clone",
};

const themeBoot = `(function(){try{if(localStorage.getItem("lingo-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800&family=Varela+Round&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg font-sans text-fg">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
