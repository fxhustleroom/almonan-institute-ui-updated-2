'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/components/AuthProvider';

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/student/dashboard', label: 'Dashboard' },
  { href: '/student/my-courses', label: 'My Courses' },
  { href: '/student/qna', label: 'Q&A' },
  { href: '/student/quizzes', label: 'Quizzes' },
  { href: '/student/assignments', label: 'Assignments' },
  { href: '/student/exams', label: 'Exams' },
  { href: '/student/certificates', label: 'Certificates' },
  { href: '/student/library', label: 'Library' },
  { href: '/student/support', label: 'Support' },
  { href: '/student/settings', label: 'Settings' },
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
        active ? 'bg-green-600 text-white shadow-soft' : 'text-ink/80 hover:bg-white/70 hover:text-ink'
      )}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-70" />
      {label}
    </Link>
  );
}

export function StudentShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const title = useMemo(() => {
    if (pathname.startsWith('/student/my-courses')) return 'Courses';
    if (pathname.startsWith('/student/qna')) return 'Q&A';
    if (pathname.startsWith('/student/quizzes')) return 'Quizzes';
    if (pathname.startsWith('/student/library')) return 'Library';
    if (pathname.startsWith('/student/support')) return 'Support';
    if (pathname.startsWith('/student/settings')) return 'Settings';
    return 'Dashboard';
  }, [pathname]);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line/60 bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="hidden text-sm font-semibold text-ink/70 sm:block">Student Portal</div>
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
              <div className="h-11 w-11 rounded-full bg-white shadow-soft ring-2 ring-green-600/20" />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[280px,1fr]">
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
                  onClick={() => {
                    logout();
                    router.push('/login');
                  }}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-left text-sm font-medium text-ink/70 shadow-soft hover:bg-white"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
