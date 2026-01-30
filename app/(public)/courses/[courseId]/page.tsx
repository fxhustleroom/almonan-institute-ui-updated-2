'use client';

import React from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PublicLayout } from '@/components/PublicLayout';
import { fetchPublicCourse } from '@/lib/queries';

const demoModules = [
  { id: 'm1', title: 'Introduction to Advanced Mechanisms', lessons: ['1.1 Review of Nucleophilic Substitution', '1.2 Transition State Theory'] },
  { id: 'm2', title: 'Stereochemical Control in Synthesis', lessons: [] },
  { id: 'm3', title: 'Retrosynthetic Analysis & Total Synthesis', lessons: [] }
];

export default function CourseDetailsPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['public-course', courseId],
    queryFn: () => fetchPublicCourse(courseId)
  });

  return (
    <PublicLayout active="courses">
      <div className="py-10 md:py-14">
        {isLoading && <div className="muted">Loading course…</div>}
        {isError && <div className="text-sm text-red-600">Failed to load course. Check API.</div>}
        {course && (
          <>
            <div className="card p-6 md:p-8">
              <div className="grid gap-8 md:grid-cols-[220px_1fr_280px] md:items-center">
                <div className="relative h-36 w-52 overflow-hidden rounded-xl2 bg-black/5">
                  <Image src="/mock/course-details.png" alt={course.title} fill className="object-cover" />
                </div>

                <div className="space-y-2">
                  <span className="inline-flex rounded-full bg-almonanGreen-100 px-3 py-1 text-xs font-extrabold text-almonanGreen-700">
                    {course.level ?? 'ADVANCED LEVEL'}
                  </span>
                  <div className="text-3xl font-extrabold">{course.title}</div>
                  <div className="muted text-sm">
                    <span className="mr-3">⭐ {course.rating ?? 4.9} ({course.studentsCount ?? 1240} reviews)</span>
                    <span>👥 {course.studentsCount ?? 8500} students</span>
                  </div>
                </div>

                <div className="space-y-3 text-right">
                  <div className="muted text-xs">Full Course Price</div>
                  <div className="text-3xl font-extrabold">
                    {course.isFree ? 'FREE' : `$${Number(course.price ?? 149.99).toFixed(2)}`}
                  </div>
                  <button className="btn-primary w-full">Enroll Now</button>
                  <div className="text-xs text-ink/40">30-day money-back guarantee</div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
              <div>
                <div className="flex gap-6 border-b border-black/10 text-sm font-semibold text-ink/60">
                  {['Overview','Modules','Reviews','Requirements'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={t === 'Overview' ? 'border-b-2 border-almonanGreen-500 pb-3 text-almonanGreen-700' : 'pb-3'}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="mt-8">
                  <div className="text-2xl font-extrabold">About this Course</div>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">
                    {course.description ??
                      'This comprehensive course provides a deep dive into advanced principles, focusing on practical problem-solving and professional readiness.'}
                  </p>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {[
                      'Master complex analysis techniques.',
                      'Understand modern models and frameworks.',
                      'Predict outcomes in multi-step projects.',
                      'Explore real-world applications with case studies.'
                    ].map((b) => (
                      <div key={b} className="card flex items-center gap-3 p-4">
                        <span className="text-almonanGreen-700">✓</span>
                        <span className="text-sm font-semibold">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-10">
                  <div className="flex items-end justify-between">
                    <div className="text-2xl font-extrabold">Course Modules</div>
                    <div className="muted text-xs">12 Sections • 48 Lectures</div>
                  </div>

                  <div className="mt-4 space-y-4">
                    {demoModules.map((m, idx) => (
                      <div key={m.id} className="card p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-extrabold text-ink/50">{String(idx + 1).padStart(2,'0')}</span>
                            <span className="text-sm font-extrabold">{m.title}</span>
                          </div>
                          <span className="text-ink/40">{idx === 0 ? '▾' : '🔒'}</span>
                        </div>

                        {idx === 0 && (
                          <div className="mt-4 space-y-2 border-t border-black/5 pt-3">
                            {m.lessons.map((l, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-almonanGreen-700">▶</span>
                                  <span className="text-ink/70">{l}</span>
                                </div>
                                <span className="text-xs text-ink/50">{i === 0 ? '15:20' : '22:45'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="space-y-5">
                <div className="card p-5">
                  <div className="text-sm font-extrabold">Course Info</div>
                  <div className="mt-4 space-y-3 text-sm text-ink/70">
                    <div className="flex items-center justify-between"><span>⏱ Duration</span><span className="font-semibold text-ink">24.5 Hours</span></div>
                    <div className="flex items-center justify-between"><span>📈 Level</span><span className="font-semibold text-ink">{course.level ?? 'Advanced'}</span></div>
                    <div className="flex items-center justify-between"><span>📄 Resources</span><span className="font-semibold text-ink">12 Downloadables</span></div>
                    <div className="flex items-center justify-between"><span>🏅 Certification</span><span className="font-semibold text-ink">Yes</span></div>
                  </div>
                </div>

                <div className="section-mint p-5">
                  <div className="text-sm font-extrabold text-ink">Institutional Access</div>
                  <p className="mt-2 text-sm text-ink/70">
                    Enroll your entire lab or department. We offer custom licensing for research institutions and universities.
                  </p>
                  <button className="btn-outline mt-4 w-full border-almonanGreen-500 text-almonanGreen-700">
                    Inquiry for Teams
                  </button>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
