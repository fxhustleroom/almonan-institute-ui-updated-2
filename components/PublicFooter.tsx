import Link from 'next/link';
import React from 'react';
import { Logo } from '@/components/Logo';

export function PublicFooter() {
  return (
    <footer className="mt-16 bg-almonanGreen-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <div className="text-white">
              <Logo />
            </div>
            <p className="text-sm text-white/70">
              Connecting digital education with real-world student tracking for a holistic learning experience.
            </p>
            <div className="flex gap-3 text-white/80">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10">✉</span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10">𝕏</span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10">⌁</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">Quick Links</div>
            <div className="flex flex-col gap-2 text-sm text-white/70">
              <Link href="/courses" className="hover:text-white">Courses Catalogue</Link>
              <Link href="/support" className="hover:text-white">Contact Support</Link>
              <Link href="/library" className="hover:text-white">Library</Link>
              <Link href="/bookstore" className="hover:text-white">Bookstore</Link>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">Support</div>
            <div className="flex flex-col gap-2 text-sm text-white/70">
              <Link href="/support" className="hover:text-white">Help Center</Link>
              <Link href="/support" className="hover:text-white">Privacy Policy</Link>
              <Link href="/support" className="hover:text-white">Terms of Service</Link>
              <Link href="/support" className="hover:text-white">Cookie Policy</Link>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">Newsletter</div>
            <p className="text-sm text-white/70">Stay updated with our latest courses and research papers.</p>
            <form className="flex gap-2">
              <input
                className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/50"
                placeholder="Email address"
              />
              <button type="button" className="rounded-lg bg-almonanGreen-500 px-4 py-2 text-sm font-semibold">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/60">
          © {new Date().getFullYear()} Almonan Institute. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
