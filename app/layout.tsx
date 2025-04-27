// app/layout.tsx
import '../styles/globals.css';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClientProvider } from '../components/ClientProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mise - Recipe Generator',
  description: 'Generate personalized recipes based on the ingredients you have.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}