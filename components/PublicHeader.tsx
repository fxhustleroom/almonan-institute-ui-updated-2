import Link from 'next/link';
import React from 'react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

type NavItem = { label: string; href: string; active?: boolean };

export function PublicHeader({ active }: { active?: string }) {
  const items: NavItem[] = [
    { label: 'Home', href: '/', active: active === 'home' },
    { label: 'Courses', href: '/courses', active: active === 'courses' },
    { label: 'Library', href: '/library', active: active === 'library' },
    { label: 'Bookstore', href: '/bookstore', active: active === 'bookstore' },
    { label: 'Support', href: '/support', active: active === 'support' }
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="no-underline text-ink">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'text-sm font-semibold text-ink/70 hover:text-ink transition',
                it.active && 'text-almonanGreen-700'
              )}
            >
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-primary !px-6 !py-2.5">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
