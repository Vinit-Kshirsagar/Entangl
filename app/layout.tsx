import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Entangl - Connect & Share',
  description: 'A modern social media platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}