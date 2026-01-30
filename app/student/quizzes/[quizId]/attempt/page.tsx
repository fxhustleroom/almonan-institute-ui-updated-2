'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  fetchQuizAttempt,
  submitQuizAnswer,
  finalizeQuizAttempt,
  type QuizAttempt,
} from '@/lib/queries';

function ChoiceRow({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border bg-white px-6 py-5 text-left text-base transition ${
        selected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-zinc-200 hover:border-zinc-300'
      }`}
    >
      <div className="flex items-center gap-4">
        <span
          className={`h-5 w-5 rounded-full border ${
            selected ? 'border-emerald-600 bg-emerald-500' : 'border-zinc-300'
          }`}
        />
        <span className="text-zinc-800">{label}</span>
      </div>
    </button>
  );
}

export default function QuizAttemptPage() {
  const params = useParams<{ quizId: string }>();
  const sp = useSearchParams();

  const quizId = params.quizId;
  const attemptId = sp.get('attemptId') || quizId; // allow either /quizzes/:quizId/attempt?attemptId=123

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchQuizAttempt(attemptId);
        if (!mounted) return;
        setAttempt(data);
        setActiveQuestionIndex(Math.max(0, (data.currentQuestionIndex ?? 0) - 1));
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load quiz.');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [attemptId]);

  const activeQuestion = useMemo(() => {
    if (!attempt) return null;
    return attempt.questions?.[activeQuestionIndex] ?? null;
  }, [attempt, activeQuestionIndex]);

  const answeredMap = useMemo(() => {
    const map = new Map<string, number>();
    attempt?.answers?.forEach((a) => map.set(a.questionId, a.choiceIndex));
    return map;
  }, [attempt]);

  const total = attempt?.questions?.length ?? 0;
  const questionNumber = Math.min(total, activeQuestionIndex + 1);
  const progressPct = total ? Math.round((questionNumber / total) * 100) : 0;

  async function pickChoice(choiceIndex: number) {
    if (!attempt || !activeQuestion) return;
    setSaving(true);
    try {
      await submitQuizAnswer(attempt.id, {
        questionId: activeQuestion.id,
        choiceIndex,
      });
      // update local
      setAttempt((prev) => {
        if (!prev) return prev;
        const others = (prev.answers ?? []).filter((a) => a.questionId !== activeQuestion.id);
        return { ...prev, answers: [...others, { questionId: activeQuestion.id, choiceIndex }] };
      });
    } finally {
      setSaving(false);
    }
  }

  async function finishAttempt() {
    if (!attempt) return;
    setFinishing(true);
    try {
      const res = await finalizeQuizAttempt(attempt.id);
      setAttempt((prev) => (prev ? { ...prev, status: res.status } : prev));
      alert('Quiz submitted successfully.');
    } finally {
      setFinishing(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="h-8 w-64 animate-pulse rounded bg-zinc-200" />
        <div className="mt-6 h-48 w-full animate-pulse rounded-2xl bg-zinc-200" />
      </div>
    );
  }

  if (!attempt || !activeQuestion) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="rounded-2xl border bg-white p-6">
          <p className="font-semibold text-zinc-900">Unable to load quiz attempt.</p>
          {error ? <p className="mt-2 text-sm text-zinc-600">{error}</p> : null}
          <div className="mt-6">
            <Link className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white" href="/dashboard">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedChoice = answeredMap.get(activeQuestion.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-4 flex items-center justify-between text-sm text-zinc-600">
        <div className="flex items-center gap-2">
          <span>Home</span>
          <span>›</span>
          <Link className="hover:text-zinc-800" href="/quizzes">
            Quizzes
          </Link>
          <span>›</span>
          <span className="text-zinc-900">{attempt.quizTitle ?? 'Quiz Attempt'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">Answers are automatically saved</span>
          {saving ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">Saving…</span> : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main */}
        <div className="rounded-3xl border bg-white p-8">
          <div className="rounded-2xl border bg-zinc-50 px-6 py-4">
            <div className="flex items-center justify-between text-sm font-semibold text-zinc-700">
              <span>MIDTERM ASSESSMENT</span>
              <span>
                Question {questionNumber} of {total} ({progressPct}% Completed)
              </span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-zinc-200">
              <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-2 inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
              QUESTION {questionNumber}
            </div>
            <h1 className="text-3xl font-black leading-tight text-zinc-900 sm:text-4xl">{activeQuestion.prompt}</h1>
          </div>

          <div className="mt-8 space-y-4">
            {activeQuestion.choices.map((c, idx) => (
              <ChoiceRow
                key={idx}
                label={c}
                selected={selectedChoice === idx}
                onClick={() => pickChoice(idx)}
              />
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between">
            <button
              disabled={activeQuestionIndex === 0}
              onClick={() => setActiveQuestionIndex((v) => Math.max(0, v - 1))}
              className="rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 disabled:opacity-50"
            >
              ← Previous
            </button>

            <button
              disabled={activeQuestionIndex >= total - 1}
              onClick={() => setActiveQuestionIndex((v) => Math.min(total - 1, v + 1))}
              className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
            >
              Next Question →
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="rounded-3xl border bg-white p-6">
          <div className="text-sm font-semibold text-zinc-900">TIME REMAINING</div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { v: attempt.timeRemaining?.hours ?? 0, l: 'HOURS' },
              { v: attempt.timeRemaining?.minutes ?? 0, l: 'MINUTES' },
              { v: attempt.timeRemaining?.seconds ?? 0, l: 'SECONDS' },
            ].map((t) => (
              <div key={t.l} className="rounded-2xl border bg-zinc-50 p-3 text-center">
                <div className="text-2xl font-black text-zinc-900">{String(t.v).padStart(2, '0')}</div>
                <div className="mt-1 text-[11px] font-semibold text-zinc-500">{t.l}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t pt-6">
            <div className="text-sm font-semibold text-zinc-900">QUIZ NAVIGATION</div>
            <div className="mt-1 text-xs text-zinc-600">{total} Questions Total</div>

            <div className="mt-4 grid grid-cols-5 gap-2">
              {attempt.questions.map((q, idx) => {
                const answered = answeredMap.has(q.id);
                const active = idx === activeQuestionIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={`h-10 rounded-xl border text-sm font-bold ${
                      active
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : answered
                          ? 'border-emerald-500 bg-emerald-600 text-white'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={finishAttempt}
              disabled={finishing}
              className="mt-6 w-full rounded-2xl bg-emerald-600 px-4 py-4 text-center text-sm font-semibold text-white shadow-sm disabled:opacity-50"
            >
              {finishing ? 'Submitting…' : 'Finish & Submit Attempt'}
            </button>
            <div className="mt-2 text-center text-xs text-zinc-500">Answers are automatically saved</div>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t pt-8 text-center text-xs text-zinc-500">
        <div className="flex items-center justify-center gap-6">
          <Link className="hover:text-zinc-700" href="/honor-code">
            Honor Code
          </Link>
          <Link className="hover:text-zinc-700" href="/support">
            Technical Support
          </Link>
          <Link className="hover:text-zinc-700" href="/privacy">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
