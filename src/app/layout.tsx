import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AppProviders from '@/components/providers/AppProviders';
import { getBaseUrl } from '@/lib/constants';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter'
});

function getMetadataBaseUrl(): URL {
  try {
    return new URL(getBaseUrl());
  } catch {
    return new URL('http://localhost:3000');
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBaseUrl(),
  title: {
    template: '%s | Class Deadline Hub - PTIT',
    default: 'Class Deadline Hub - Cổng thông tin Deadline Lớp học PTIT'
  },
  description:
    'Cổng quản lý và theo dõi hạn nộp bài tập, đồ án, kiểm tra của lớp sinh viên Học viện Công nghệ Bưu chính Viễn thông PTIT.',
  keywords: ['deadline', 'ptit', 'học viện bưu chính viễn thông', 'quản lý bài tập', 'sinh viên'],
  authors: [{ name: 'Ban cán sự lớp PTIT' }],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo-ptit.png'
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
