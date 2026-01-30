'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PublicLayout } from '@/components/PublicLayout';
import { fetchPublicCourses } from '@/lib/queries';
import { CourseCard } from '@/components/CourseCard';

export default function CoursesPage() {
  const [q, setQ] = React.useState('');
  const [category, setCategory] = React.useState<string>('Business & Management');
  const [price, setPrice] = React.useState<'all'|'free'|'paid'>('all');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-courses', { q, category, price }],
    queryFn: () => fetchPublicCourses({ q, category, price })
  });

  return (
    <PublicLayout active="courses">
      <div className="py-10 md:py-14">
        <div className="card bg-almonanGreen-900 p-8 text-white md:p-10">
          <div className="text-center">
            <div className="text-4xl font-extrabold md:text-5xl">Find your next course</div>
            <p className="mt-2 text-sm text-white/80">
              Elevate your professional journey with academic excellence and practical skills at Almonan Institute.
            </p>
          </div>

          <div className="mx-auto mt-6 flex max-w-2xl items-center gap-3 rounded-xl2 bg-white p-2">
            <div className="px-2 text-black/50">🔎</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="What do you want to learn today?"
              className="w-full bg-transparent px-2 py-2 text-sm text-ink outline-none"
            />
            <button className="btn-primary !px-6 !py-2.5">Search</button>
          </div>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-[280px_1fr]">
          {/* Filters */}
          <aside className="space-y-6">
            <div className="flex items-center gap-2 text-sm font-extrabold"><span>≡</span> Filters</div>

            <div className="space-y-3">
              <div className="text-xs font-extrabold text-ink/60">CATEGORIES</div>
              {['Business & Management','Technology & IT','Health Sciences','Arts & Humanities'].map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={category === c}
                    onChange={() => setCategory(c)}
                    className="h-4 w-4 accent-almonanGreen-500"
                  />
                  {c}
                </label>
              ))}
            </div>

            <div className="space-y-3">
              <div className="text-xs font-extrabold text-ink/60">PRICE</div>
              {[
                { label: 'All Prices', value: 'all' },
                { label: 'Free Courses', value: 'free' },
                { label: 'Paid Programs', value: 'paid' }
              ].map((p) => (
                <label key={p.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="price"
                    checked={price === p.value}
                    onChange={() => setPrice(p.value as any)}
                    className="h-4 w-4 accent-almonanGreen-500"
                  />
                  {p.label}
                </label>
              ))}
            </div>

            <button type="button" className="btn-outline w-full">Clear All Filters</button>
          </aside>

          {/* Catalog */}
          <section>
            <div className="flex items-center justify-between">
              <div className="text-lg font-extrabold">Course Catalog</div>
              <div className="flex items-center gap-2">
                <button className="rounded-full bg-almonanGreen-100 px-4 py-2 text-xs font-extrabold text-almonanGreen-700">
                  ALL COURSES
                </button>
                <button className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-ink/70 border border-black/10">
                  NEWEST
                </button>
              </div>
            </div>

            {isLoading && <div className="mt-6 muted">Loading courses…</div>}
            {isError && <div className="mt-6 text-sm text-red-600">Failed to load courses. Check API.</div>}
            {!isLoading && !isError && (
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {(data ?? []).map((c) => <CourseCard key={c.id} course={c} />)}
              </div>
            )}

            {/* Pagination look (UI only for now) */}
            <div className="mt-10 flex items-center justify-center gap-2">
              {['‹','1','2','3','›'].map((p, idx) => (
                <button
                  key={idx}
                  className={p === '1'
                    ? 'h-9 w-9 rounded-lg bg-almonanGreen-500 text-white font-extrabold'
                    : 'h-9 w-9 rounded-lg border border-black/10 bg-white text-ink/60'}
                  type="button"
                >
                  {p}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
