import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AppQueryProvider } from '@/lib/query-provider';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'Almonan Institute',
  description: 'Almonan Institute — Learn online & track offline students'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppQueryProvider>{children}</AppQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
