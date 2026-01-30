'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PublicLayout } from '@/components/PublicLayout';
import { fetchBookstoreProducts } from '@/lib/queries';
import { ProductCard } from '@/components/ProductCard';

const tabs = ['All Collections','Required Textbooks','Supplements','Stationery','E-books'];

export default function BookstorePage() {
  const [q, setQ] = React.useState('');
  const [tab, setTab] = React.useState('All Collections');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['bookstore-products', { q, tab }],
    queryFn: () => fetchBookstoreProducts({ q, category: tab === 'All Collections' ? undefined : tab })
  });

  return (
    <PublicLayout active="bookstore">
      <div className="py-10 md:py-14">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-extrabold tracking-widest text-ink/40">PORTAL &gt; BOOKSTORE</div>
            <div className="mt-1 text-4xl font-extrabold text-almonanGreen-900">Academic Bookstore</div>
            <div className="muted text-sm italic">Authorized learning materials for the {new Date().getFullYear()} semester</div>
          </div>

          <div className="w-full max-w-md">
            <div className="card flex items-center gap-2 px-4 py-3">
              <span className="text-ink/50">🔎</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Search textbooks..."
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={t === tab
                ? 'rounded-full bg-almonanGreen-900 px-4 py-2 text-xs font-extrabold text-white shadow-soft'
                : 'rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-extrabold text-ink/70'}
            >
              {t}
            </button>
          ))}
        </div>

        {isLoading && <div className="mt-8 muted">Loading bookstore…</div>}
        {isError && <div className="mt-8 text-sm text-red-600">Failed to load products. Check API.</div>}
        {!isLoading && !isError && (
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {(data ?? []).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        <div className="mt-10 flex items-center justify-center">
          <button className="btn-outline !px-8">Show More Products ▾</button>
        </div>
      </div>
    </PublicLayout>
  );
}
