import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Василиса и тайна Книжной долины',
  description: 'Интерактивное книжное приключение для Василисы',
  metadataBase: new URL('https://vasilisa-knizhnaya-dolina.cloudybowl17.chatgpt.site'),
  openGraph: {
    title: 'Василиса и тайна Книжной долины',
    description: 'Интерактивное книжное приключение',
    images: ['/og.png'],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Василиса и тайна Книжной долины',
    description: 'Интерактивное книжное приключение',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
