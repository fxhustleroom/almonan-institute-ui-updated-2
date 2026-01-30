'use client';

import Link from 'next/link';

export default function QnaIndexPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
        Q&amp;A
      </h1>
      <p className="mt-2 text-zinc-600">
        Pick a course module to view discussions. In the real app, you’d list modules from your enrolled courses.
      </p>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="text-sm text-zinc-700">Quick demo links:</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700" href="/qna/1">
            Module 1
          </Link>
          <Link className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100" href="/qna/2">
            Module 2
          </Link>
        </div>
      </div>
    </div>
  );
}
