import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "LegalDoc",
  description: "AI-powered legal workbench for Indian law",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
