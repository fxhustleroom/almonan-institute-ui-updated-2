'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMyAssignments, type MyAssignment } from '@/lib/queries';

type Status = 'pending' | 'submitted' | 'late';
type FilterTab = 'all' | Status;

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

function normalizeStatus(s: string | undefined | null): Status {
  const v = String(s ?? '').toLowerCase();
  if (v.includes('submit')) return 'submitted';
  if (v.includes('late')) return 'late';
  return 'pending';
}

function formatDueDate(d?: string) {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d; // already formatted string
  return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

function StatusPill({ status }: { status: Status }) {
  const label = status.toUpperCase();
  const cls =
    status === 'submitted'
      ? 'bg-green-50 text-green-700'
      : status === 'late'
        ? 'bg-red-50 text-red-700'
        : 'bg-amber-50 text-amber-700';

  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold tracking-widest', cls)}>
      {label}
    </span>
  );
}

function Dot({ status }: { status: Status }) {
  const cls =
    status === 'submitted'
      ? 'bg-green-500'
      : status === 'late'
        ? 'bg-red-500'
        : 'bg-blue-500';
  return <span className={cn('h-2 w-2 rounded-full', cls)} />;
}

export default function StudentAssignmentsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<FilterTab>('all');

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['my-assignments'],
    queryFn: fetchMyAssignments
  });

  const pendingCount = useMemo(
    () => items.filter((x: MyAssignment) => normalizeStatus(x.status) === 'pending').length,
    [items]
  );

  const rows = useMemo(() => {
    const mapped = items.map((a: MyAssignment) => ({
      id: a.id,
      courseTitle: a.courseTitle,
      courseCode: a.courseCode ?? '—',
      section: a.section ?? '',
      title: a.title,
      dueDate: formatDueDate(a.dueDate),
      status: normalizeStatus(a.status)
    }));

    if (tab === 'all') return mapped;
    return mapped.filter((x: (typeof mapped)[number]) => x.status === tab);
  }, [items, tab]);

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-ink">My Assignments</h1>
          <p className="mt-2 text-sm text-ink/60">
            You have{' '}
            <span className="font-extrabold text-almonanGreen-700">{pendingCount} pending</span> assignments to complete this week.
          </p>
        </div>

        <button
          type="button"
          onClick={() => qc.invalidateQueries({ queryKey: ['my-assignments'] })}
          className="btn-outline h-[44px] px-5"
        >
          ↻&nbsp;&nbsp;Refresh List
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {[
          { k: 'all', label: 'All Assignments' },
          { k: 'pending', label: 'Pending' },
          { k: 'submitted', label: 'Submitted' },
          { k: 'late', label: 'Late' }
        ].map((t) => {
          const active = tab === (t.k as FilterTab);
          return (
            <button
              key={t.k}
              type="button"
              onClick={() => setTab(t.k as FilterTab)}
              className={cn(
                'rounded-full px-6 py-2 text-sm font-extrabold transition',
                active
                  ? 'bg-almonanGreen-500 text-white shadow-soft'
                  : 'border border-black/10 bg-white text-ink/70 hover:bg-black/5 hover:text-ink'
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Loading/Error */}
      {isLoading ? (
        <div className="mt-6 card p-6">
          <div className="h-6 w-48 animate-pulse rounded bg-black/5" />
          <div className="mt-4 h-28 w-full animate-pulse rounded bg-black/5" />
        </div>
      ) : null}

      {isError ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load assignments. Please try refresh.
        </div>
      ) : null}

      {/* Table */}
      {!isLoading && !isError ? (
        <div className="card mt-6 overflow-hidden">
          <div className="grid grid-cols-[1.2fr_1.4fr_.9fr_.8fr_.7fr] gap-4 bg-almonanBrown-900 px-6 py-4 text-xs font-extrabold tracking-[0.22em] text-white">
            <div>COURSE</div>
            <div>ASSIGNMENT TITLE</div>
            <div>DUE DATE</div>
            <div>STATUS</div>
            <div className="text-right">ACTION</div>
          </div>

          <div className="divide-y divide-black/5 bg-white">
            {rows.map((r: any) => (
              <div key={r.id} className="grid grid-cols-[1.2fr_1.4fr_.9fr_.8fr_.7fr] gap-4 px-6 py-5">
                <div className="flex items-start gap-3">
                  <div className="mt-2">
                    <Dot status={r.status} />
                  </div>
                  <div>
                    <div className="font-extrabold text-ink">{r.courseTitle}</div>
                    <div className="mt-1 text-xs text-ink/50">
                      {r.courseCode}
                      {r.section ? ` • ${r.section}` : ''}
                    </div>
                  </div>
                </div>

                <div className="font-semibold text-ink/80">{r.title}</div>

                <div className="text-sm font-semibold text-ink/70">{r.dueDate}</div>

                <div>
                  <StatusPill status={r.status} />
                </div>

                <div className="flex items-center justify-end">
                  {r.status === 'submitted' ? (
                    <Link
                      href={`/student/assignments/${r.id}`}
                      className="text-sm font-extrabold text-ink/50 hover:text-ink hover:underline"
                    >
                      View
                    </Link>
                  ) : r.status === 'late' ? (
                    <Link
                      href={`/student/assignments/${r.id}`}
                      className="inline-flex items-center justify-center rounded-xl bg-red-500 px-5 py-2 text-sm font-extrabold text-white shadow-soft hover:brightness-95"
                    >
                      Submit Late
                    </Link>
                  ) : (
                    <Link href={`/student/assignments/${r.id}`} className="btn-primary h-[40px] px-6">
                      Submit
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {rows.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-ink/60">No assignments found.</div>
            ) : null}
          </div>

          <div className="flex items-center justify-between px-6 py-4 text-sm text-ink/60">
            <div>Showing {rows.length} of {items.length} assignments</div>
            <div className="flex items-center gap-2">
              <button className="rounded-xl border border-black/10 bg-white px-3 py-2 hover:bg-black/5">{'‹'}</button>
              <button className="rounded-xl border border-black/10 bg-white px-3 py-2 hover:bg-black/5">{'›'}</button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Bottom cards */}
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-almonanGreen-100 text-almonanGreen-700">
              💡
            </div>
            <div>
              <div className="text-sm font-extrabold text-ink">Study Tip</div>
              <div className="mt-1 text-sm text-ink/60">Review peer feedback before the next submission.</div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-almonanGreen-100 text-almonanGreen-700">
              📅
            </div>
            <div>
              <div className="text-sm font-extrabold text-ink">Next Exam</div>
              <div className="mt-1 text-sm text-ink/60">Start preparing early for your next evaluation.</div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-almonanGreen-100 text-almonanGreen-700">
              👥
            </div>
            <div>
              <div className="text-sm font-extrabold text-ink">Group Project</div>
              <div className="mt-1 text-sm text-ink/60">Coordinate with your team to meet deadlines.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
