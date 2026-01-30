import React from 'react';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';

export function PublicLayout({ children, active }: { children: React.ReactNode; active?: string }) {
  return (
    <div className="min-h-screen">
      <PublicHeader active={active} />
      <main className="mx-auto max-w-6xl px-4">{children}</main>
      <PublicFooter />
    </div>
  );
}
