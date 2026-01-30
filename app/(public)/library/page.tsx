'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PublicLayout } from '@/components/PublicLayout';
import { fetchLibraryBooks } from '@/lib/queries';
import { BookCard } from '@/components/BookCard';

const chips = ['All Resources','Computer Science','Life Sciences','Engineering','Mathematics','Economics'];

export default function LibraryPage() {
  const [q, setQ] = React.useState('');
  const [category, setCategory] = React.useState('All Resources');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['library-books', { q, category }],
    queryFn: () => fetchLibraryBooks({ q, category: category === 'All Resources' ? undefined : category })
  });

  return (
    <PublicLayout active="library">
      <div className="py-10 md:py-14">
        <div className="text-center">
          <div className="text-2xl font-extrabold tracking-widest text-almonanBrown-700">FREE ACADEMIC LIBRARY</div>
        </div>

        <div className="mt-8">
          <div className="text-5xl font-extrabold text-almonanBrown-700">Knowledge for Everyone</div>
          <p className="muted mt-2 max-w-2xl text-base">
            Access our curated collection of free textbooks, journals, and open-source learning materials.
          </p>

          <div className="card mt-6 flex items-center gap-3 p-4">
            <span className="text-almonanGreen-700">🔎</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for titles, authors, or ISBN..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={c === category
                  ? 'rounded-full bg-almonanGreen-500 px-4 py-2 text-xs font-extrabold text-white shadow-soft'
                  : 'rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-extrabold text-ink/70'}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <div className="mt-8 muted">Loading library…</div>}
        {isError && <div className="mt-8 text-sm text-red-600">Failed to load books. Check API.</div>}
        {!isLoading && !isError && (
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {(data ?? []).map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
