import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from '@clerk/nextjs'

const geist = Geist({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Power-CMS - Modern Complaint Management System',
  description: 'Streamline your complaint resolution process with AI-powered efficiency from Powersoft360',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
    <html lang="en" className={geist.variable}>
      <body className={`${geist.className} antialiased`}>
        <Toaster position="top-right" reverseOrder={false} />
        {children}
      </body>
    </html>
    </ClerkProvider>
  )
}