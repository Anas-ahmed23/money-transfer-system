import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'نظام تحويل الأموال',
  description: 'منصة آمنة وسريعة لتحويل الأموال بين الحسابات',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background antialiased font-arabic">
        {children}
      </body>
    </html>
  );
}
