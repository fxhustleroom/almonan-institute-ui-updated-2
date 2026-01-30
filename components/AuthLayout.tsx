import Link from 'next/link';
import React from 'react';
import { Logo } from '@/components/Logo';

export function AuthLayout({
  children,
  variant
}: {
  children: React.ReactNode;
  variant?: 'login' | 'register' | 'simple';
}) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-black/5 bg-cream/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <Link href="/" className="no-underline text-ink">
            <Logo />
          </Link>

          {variant === 'login' && (
            <nav className="flex items-center gap-7">
              <Link href="/support" className="text-sm font-semibold text-ink/70 hover:text-ink">
                Help
              </Link>
              <Link href="/about" className="text-sm font-semibold text-ink/70 hover:text-ink">
                About Us
              </Link>
            </nav>
          )}

          {variant === 'register' && (
            <nav className="hidden items-center gap-7 md:flex">
              <Link href="/" className="text-sm font-semibold text-ink/70 hover:text-ink">
                Home
              </Link>
              <Link href="/courses" className="text-sm font-semibold text-ink/70 hover:text-ink">
                Courses
              </Link>
              <Link href="/about" className="text-sm font-semibold text-ink/70 hover:text-ink">
                About Us
              </Link>
            </nav>
          )}

          {variant === 'register' && (
            <Link href="/login" className="btn-primary !px-6 !py-2.5">
              Login
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16">{children}</main>

      <footer className="border-t border-black/5 bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-xs text-ink/60">
          <div>© {new Date().getFullYear()} Almonan Institute. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-ink">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-ink">
              Terms of Service
            </Link>
            <Link href="/api" className="hover:text-ink">
              API Docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
