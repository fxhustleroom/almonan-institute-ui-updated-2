'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  fetchCourseDetails,
  fetchCourseOutline,
  type CourseDetails,
  type CourseOutline,
} from '@/lib/queries';

export default function CourseLearningOutlinePage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const [details, setDetails] = useState<CourseDetails | null>(null);
  const [outline, setOutline] = useState<CourseOutline | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [d, o] = await Promise.all([
          fetchCourseDetails(courseId),
          fetchCourseOutline(courseId),
        ]);
        if (!alive) return;
        setDetails(d);
        setOutline(o);
        const firstModule = o.modules?.[0];
        setSelectedModuleId(firstModule?.id ?? null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [courseId]);

  const selected = useMemo(() => {
    const mods = outline?.modules ?? [];
    return mods.find((m) => m.id === selectedModuleId) ?? mods[0];
  }, [outline, selectedModuleId]);

  const progressPct = outline?.progressPct ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-neutral-500">
            My Courses <span className="mx-2">›</span>{' '}
            <span className="font-medium text-neutral-700">{details?.title ?? 'Course'}</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900">
            {details?.title ?? 'Course'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/library"
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50"
          >
            View Resources
          </Link>
          <Link
            href="/support"
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          >
            Support
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Left: Course Navigator */}
        <aside className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold tracking-wide text-neutral-500">COURSE NAVIGATOR</div>
              <div className="mt-1 text-sm text-neutral-600">
                {(outline?.modules?.length ?? 0)} Modules • {outline?.lessonsTotal ?? 0} Lessons
              </div>
            </div>
            <div className="text-sm font-semibold text-brand">{Math.round(progressPct)}%</div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold text-neutral-500">OVERALL PROGRESS</div>
            <div className="mt-2 h-2 w-full rounded-full bg-neutral-100">
              <div
                className="h-2 rounded-full bg-brand"
                style={{ width: `${Math.max(0, Math.min(100, progressPct))}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-neutral-500">
              {outline?.lessonsCompleted ?? 0} of {outline?.lessonsTotal ?? 0} lessons completed
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {(outline?.modules ?? []).map((m, idx) => {
              const active = (selected?.id ?? null) === m.id;
              const locked = m.locked;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedModuleId(m.id)}
                  className={[
                    'w-full rounded-2xl border p-4 text-left transition',
                    active
                      ? 'border-brand bg-brand/10'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50',
                    locked ? 'opacity-60' : '',
                  ].join(' ')}
                >
                  <div className="text-sm font-bold text-neutral-900">
                    Module {String(idx + 1).padStart(2, '0')}: {m.title}
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    {m.lessonsCount} lessons • {m.status}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <Link
              href="/library"
              className="block w-full rounded-2xl bg-neutral-900 px-4 py-3 text-center text-sm font-semibold text-white hover:opacity-95"
            >
              View Resources
            </Link>
          </div>
        </aside>

        {/* Right: Module details */}
        <section className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
            <div className="relative h-44 bg-neutral-900">
              {/* hero image placeholder */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(34,197,94,0.35),transparent_50%)]" />
              <div className="absolute bottom-6 left-6">
                <div className="text-xs font-semibold tracking-wide text-brand">MODULE</div>
                <div className="mt-1 text-3xl font-extrabold text-white">
                  {selected?.title ?? 'Select a module'}
                </div>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-extrabold text-neutral-900">Module Overview</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                {selected?.description ??
                  'This module overview will be loaded from the Learning service. It describes what you will learn and how to complete the lessons.'}
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 p-4">
                  <div className="text-sm font-bold text-neutral-900">Learning objectives</div>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-600">
                    {(selected?.objectives ?? ['Understand core concepts', 'Practice with activities', 'Complete module quiz']).map(
                      (o) => (
                        <li key={o}>{o}</li>
                      )
                    )}
                  </ul>
                </div>
                <div className="rounded-2xl border border-neutral-200 p-4">
                  <div className="text-sm font-bold text-neutral-900">Module details</div>
                  <div className="mt-3 space-y-2 text-sm text-neutral-700">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Estimated time</span>
                      <span className="font-semibold">{selected?.estimatedTime ?? '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Lessons</span>
                      <span className="font-semibold">{selected?.lessonsCount ?? 0} sections</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Assessment</span>
                      <span className="font-semibold">{selected?.assessment ?? '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={
                    selected?.firstLessonId
                      ? `/my-courses/${courseId}/lessons/${selected.firstLessonId}`
                      : `/my-courses/${courseId}`
                  }
                  className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
                >
                  Start Module
                </Link>
                <button className="rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50">
                  Save for Later
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-neutral-900">Lesson Breakdown</h3>
              <div className="text-sm text-neutral-500">
                {(selected?.lessons ?? []).length} lessons
              </div>
            </div>

            <div className="mt-4 divide-y divide-neutral-100">
              {(selected?.lessons ?? []).slice(0, 8).map((l) => (
                <Link
                  key={l.id}
                  href={`/my-courses/${courseId}/lessons/${l.id}`}
                  className="flex items-center justify-between py-4 text-sm hover:text-neutral-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-xs font-bold text-brand">
                      {l.code}
                    </div>
                    <div className="font-semibold text-neutral-800">{l.title}</div>
                  </div>
                  <span className="text-neutral-400">›</span>
                </Link>
              ))}
              {loading && (
                <div className="py-6 text-sm text-neutral-500">Loading module and lessons…</div>
              )}
              {!loading && !selected?.lessons?.length && (
                <div className="py-6 text-sm text-neutral-500">
                  No lessons found. This page maps to <span className="font-mono">GET /learning/courses/:courseId/outline</span>.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4 text-sm text-neutral-700">
        <span className="font-semibold">API mapping:</span> Course details uses{' '}
        <span className="font-mono">GET /courses/:id</span> and learning outline uses{' '}
        <span className="font-mono">GET /learning/courses/:courseId/outline</span>.
      </div>
    </div>
  );
}
