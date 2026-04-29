'use client';

import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLibraryBooks } from '@/lib/queries';

type UiBook = {
  id: string;
  title: string;
  author?: string | null;
  category?: string | null;
  coverImageUrl?: string | null;
  isFree?: boolean;
  downloadUrl?: string | null;
  readUrl?: string | null;
};

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

// Safe mapper: supports different backend shapes without crashing UI
function normalizeBooks(input: any): UiBook[] {
  const arr = Array.isArray(input) ? input : Array.isArray(input?.items) ? input.items : [];
  return arr
    .map((b: any) => ({
      id: String(b?.id ?? b?._id ?? crypto.randomUUID()),
      title: String(b?.title ?? b?.name ?? 'Untitled'),
      author: b?.author ?? b?.by ?? b?.instructorName ?? b?.publisher ?? null,
      category: b?.category ?? b?.department ?? b?.tag ?? 'All',
      coverImageUrl: b?.coverImageUrl ?? b?.coverUrl ?? b?.imageUrl ?? b?.thumbnailUrl ?? null,
      isFree: typeof b?.isFree === 'boolean' ? b.isFree : true,
      downloadUrl: b?.downloadUrl ?? b?.fileUrl ?? b?.pdfUrl ?? null,
      readUrl: b?.readUrl ?? b?.viewerUrl ?? b?.url ?? null
    }))
    .filter((x: UiBook) => x.title);
}

const CATEGORIES = [
  { key: 'all', label: 'All Resources' },
  { key: 'Computer Science', label: 'Computer Science' },
  { key: 'Life Sciences', label: 'Life Sciences' },
  { key: 'Engineering', label: 'Engineering' },
  { key: 'Mathematics', label: 'Mathematics' },
  { key: 'Economics', label: 'Economics' }
] as const;

export default function StudentLibraryPage() {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['key']>('all');

  // Debounce search to avoid spamming API
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const params = useMemo(() => {
    return {
      q: debouncedQ || undefined,
      category: category === 'all' ? undefined : category
    };
  }, [debouncedQ, category]);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['student-library-books', params],
    queryFn: async () => {
      const res = await fetchLibraryBooks(params);
      return normalizeBooks(res);
    }
  });

  const books = data ?? [];

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div>
        <h1 className="text-5xl font-extrabold tracking-tight text-ink">Knowledge for Everyone</h1>
        <p className="mt-3 max-w-3xl text-base text-ink/60">
          Access our curated collection of free textbooks, journals, and open-source learning materials.
        </p>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-5 py-4 shadow-soft">
          <span className="text-almonanGreen-700">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for titles, authors, or ISBN..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
          />
          <button
            type="button"
            onClick={() => refetch()}
            className={cn(
              'rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-extrabold text-ink/70 hover:bg-black/5',
              isFetching && 'opacity-60'
            )}
          >
            {isFetching ? 'Searching…' : 'Search'}
          </button>
        </div>
      </div>

      {/* Category pills (match UI row) */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {CATEGORIES.map((c) => {
          const active = category === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-extrabold transition',
                active
                  ? 'bg-almonanGreen-500 text-white shadow-soft'
                  : 'border border-black/10 bg-white text-ink/70 hover:bg-black/5 hover:text-ink'
              )}
            >
              {c.label}
              <span className={cn('text-xs', active ? 'opacity-90' : 'opacity-60')}>▾</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-8">
        {isLoading ? (
          <div className="card p-6 text-ink/60">Loading library resources…</div>
        ) : isError ? (
          <div className="card p-6">
            <div className="text-sm font-extrabold text-ink">Couldn’t load library resources</div>
            <div className="mt-2 text-sm text-ink/60">
              Please check your API connection and try again.
            </div>
            <button onClick={() => refetch()} className="btn-outline mt-4">
              Try again
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-lg font-extrabold text-ink">No resources found</div>
            <div className="mt-2 text-sm text-ink/60">Try a different keyword or category.</div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((b) => (
              <div key={b.id} className="card overflow-hidden">
                {/* Cover */}
                <div className="relative bg-black/[0.03] p-5">
                  <div className="absolute right-4 top-4 rounded-full bg-almonanGreen-500 px-3 py-1 text-xs font-extrabold text-white">
                    {b.isFree ? 'FREE' : 'PAID'}
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="h-[220px] w-[170px] overflow-hidden rounded-2xl bg-white shadow-soft">
                      {b.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={b.coverImageUrl}
                          alt={b.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-ink/40">
                          No cover
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <div className="text-xs font-extrabold tracking-[0.22em] text-almonanGreen-700">
                    {(b.category ?? 'ALL').toUpperCase()}
                  </div>

                  <div className="mt-2 text-lg font-extrabold text-ink leading-snug">
                    {b.title}
                  </div>

                  <div className="mt-1 text-sm text-ink/60">
                    {b.author ? `By ${b.author}` : 'By Almonan Library'}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <a
                      href={b.readUrl ?? '#'}
                      className={cn(
                        'btn-primary h-[44px]',
                        !b.readUrl && 'pointer-events-none opacity-60'
                      )}
                    >
                      📖&nbsp;Read
                    </a>

                    <a
                      href={b.downloadUrl ?? '#'}
                      className={cn(
                        'btn-outline h-[44px]',
                        !b.downloadUrl && 'pointer-events-none opacity-60'
                      )}
                    >
                      ⬇️&nbsp;Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
