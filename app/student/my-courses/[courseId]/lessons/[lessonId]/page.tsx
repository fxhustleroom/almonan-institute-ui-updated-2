'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  fetchCourseOutline,
  fetchLesson,
  type CourseOutline,
  type Lesson,
} from '@/lib/queries';

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-emerald-50 text-emerald-800'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

export default function LessonViewerPage() {
  const params = useParams<{ courseId: string; lessonId: string }>();
  const search = useSearchParams();
  const moduleId = search.get('moduleId') || '';
  const courseId = params.courseId;
  const lessonId = params.lessonId;

  const [outline, setOutline] = useState<CourseOutline | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [tab, setTab] = useState<'video' | 'reading' | 'assignments'>('video');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [o, l] = await Promise.all([
          fetchCourseOutline(courseId),
          fetchLesson(courseId, lessonId),
        ]);
        if (cancelled) return;
        setOutline(o);
        setLesson(l);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId]);

  const module = useMemo(() => {
    if (!outline) return null;
    if (!moduleId) return outline.modules[0] ?? null;
    return outline.modules.find((m) => m.id === moduleId) ?? outline.modules[0] ?? null;
  }, [outline, moduleId]);

  const lessonIndex = useMemo(() => {
    if (!module) return -1;
    return module.lessons.findIndex((l) => l.id === lessonId);
  }, [module, lessonId]);

  const prevLesson = module && lessonIndex > 0 ? module.lessons[lessonIndex - 1] : null;
  const nextLesson =
    module && lessonIndex >= 0 && lessonIndex < module.lessons.length - 1
      ? module.lessons[lessonIndex + 1]
      : null;

  const percent = outline?.overallProgressPercent ?? 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
      {/* Left syllabus */}
      <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <div className="text-lg font-extrabold text-slate-900">Course Syllabus</div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Progress</span>
              <span className="font-semibold text-emerald-700">{Math.round(percent)}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {outline?.completedLessonsCount ?? 0} of {outline?.totalLessonsCount ?? 0} lessons completed
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {(outline?.modules ?? []).map((m) => (
            <div key={m.id}>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{m.title}</div>
              <div className="mt-3 space-y-2">
                {m.lessons.map((l) => {
                  const active = l.id === lessonId;
                  const href = `/my-courses/${courseId}/lessons/${l.id}?moduleId=${m.id}`;
                  return (
                    <Link
                      key={l.id}
                      href={href}
                      className={`flex items-center gap-3 rounded-2xl border p-3 text-sm transition ${
                        active
                          ? 'border-emerald-400 bg-emerald-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                          active
                            ? 'bg-emerald-600 text-white'
                            : l.isLocked
                              ? 'bg-slate-200 text-slate-500'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {l.indexLabel}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-slate-900">{l.title}</div>
                      </div>
                      {l.isLocked ? (
                        <span className="text-xs font-semibold text-slate-400">Locked</span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Link
            href={`/my-courses/${courseId}`}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-[#5a3b32] px-4 py-3 text-sm font-extrabold text-white shadow-sm hover:opacity-95"
          >
            View Resources
          </Link>
        </div>
      </aside>

      {/* Main */}
      <section className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Module {module?.indexLabel ?? ''} · {module?.title ?? ''}
            </div>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
              Lesson {lesson?.indexLabel ?? ''}: {lesson?.title ?? ''}
            </h1>
          </div>
          <button className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-50">
            <span className="text-xs">PDF</span>
            Download PDF
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
            <TabButton active={tab === 'video'} onClick={() => setTab('video')}>
              Video Lesson
            </TabButton>
            <TabButton active={tab === 'reading'} onClick={() => setTab('reading')}>
              Reading Material
            </TabButton>
            <TabButton active={tab === 'assignments'} onClick={() => setTab('assignments')}>
              Assignments
            </TabButton>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
            ) : tab === 'video' ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
                <div className="aspect-video w-full">
                  {/* If lesson.videoUrl exists we use it, else a poster placeholder */}
                  {lesson?.videoUrl ? (
                    <video className="h-full w-full" controls src={lesson.videoUrl} />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-slate-200">
                      <div className="text-center">
                        <div className="text-sm font-semibold">Video placeholder</div>
                        <div className="text-xs text-slate-300">Connect to lesson.videoUrl</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : tab === 'reading' ? (
              <div className="prose max-w-none">
                <h3>Lesson Overview</h3>
                <p>{lesson?.overview ?? 'No reading content yet. (Connect to lesson.overview)'}</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                Assignments for this lesson will appear here. (Connect to /assignments endpoints)
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href={
                  prevLesson
                    ? `/my-courses/${courseId}/lessons/${prevLesson.id}?moduleId=${module?.id ?? ''}`
                    : `/my-courses/${courseId}`
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                ← Previous Lesson
              </Link>

              <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-extrabold text-white shadow-sm hover:opacity-95">
                ✓ Mark as Complete
              </button>

              <Link
                href={
                  nextLesson
                    ? `/my-courses/${courseId}/lessons/${nextLesson.id}?moduleId=${module?.id ?? ''}`
                    : `/my-courses/${courseId}`
                }
                className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
              >
                Next Lesson →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
