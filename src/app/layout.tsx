import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Claude Code Preferences',
  description: 'Comprehensive preference management system for Claude Code across all projects and devices',
  keywords: ['claude-code', 'preferences', 'configuration', 'ai', 'development'],
  authors: [{ name: 'Shakeel Bhamani' }]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div>
          <Navigation />
          <main className="container">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}