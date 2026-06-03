import type { Metadata } from 'next';
import { DM_Sans, Sora, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nexus — Inventory & Order Management',
  description: 'Precision Commerce for Modern Distributors',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${sora.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-background text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
