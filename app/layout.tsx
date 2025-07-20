import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AudioProvider } from "@/components/audio-provider"
import { AppLayout } from "@/components/app-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Quran App - Modern Audio Experience",
  description: "A modern Quran app with Spotify-style UI for audio recitation",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favroite.png", sizes: "192x192", type: "image/png" },
      { url: "/favroite.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/favroite.png", sizes: "192x192", type: "image/png" }],
  },
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Quran App" />

        {/* ✅ Added manifest & icon links below */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favroite.png" />
        <link rel="apple-touch-icon" href="/favroite.png" sizes="192x192" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AudioProvider>
            <AppLayout>{children}</AppLayout>
          </AudioProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
