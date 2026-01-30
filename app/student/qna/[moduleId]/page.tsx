'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchQnaThreads, type QnaThread } from '@/lib/queries';

function Pill({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active
          ? 'border-green-200 bg-green-50 text-green-900'
          : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
      }`}
      type="button"
    >
      {label}
    </button>
  );
}

function Badge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls =
    s === 'answered'
      ? 'bg-green-100 text-green-800'
      : s === 'unanswered'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-zinc-200 text-zinc-800';
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {status.toUpperCase()}
    </span>
  );
}

export default function ModuleQnaDiscussionPage() {
  const params = useParams<{ moduleId: string }>();
  const moduleId = params.moduleId;

  const [threads, setThreads] = useState<QnaThread[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'unanswered' | 'answered' | 'closed'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchQnaThreads(moduleId)
      .then((data) => {
        if (!mounted) return;
        setThreads(data.threads ?? []);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load Q&A threads');
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [moduleId]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return threads;
    return threads.filter((t) => (t.status ?? '').toLowerCase() === statusFilter);
  }, [threads, statusFilter]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span>My Modules</span>
          <span>›</span>
          <span className="text-zinc-800">Module Discussion</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900">Module Discussion</h1>
            <p className="mt-1 text-zinc-600">Discuss course questions with instructors and classmates.</p>
          </div>
          <button
            type="button"
            className="rounded-xl bg-green-500 px-5 py-3 font-semibold text-white shadow-sm hover:bg-green-600"
          >
            + Ask a question
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex-1">
            <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <span className="text-zinc-400">🔎</span>
              <input
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Search keywords in threads..."
              />
            </div>
          </div>
          <Pill label="All Threads" active={statusFilter === 'all'} />
          <button onClick={() => setStatusFilter('unanswered')} type="button">
            <Pill label="Unanswered" active={statusFilter === 'unanswered'} />
          </button>
          <button onClick={() => setStatusFilter('answered')} type="button">
            <Pill label="Answered" active={statusFilter === 'answered'} />
          </button>
          <button onClick={() => setStatusFilter('closed')} type="button">
            <Pill label="Closed" active={statusFilter === 'closed'} />
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">Loading threads…</div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">No threads found.</div>
        ) : (
          filtered.map((t) => (
            <div key={t.id} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Badge status={t.status ?? 'Unanswered'} />
                <span className="text-sm text-zinc-500">Posted {t.createdAtLabel ?? 'recently'}</span>
              </div>
              <h3 className="mt-3 text-xl font-extrabold text-zinc-900">{t.title}</h3>
              <p className="mt-2 text-zinc-700">{t.preview ?? t.body ?? 'Open this thread to read more.'}</p>

              {t.staffReplyPreview ? (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="text-xs font-semibold text-green-800">STAFF RESPONSE</div>
                  <div className="mt-1 text-sm text-green-900">“{t.staffReplyPreview}”</div>
                </div>
              ) : null}

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-6 text-zinc-500">
                  <span>💬 {t.repliesCount ?? 0} Replies</span>
                  <span>👍 {t.likesCount ?? 0}</span>
                </div>
                <Link
                  href={`/student/qna/${moduleId}/threads/${t.id}`}
                  className="font-semibold text-green-700 hover:text-green-800"
                >
                  View Discussion →
                </Link>
              </div>
            </div>
          ))
        )}

        <div className="flex justify-center pt-6">
          <button type="button" className="rounded-xl border border-zinc-200 bg-white px-5 py-3 font-semibold">
            Load more threads ▾
          </button>
        </div>
      </div>
    </div>
  );
}
