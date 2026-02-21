import type { Metadata } from 'next'
import Script from 'next/script'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { AuthProvider } from '@/contexts/auth-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Platovia - Smart QR Menu System',
  description: 'Create smart QR menus with AI-powered chatbot for restaurants',
  generator: 'Platovia',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <style>{`
:root {
  --font-sans: ${GeistSans.style.fontFamily};
  --font-mono: ${GeistMono.style.fontFamily};
}
        `}</style>
      </head>
      <body className={`font-sans antialiased`} suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Script src="https://cdn.paddle.com/paddle/v2/paddle.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
