import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ReactQueryProvider } from '@/lib/react-query';
import { CsrfProvider } from '@/components/providers/csrf-provider';
import { getOrCreateCsrfToken } from '@/lib/csrf';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Student Complaint System',
  description: 'A comprehensive system for managing student complaints',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Generate CSRF token on server for initial page load
  const csrfToken = await getOrCreateCsrfToken();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReactQueryProvider>
          <CsrfProvider initialToken={csrfToken}>
            <ErrorBoundary>
              <ToastProvider>{children}</ToastProvider>
            </ErrorBoundary>
          </CsrfProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
