import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Monitor de APIs',
  description: 'Monitore a saúde e performance das suas APIs em tempo real',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(17, 24, 39, 0.95)',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              color: 'white',
            },
          }}
        />
      </body>
    </html>
  );
}
