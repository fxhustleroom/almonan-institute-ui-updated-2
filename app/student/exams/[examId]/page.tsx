'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchExamAttempt,
  startOrResumeExam,
  saveExamAnswer,
  submitExam,
  toggleExamFlag,
  type ExamAttempt
} from '@/lib/queries';

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function splitTime(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return { h, m, sec };
}

export default function ExamAttemptPage() {
  const params = useParams<{ examId: string }>();
  const examId = params.examId;
  const router = useRouter();
  const qc = useQueryClient();

  const [localSeconds, setLocalSeconds] = useState<number | null>(null);
  const [selected, setSelected] = useState<Record<string, string | null>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());

  const { data, isLoading, isError } = useQuery({
    queryKey: ['examAttempt', examId],
    queryFn: async () => {
      // try resume first, if backend doesn’t have attempt yet, start one
      try {
        return await fetchExamAttempt(examId);
      } catch {
        return await startOrResumeExam(examId);
      }
    }
  });

  const attempt = data as ExamAttempt | undefined;

  // seed local state when attempt loads
  useEffect(() => {
    if (!attempt) return;
    setLocalSeconds(attempt.timeRemainingSeconds ?? 0);
    setSelected(attempt.answers ?? {});
    setFlagged(new Set(attempt.flaggedQuestionIndexes ?? []));
  }, [attempt?.attemptId]);

  // local ticking (UI) – server is source of truth when you refetch
  useEffect(() => {
    if (localSeconds === null) return;
    if (localSeconds <= 0) return;
    const t = setInterval(() => setLocalSeconds((s) => (s === null ? null : Math.max(0, s - 1))), 1000);
    return () => clearInterval(t);
  }, [localSeconds]);

  const saveAnswerMutation = useMutation({
    mutationFn: async (payload: { questionId: string; optionId: string | null }) =>
      saveExamAnswer({ examId, ...payload }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['examAttempt', examId] });
    }
  });

  const flagMutation = useMutation({
    mutationFn: async (payload: { questionIndex: number; flagged: boolean }) =>
      toggleExamFlag({ examId, ...payload }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['examAttempt', examId] });
    }
  });

  const submitMutation = useMutation({
    mutationFn: async () => submitExam({ examId }),
    onSuccess: async () => {
      // send them back to exams list for now
      router.push('/student/exams');
    }
  });

  const totalQuestions = attempt?.totalQuestions ?? attempt?.questions?.length ?? 0;
  const currentIndex0 = attempt?.currentQuestionIndex ?? 0; // 0-based
  const current = attempt?.questions?.[currentIndex0];

  const answeredCount = useMemo(() => {
    if (!attempt?.questions?.length) return 0;
    return attempt.questions.reduce((acc, q) => acc + (selected[q.id] ? 1 : 0), 0);
  }, [attempt?.questions, selected]);

  const progressPct = useMemo(() => {
    if (!totalQuestions) return 0;
    return Math.round((answeredCount / totalQuestions) * 100);
  }, [answeredCount, totalQuestions]);

  const flaggedCount = flagged.size;

  const time = splitTime(localSeconds ?? attempt?.timeRemainingSeconds ?? 0);

  function goTo(index0: number) {
    if (!attempt) return;
    // If you want server navigation, create endpoint.
    // For UI: we update query cache locally by refetching attempt and relying on backend currentQuestionIndex.
    // If your backend supports "set current question", add an endpoint and call here.
    qc.setQueryData(['examAttempt', examId], (prev: any) => {
      if (!prev) return prev;
      return { ...prev, currentQuestionIndex: Math.max(0, Math.min(index0, totalQuestions - 1)) };
    });
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="h-8 w-64 animate-pulse rounded bg-black/5" />
        <div className="mt-4 h-64 w-full animate-pulse rounded-2xl bg-black/5" />
      </div>
    );
  }

  if (isError || !attempt || !current) {
    return (
      <div className="p-6 lg:p-10">
        <div className="card p-6">
          <div className="text-xl font-extrabold text-ink">Unable to load exam.</div>
          <div className="mt-2 text-sm text-ink/60">Check your API endpoints for /exams/:id/attempt or /exams/:id/start.</div>
        </div>
      </div>
    );
  }

  const isFlagged = flagged.has(currentIndex0);

  return (
    <div className="p-6 lg:p-10">
      {/* Top row (title + timer chip) */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-xs font-extrabold tracking-[0.22em] text-ink/50">
            {attempt.courseBreadcrumb ?? 'COURSES'} {attempt.sectionLabel ? `• ${attempt.sectionLabel}` : ''}
          </div>

          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink">{attempt.title}</h1>
          <div className="mt-2 text-sm text-ink/60">{attempt.sectionLabel ?? ''}</div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-soft">
          <div className="inline-flex items-center gap-2 text-sm font-extrabold text-almonanGreen-700">
            <span>🛡️</span>
            <span>Secure Mode</span>
          </div>
          <div className="h-8 w-px bg-black/10" />
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-almonanGreen-900 px-4 py-2 text-center text-white">
              <div className="text-lg font-extrabold leading-none">{pad2(time.h)}</div>
              <div className="mt-1 text-[10px] font-extrabold tracking-[0.22em] opacity-80">HOURS</div>
            </div>
            <div className="rounded-xl bg-almonanGreen-900 px-4 py-2 text-center text-white">
              <div className="text-lg font-extrabold leading-none">{pad2(time.m)}</div>
              <div className="mt-1 text-[10px] font-extrabold tracking-[0.22em] opacity-80">MINUTES</div>
            </div>
            <div className="rounded-xl bg-almonanGreen-900 px-4 py-2 text-center text-white">
              <div className="text-lg font-extrabold leading-none">{pad2(time.sec)}</div>
              <div className="mt-1 text-[10px] font-extrabold tracking-[0.22em] opacity-80">SECONDS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout: left navigator + main question card */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left panel */}
        <aside className="card p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold text-ink">EXAM PROGRESS</div>
            <div className="text-sm font-extrabold text-almonanGreen-700">{progressPct}%</div>
          </div>

          <div className="mt-4 h-2 w-full rounded-full bg-black/10">
            <div className="h-2 rounded-full bg-almonanGreen-500 transition" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="mt-3 text-sm text-ink/60">
            {answeredCount} of {totalQuestions} questions completed
          </div>

          <div className="mt-8 text-xs font-extrabold tracking-[0.22em] text-ink/50">QUESTION NAVIGATOR</div>

          <div className="mt-4 grid grid-cols-5 gap-3">
            {Array.from({ length: totalQuestions }).map((_, i) => {
              const q = attempt.questions[i];
              const isCurrent = i === currentIndex0;
              const isAnswered = Boolean(selected[q.id]);
              const isQFlagged = flagged.has(i);

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => goTo(i)}
                  className={cn(
                    'relative flex h-11 items-center justify-center rounded-xl border text-sm font-extrabold transition',
                    isCurrent
                      ? 'border-almonanGreen-600 bg-almonanGreen-50 text-almonanGreen-700'
                      : isAnswered
                        ? 'border-black/10 bg-almonanGreen-900 text-white'
                        : 'border-black/10 bg-white text-ink/70 hover:bg-black/5'
                  )}
                >
                  {i + 1}
                  {isQFlagged ? <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" /> : null}
                </button>
              );
            })}
          </div>

          <div className="mt-8 space-y-3 border-t border-black/5 pt-6 text-sm">
            <button type="button" className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-left font-semibold text-ink/70 hover:bg-black/5">
              ℹ️&nbsp;&nbsp;Exam Rules
            </button>
            <button type="button" className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-left font-semibold text-ink/70 hover:bg-black/5">
              🎧&nbsp;&nbsp;Technical Support
            </button>
            <div className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-left font-semibold text-ink/70">
              🚩&nbsp;&nbsp;Flagged ({flaggedCount})
            </div>
          </div>

          <button
            type="button"
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending}
            className="btn-primary mt-8 h-[52px] w-full disabled:opacity-60"
          >
            ►&nbsp;&nbsp;Submit Exam
          </button>
        </aside>

        {/* Right question card */}
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-black/5 bg-white px-6 py-5">
            <div className="text-sm font-extrabold text-ink">
              Question {currentIndex0 + 1} of {totalQuestions}
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !isFlagged;
                setFlagged((prev) => {
                  const copy = new Set(prev);
                  if (next) copy.add(currentIndex0);
                  else copy.delete(currentIndex0);
                  return copy;
                });
                flagMutation.mutate({ questionIndex: currentIndex0, flagged: !isFlagged });
              }}
              className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-extrabold text-ink/70 hover:bg-black/5"
            >
              🚩&nbsp;&nbsp;FLAG FOR REVIEW
            </button>
          </div>

          <div className="p-6">
            <div className="text-2xl font-extrabold leading-snug text-ink">{current.prompt}</div>

            <div className="mt-6 space-y-4">
              {current.options.map((opt, idx) => {
                const picked = selected[current.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelected((prev) => ({ ...prev, [current.id]: opt.id }));
                      saveAnswerMutation.mutate({ questionId: current.id, optionId: opt.id });
                    }}
                    className={cn(
                      'w-full rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition',
                      picked
                        ? 'border-almonanGreen-600 bg-almonanGreen-50 text-ink'
                        : 'border-black/10 bg-white text-ink/80 hover:bg-black/[0.02]'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={cn(
                          'mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border',
                          picked ? 'border-almonanGreen-600 bg-almonanGreen-500' : 'border-black/20 bg-white'
                        )}
                      >
                        {picked ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                      </span>
                      <div>
                        <span className="mr-2 font-extrabold">{String.fromCharCode(65 + idx)}.</span>
                        {opt.text}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-black/5 bg-white px-6 py-5 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              onClick={() => goTo(currentIndex0 - 1)}
              disabled={currentIndex0 === 0}
              className="btn-outline h-[44px] disabled:opacity-60"
            >
              ←&nbsp;&nbsp;Previous
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelected((prev) => ({ ...prev, [current.id]: null }));
                  saveAnswerMutation.mutate({ questionId: current.id, optionId: null });
                }}
                className="btn-outline h-[44px]"
              >
                Clear Answer
              </button>

              <button
                type="button"
                onClick={() => goTo(currentIndex0 + 1)}
                disabled={currentIndex0 >= totalQuestions - 1}
                className="btn-primary h-[44px] px-6 disabled:opacity-60"
              >
                Next Question →
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Integrity warning */}
      <div className="mt-8 rounded-2xl border border-black/10 bg-white/60 p-5 text-sm text-ink/60">
        <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/5">🛡️</span>
        <span className="font-semibold text-ink/70">Academic Integrity Warning:</span> This exam may be monitored. Switching tabs or
        closing this window may invalidate your attempt.
      </div>
    </div>
  );
}
