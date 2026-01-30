'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function QnaThreadDetailsPage() {
  const params = useParams<{ moduleId: string; threadId: string }>();
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="text-sm text-zinc-500">
        <Link href={`/student/qna/${params.moduleId}`} className="text-green-700 hover:text-green-800">
          ← Back to Threads
        </Link>
      </div>
      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black">Thread Details</h1>
        <p className="mt-2 text-zinc-600">
          This screen is ready for API wiring. Endpoint suggestion: GET /qna/threads/{'{'}threadId{'}'}.
        </p>
        <div className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-700">
          Thread ID: <span className="font-mono">{params.threadId}</span>
        </div>
      </div>
    </div>
  );
}
