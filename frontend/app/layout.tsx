import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/auth-context'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'HospiCore - Modern Hospitality Solutions',
  description: 'Nền tảng quản trị khách sạn, đặt phòng, dịch vụ và hóa đơn HospiCore.',
  generator: 'HospiCore',
  icons: {
    icon: [
      {
        url: '/hospicore-mark.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/hospicore-mark.svg',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  let apiOrigin: string | null = null
  try {
    apiOrigin = apiBaseUrl ? new URL(apiBaseUrl).origin : null
  } catch {
    apiOrigin = null
  }

  return (
    <html lang="vi" className="bg-background" suppressHydrationWarning>
      <head>
        {apiOrigin && <link rel="dns-prefetch" href={apiOrigin} />}
        {apiOrigin && <link rel="preconnect" href={apiOrigin} crossOrigin="anonymous" />}
      </head>
      <body
        className="font-sans antialiased selection:bg-blue-200 selection:text-blue-950"
        suppressHydrationWarning
      >
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            {children}
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
