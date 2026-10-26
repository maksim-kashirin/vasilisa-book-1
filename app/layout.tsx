import type { Metadata } from 'next';
import './globals.css';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000/';
const socialImageUrl = new URL('og.png', siteUrl).toString();

export const metadata: Metadata = {
  title: 'Василиса и тайна Книжной долины',
  description: 'Интерактивное книжное приключение для Василисы',
  icons: {
    icon: new URL('favicon.svg', siteUrl).toString(),
  },
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'Василиса и тайна Книжной долины',
    description: 'Интерактивное книжное приключение',
    images: [socialImageUrl],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Василиса и тайна Книжной долины',
    description: 'Интерактивное книжное приключение',
    images: [socialImageUrl],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
