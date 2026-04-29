'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMyExams, type ExamListItem } from '@/lib/queries';

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

function fmtMins(sec?: number) {
  if (!sec || sec <= 0) return '—';
  const mins = Math.round(sec / 60);
  return `${mins} mins`;
}

export default function StudentExamsPage() {
  const [q, setQ] = useState('');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['exams', q],
    queryFn: () => fetchMyExams({ q })
  });

  const exams = (data ?? []) as ExamListItem[];

  const upcoming = useMemo(() => {
    return exams.filter((e) => (e.status ?? 'not_started') !== 'submitted');
  }, [exams]);

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-ink">Exams</h1>
          <p className="mt-2 text-sm text-ink/60">Start an exam, resume an in-progress attempt, or review submitted ones.</p>
        </div>

        <button type="button" onClick={() => refetch()} className="btn-outline h-[44px] px-5">
          ↻&nbsp;&nbsp;Refresh List
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full max-w-xl items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-soft">
          <span className="text-ink/40">🔎</span>
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
            placeholder="Search exams..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="text-sm text-ink/60">
          {isLoading ? 'Loading…' : `${upcoming.length} active / ${exams.length} total`}
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="grid grid-cols-[1.6fr_.9fr_.9fr_.8fr] gap-4 bg-almonanBrown-900 px-6 py-4 text-xs font-extrabold tracking-[0.22em] text-white">
          <div>EXAM</div>
          <div>DURATION</div>
          <div>QUESTIONS</div>
          <div className="text-right">ACTION</div>
        </div>

        <div className="divide-y divide-black/5 bg-white">
          {isError ? (
            <div className="px-6 py-10 text-sm text-ink/60">Could not load exams from API.</div>
          ) : isLoading ? (
            <div className="px-6 py-10">
              <div className="h-6 w-64 animate-pulse rounded bg-black/5" />
              <div className="mt-3 h-6 w-96 animate-pulse rounded bg-black/5" />
            </div>
          ) : exams.length === 0 ? (
            <div className="px-6 py-10 text-sm text-ink/60">No exams available.</div>
          ) : (
            exams.map((e) => (
              <div key={e.id} className="grid grid-cols-[1.6fr_.9fr_.9fr_.8fr] gap-4 px-6 py-5">
                <div>
                  <div className="font-extrabold text-ink">{e.title}</div>
                  <div className="mt-1 text-xs text-ink/50">
                    {(e.courseTitle ?? 'Course')}{e.sectionLabel ? ` • ${e.sectionLabel}` : ''}
                  </div>
                </div>

                <div className="text-sm font-semibold text-ink/70">{fmtMins(e.durationSeconds)}</div>
                <div className="text-sm font-semibold text-ink/70">{e.totalQuestions ?? '—'}</div>

                <div className="flex items-center justify-end">
                  <Link href={`/student/exams/${e.id}`} className="btn-primary h-[40px] px-6">
                    {(e.status ?? 'not_started') === 'in_progress' ? 'Resume' : 'Start'}
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-black/10 bg-white/60 p-4 text-sm text-ink/60">
        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/5">i</span>
        <span className="font-semibold text-ink/70">Note:</span> Starting an exam creates an attempt and begins the timer (server-controlled).
      </div>
    </div>
  );
}
