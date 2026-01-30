'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/components/AuthProvider';

type NavItem = {
  href: string;
  label: string;
  group?: 'student' | 'learning';
};

const NAV_ITEMS: NavItem[] = [
  { href: '/student/dashboard', label: 'Dashboard', group: 'student' },
  { href: '/student/my-courses', label: 'My Courses', group: 'student' },
  { href: '/student/qna', label: 'Q&A', group: 'learning' },
  { href: '/student/quizzes', label: 'Quizzes', group: 'learning' },
  { href: '/student/assignments', label: 'Assignments', group: 'learning' },
  { href: '/student/exams', label: 'Exams', group: 'learning' },
  { href: '/student/certificates', label: 'Certificates', group: 'student' },
  { href: '/student/library', label: 'Library', group: 'student' },
  { href: '/student/support', label: 'Support', group: 'student' },
  { href: '/student/settings', label: 'Settings', group: 'student' },
];

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

function SideNavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
        active
          ? 'bg-brand text-white shadow-soft'
          : 'text-ink/80 hover:bg-white/70 hover:text-ink'
      )}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-70" />
      {label}
    </Link>
  );
}

export function StudentShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const title = useMemo(() => {
    if (pathname.startsWith('/my-courses')) return 'Courses';
    if (pathname.startsWith('/qna')) return 'Q&A';
    if (pathname.startsWith('/quizzes')) return 'Quizzes';
    if (pathname.startsWith('/library')) return 'Library';
    if (pathname.startsWith('/support')) return 'Support';
    return 'Dashboard';
  }, [pathname]);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Top bar (matches the UI screenshots: logo + search + quick links + user) */}
      <header className="sticky top-0 z-40 border-b border-line/60 bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="hidden text-sm font-semibold text-ink/70 sm:block">
              Student Portal
            </div>
          </div>

          <div className="hidden w-full max-w-xl items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 shadow-soft md:flex">
            <span className="text-ink/40">🔎</span>
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
              placeholder="Search resources..."
            />
          </div>

          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-6 text-sm md:flex">
              <Link className="text-ink/70 hover:text-ink" href="/student/dashboard">
                Dashboard
              </Link>
              <Link className="text-ink/70 hover:text-ink" href="/student/my-courses">
                Courses
              </Link>
              <Link className="text-ink/70 hover:text-ink" href="/student/support">
                Support
              </Link>
            </nav>

            <div className="h-10 w-px bg-line/70" />

            <div className="flex items-center gap-3">
              <div className="hidden text-right text-sm sm:block">
                <div className="font-semibold text-ink">{user?.fullName ?? 'Student'}</div>
                <div className="text-ink/60">{title}</div>
              </div>
              <div className="h-11 w-11 rounded-full bg-white shadow-soft ring-2 ring-brand/20" />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[280px,1fr]">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-[96px] space-y-4">
            <div className="rounded-2xl border border-line bg-white/60 p-4 shadow-soft">
              <div className="text-xs font-semibold tracking-wide text-ink/50">STUDENT PORTAL</div>
              <div className="mt-3 space-y-2">
                {NAV_ITEMS.map((i) => (
                  <SideNavItem key={i.href} href={i.href} label={i.label} />
                ))}
              </div>

              <div className="mt-4 border-t border-line/60 pt-4">
                <button
                  onClick={logout}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-left text-sm font-medium text-ink/70 shadow-soft hover:bg-white"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main>{children}</main>
      </div>

      <footer className="border-t border-line/60 bg-canvas py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-ink/60 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="opacity-60">©</span>
            <span>2024 Almonan Institute Academic Services</span>
          </div>
          <div className="flex items-center gap-6">
            <a className="hover:text-ink" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-ink" href="#">
              Terms of Service
            </a>
            <a className="hover:text-ink" href="#">
              Campus Map
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
