'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  downloadCertificatesBundle,
  fetchMyCertificates,
  shareCertificates,
  type CertificateItem
} from '@/lib/queries';

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

function formatDate(d?: string | null) {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

function StatCard({
  label,
  value,
  badge
}: {
  label: string;
  value: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-extrabold tracking-[0.22em] text-ink/50">{label}</div>
          <div className="mt-2 text-2xl font-extrabold text-ink">{value}</div>
        </div>
        {badge ? <div className="rounded-xl bg-almonanGreen-100 px-3 py-2 text-almonanGreen-700">{badge}</div> : null}
      </div>
    </div>
  );
}

function VerifiedPill({ status }: { status?: string }) {
  const ok = String(status || '').toLowerCase().includes('verified');
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-extrabold tracking-widest',
        ok ? 'bg-almonanGreen-100 text-almonanGreen-700' : 'bg-black/5 text-ink/60'
      )}
    >
      {ok ? 'VERIFIED' : 'PENDING'}
    </span>
  );
}

function CertificateCard({
  c,
  onDownload
}: {
  c: CertificateItem;
  onDownload: (c: CertificateItem) => void;
}) {
  const preview = c.previewUrl || c.pdfUrl || 'https://placehold.co/640x420/png';
  return (
    <div className="card overflow-hidden">
      <div className="bg-black/[0.02] p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt={c.title}
          className="h-36 w-full rounded-xl object-cover"
        />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-extrabold text-ink">{c.title}</div>
            <div className="mt-1 text-xs text-ink/50">{c.courseTitle || 'Certificate of Completion'}</div>
          </div>
          <VerifiedPill status={c.status} />
        </div>

        <div className="mt-4 space-y-2 text-xs text-ink/60">
          <div className="flex items-center gap-2">
            <span className="opacity-70">📅</span>
            <span>
              Issued on <span className="font-semibold text-ink/70">{formatDate(c.issuedAt)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-70">🆔</span>
            <span className="font-semibold text-ink/70">{c.id}</span>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary mt-5 w-full"
          onClick={() => onDownload(c)}
        >
          ⬇&nbsp;&nbsp;Download PDF
        </button>
      </div>
    </div>
  );
}

export default function CertificatesPage() {
  const [q, setQ] = useState('');

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['certificates', q],
    queryFn: () => fetchMyCertificates({ q })
  });

  const items = data?.items ?? [];
  const stats = data?.stats;

  const computedStats = useMemo(() => {
    const totalEarned = stats?.totalEarned ?? items.length;
    const latestAwardDate =
      stats?.latestAwardDate ??
      items
        .map((x) => x.issuedAt)
        .filter(Boolean)
        .sort()
        .slice(-1)[0] ??
      null;

    return {
      totalEarned,
      latestAwardDate,
      gpaEquivalent: stats?.gpaEquivalent ?? null,
      creditsValid: stats?.creditsValid ?? null
    };
  }, [items, stats]);

  const downloadBundleMutation = useMutation({
    mutationFn: downloadCertificatesBundle,
    onSuccess: (res) => {
      if (res?.url) window.open(res.url, '_blank', 'noopener,noreferrer');
      else alert('Bundle download is not available yet (API did not return a url).');
    }
  });

  const shareAllMutation = useMutation({
    mutationFn: async () => {
      const ids = items.map((x) => x.id);
      return shareCertificates({ certificateIds: ids });
    },
    onSuccess: (res) => {
      if (res?.url) {
        navigator.clipboard?.writeText(res.url);
        alert('Share link copied to clipboard.');
      } else {
        alert('Share link is not available yet (API did not return a url).');
      }
    }
  });

  function handleDownloadOne(c: CertificateItem) {
    if (c.pdfUrl) window.open(c.pdfUrl, '_blank', 'noopener,noreferrer');
    else alert('This certificate has no pdfUrl from the API yet.');
  }

  return (
    <div className="p-6 lg:p-10">
      {/* Breadcrumb + Header Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="text-sm text-ink/50">
            Student Portal <span className="mx-2">›</span> Certificates Gallery
          </div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink">
            Earned Achievements
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-ink/60">
            View, download, and share your official academic milestones and specialized course completions at Almonan Institute.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn-outline h-[44px] px-5"
            disabled={!items.length || shareAllMutation.isPending}
            onClick={() => shareAllMutation.mutate()}
          >
            ↗&nbsp;&nbsp;Share All
          </button>

          <button
            type="button"
            className="btn-primary h-[44px] px-5"
            disabled={!items.length || downloadBundleMutation.isPending}
            onClick={() => downloadBundleMutation.mutate()}
          >
            ⬇&nbsp;&nbsp;Download Bundle
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6 flex items-center gap-3">
        <div className="card flex w-full max-w-xl items-center gap-2 px-4 py-3">
          <span className="text-ink/40">🔎</span>
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
            placeholder="Search certificates..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="btn-outline h-[44px] px-5"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          ↻&nbsp;&nbsp;Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="TOTAL EARNED" value={String(computedStats.totalEarned)} badge={<span>🏅</span>} />
        <StatCard label="LATEST AWARD" value={formatDate(computedStats.latestAwardDate)} badge={<span>🗓️</span>} />
        <StatCard
          label="GPA EQUIVALENT"
          value={computedStats.gpaEquivalent == null ? '—' : String(computedStats.gpaEquivalent)}
          badge={<span>⭐</span>}
        />
        <StatCard
          label="CREDITS VALID"
          value={computedStats.creditsValid == null ? '—' : String(computedStats.creditsValid)}
          badge={<span>🎓</span>}
        />
      </div>

      {/* Grid */}
      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card h-[320px] animate-pulse bg-white" />
            ))}
          </div>
        ) : items.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <CertificateCard key={c.id} c={c} onDownload={handleDownloadOne} />
            ))}
          </div>
        ) : (
          <div className="card mt-6 p-10 text-center">
            <div className="text-lg font-extrabold text-ink">No certificates found.</div>
            <div className="mt-2 text-sm text-ink/60">
              When you complete courses, your certificates will appear here.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
