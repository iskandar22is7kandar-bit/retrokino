import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  metadataBase: new URL("https://retrokino.uz"),
  title: {
    default: "RetroKino — Milliy Kino Platformasi",
    template: "%s | RetroKino",
  },
  description: "O'zbekiston milliy kino platformasi. Klassik va zamonaviy filmlar, seriallar, multfilmlar.",
  keywords: ["retro kino", "klassik filmlar", "o'zbek kinosi", "milliy kino", "filmlar"],
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: "https://retrokino.uz",
    siteName: "RetroKino",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#F1E9D2",
              color: "#764838",
              border: "1px solid rgba(0,0,0,0.12)",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.85rem",
              borderRadius: "6px",
            },
          }}
        />
      </body>
    </html>
  );
}
