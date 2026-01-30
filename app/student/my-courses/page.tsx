'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchMyCourses, fetchMe, type CourseSummary } from '@/lib/queries';

function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="h-2 w-full rounded-full bg-black/10">
      <div className="h-2 rounded-full bg-brand" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function MyCoursesPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [name, setName] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [me, list] = await Promise.all([fetchMe().catch(() => null), fetchMyCourses()]);
        if (!mounted) return;
        setName(me?.fullName ?? 'Student');
        setCourses(list ?? []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const active = courses.filter((c) => (c.progress ?? 0) < 100).length;
    const completed = courses.filter((c) => (c.progress ?? 0) >= 100).length;
    const hours = courses.reduce((acc, c) => acc + (c.learningHours ?? 0), 0);
    return { active, completed, hours };
  }, [courses]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-dark">My Enrolled Courses</h1>
        <p className="mt-1 text-sm text-black/60">Welcome back, {name}. Pick up right where you left off.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-soft">
          <div className="text-xs font-semibold tracking-widest text-black/40">ACTIVE COURSES</div>
          <div className="mt-2 text-4xl font-extrabold text-brand-dark">{stats.active}</div>
          <div className="mt-2 text-sm text-brand">↗ 1 new this month</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-soft">
          <div className="text-xs font-semibold tracking-widest text-black/40">COMPLETED</div>
          <div className="mt-2 text-4xl font-extrabold text-brand-dark">{stats.completed}</div>
          <div className="mt-2 text-sm text-black/50">Target: 15 by Semester End</div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-soft">
          <div className="text-xs font-semibold tracking-widest text-black/40">LEARNING HOURS</div>
          <div className="mt-2 text-4xl font-extrabold text-brand-dark">{stats.hours}</div>
          <div className="mt-2 text-sm text-blue-600">↻ 12 hours this week</div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {(loading ? Array.from({ length: 4 }) : courses.slice(0, 4)).map((course, idx) => {
          if (!course) {
            return (
              <div
                key={idx}
                className="h-[170px] animate-pulse rounded-2xl border border-black/10 bg-white/70 shadow-soft"
              />
            );
          }

          const progress = course.progress ?? 0;

          return (
            <div
              key={course.id}
              className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-soft"
            >
              <div className="grid grid-cols-2">
                <div
                  className="min-h-[170px] bg-cover bg-center"
                  style={{ backgroundImage: `url(${course.coverUrl || '/assets/course-cover-placeholder.jpg'})` }}
                />
                <div className="p-5">
                  <h3 className="text-lg font-extrabold text-brand-dark">{course.title}</h3>
                  <p className="mt-1 text-sm text-black/60">Instructor: {course.instructorName || 'Almonan Faculty'}</p>

                  <div className="mt-4 text-xs font-semibold text-black/50">Progress: {Math.round(progress)}%</div>
                  <div className="mt-2">
                    <ProgressBar value={progress} />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-black/50">CURRENT TOPIC</div>
                    <Link
                      href={`/my-courses/${course.id}`}
                      className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-95"
                    >
                      Continue
                    </Link>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-brand-dark">{course.currentTopic || 'Continue learning'}</div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <aside className="fixed bottom-10 left-6 hidden w-[260px] rounded-2xl bg-brand-dark p-5 text-white shadow-soft lg:block">
        <div className="text-xs font-semibold tracking-widest text-white/70">SUPPORT</div>
        <div className="mt-2 text-sm font-semibold">Need help with your curriculum? Ask our faculty.</div>
        <Link
          href="/support"
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white"
        >
          Contact Us
        </Link>
      </aside>
    </div>
  );
}
