'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchDashboard, fetchMe, type DashboardResponse } from '@/lib/queries';

function StatCard({
  label,
  value,
  badge,
}: {
  label: string;
  value: string | number;
  badge?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-black/60">{label}</div>
          <div className="mt-3 text-4xl font-extrabold tracking-tight text-black">{value}</div>
        </div>
        {badge ? (
          <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            {badge}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ProgressRow({ title, percent }: { title: string; percent: number }) {
  const width = Math.max(0, Math.min(100, percent));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span className="text-black/80">{title}</span>
        <span className="text-emerald-700">{width}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-black/10">
        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [meName, setMeName] = useState<string>('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [me, dash] = await Promise.all([fetchMe(), fetchDashboard()]);
        if (!alive) return;
        setMeName(me.fullName || me.email || 'Student');
        setData(dash);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => {
    const s = data?.stats;
    return {
      activeCourses: s?.activeCourses ?? 0,
      pendingAssignments: s?.pendingAssignments ?? 0,
      upcomingExams: s?.upcomingExams ?? 0,
      certificatesEarned: s?.certificatesEarned ?? 0,
    };
  }, [data]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-black">Student Dashboard</h1>
        <p className="mt-2 text-black/60">
          Welcome back, <span className="font-semibold text-black/80">{meName}</span>! Here is an overview of your
          academic progress.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Courses" value={loading ? '—' : stats.activeCourses} badge="+1 new" />
        <StatCard label="Pending Assignments" value={loading ? '—' : stats.pendingAssignments} badge="Due soon" />
        <StatCard label="Upcoming Exams" value={loading ? '—' : stats.upcomingExams} badge="Next: May 15" />
        <StatCard label="Certificates Earned" value={loading ? '—' : stats.certificatesEarned} badge="All-time" />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold tracking-tight text-black">Recent Activity</h2>
            <Link
              href="/my-courses"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View All
            </Link>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="space-y-6">
              {(data?.recentActivity ?? []).length === 0 ? (
                <div className="text-sm text-black/60">
                  {loading ? 'Loading activity…' : 'No recent activity yet. Start learning a course to see updates.'}
                </div>
              ) : (
                (data?.recentActivity ?? []).slice(0, 3).map((a) => (
                  <div key={a.id} className="flex items-start gap-4">
                    <div className="mt-1 h-10 w-10 rounded-full bg-emerald-50 text-emerald-700 grid place-items-center font-extrabold">
                      ✓
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-black">{a.title}</div>
                      {a.subtitle ? <div className="text-sm text-black/70">{a.subtitle}</div> : null}
                      {a.timestamp ? <div className="mt-1 text-xs font-semibold text-black/40">{a.timestamp}</div> : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-black">Course Progress</h2>
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="space-y-5">
              {(data?.courseProgress ?? []).length === 0 ? (
                <div className="text-sm text-black/60">
                  {loading ? 'Loading progress…' : 'No progress data yet.'}
                </div>
              ) : (
                (data?.courseProgress ?? []).slice(0, 3).map((p) => (
                  <ProgressRow key={p.courseId} title={p.courseTitle} percent={p.percent} />
                ))
              )}
              <Link
                href="/my-courses"
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-black/5 px-4 py-3 text-sm font-bold text-black/80 hover:bg-black/10"
              >
                Open Study Planner
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
