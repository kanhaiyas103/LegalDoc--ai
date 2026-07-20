import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "LexisAI",
  description: "Transform legal complexity into clear decisions",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
