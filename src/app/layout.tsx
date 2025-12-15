import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistem Administrasi Surat - Kelurahan Cibodas',
  description: 'Sistem manajemen administrasi surat untuk Kelurahan Cibodas',
  icons: {
    icon: '/assets/logo_sikepel.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
