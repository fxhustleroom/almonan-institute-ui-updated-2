'use client';

import Link from 'next/link';

export default function QuizzesIndexPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Quizzes</h1>
      <p className="mt-2 text-zinc-600">
        This screen is wired for the Almonan Institute API.
        To open a quiz attempt, navigate to:{' '}
        <code className="rounded bg-white px-2 py-1">/quizzes/&lt;quizId&gt;/attempt</code>
      </p>

      <div className="mt-6 rounded-3xl border bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-zinc-900">Demo</div>
            <div className="text-sm text-zinc-600">Open a placeholder attempt route</div>
          </div>
          <Link
            href="/quizzes/1/attempt?attemptId=1"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
          >
            Open Demo Attempt
          </Link>
        </div>
      </div>
    </div>
  );
}
