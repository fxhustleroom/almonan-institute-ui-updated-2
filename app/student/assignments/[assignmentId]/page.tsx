'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAssignment,
  fetchMyAssignments,
  presignUpload,
  submitAssignment
} from '@/lib/queries';
import { useParams, useRouter } from 'next/navigation';

type Attached = {
  id: string; // local id
  name: string;
  sizeLabel: string;
  state: 'complete' | 'uploading' | 'error';
  progress?: number; // 0..100
  uploadId?: string;
  url?: string;
  error?: string;
};

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

function formatDue(d?: string) {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  const date = dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  const time = dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${date} | ${time}`;
}

export default function SubmitAssignmentPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const params = useParams<{ assignmentId: string }>();
  const assignmentId = params.assignmentId;

  const [note, setNote] = useState('');
  const [files, setFiles] = useState<Attached[]>([]);

  // Try assignment details endpoint
  const detailsQuery = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => fetchAssignment(assignmentId),
    retry: 1
  });

  // Fallback: if /assignments/:id doesn't exist, use list and find
  const listQuery = useQuery({
    queryKey: ['my-assignments'],
    queryFn: fetchMyAssignments
  });

  const assignment =
    detailsQuery.data ??
    (listQuery.data || []).find((a: any) => String(a.id) === String(assignmentId));

  const uploading = useMemo(() => files.some((f) => f.state === 'uploading'), [files]);
  const canSubmit = useMemo(() => {
    const okFiles = files.filter((f) => f.state === 'complete' && f.uploadId && f.url);
    return !uploading && okFiles.length > 0;
  }, [files, uploading]);

  const uploadOne = useMutation({
    mutationFn: async (file: File) => {
      // 1) presign
      const p = await presignUpload({
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        purpose: 'assignment'
      });

      // 2) PUT upload
      await fetch(p.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file
      });

      return { uploadId: p.uploadId, url: p.publicUrl };
    }
  });

  const submitMut = useMutation({
    mutationFn: async () => {
      const okFiles = files
        .filter((f) => f.state === 'complete' && f.uploadId && f.url)
        .map((f) => ({ uploadId: f.uploadId as string, url: f.url as string }));

      return submitAssignment({
        assignmentId,
        note: note || undefined,
        files: okFiles
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['my-assignments'] });
      router.push('/student/assignments');
    }
  });

  async function onPickFiles(list: File[]) {
    if (!list.length) return;

    for (const f of list) {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}-${f.name}`;
      const sizeMb = Math.max(0.1, f.size / (1024 * 1024)).toFixed(1);

      // add uploading row
      setFiles((prev) => [
        ...prev,
        { id, name: f.name, sizeLabel: `Uploading...`, state: 'uploading', progress: 25 }
      ]);

      try {
        const result = await uploadOne.mutateAsync(f);

        setFiles((prev) =>
          prev.map((x) =>
            x.id === id
              ? {
                  ...x,
                  state: 'complete',
                  progress: 100,
                  sizeLabel: `${sizeMb} MB • Complete`,
                  uploadId: result.uploadId,
                  url: result.url
                }
              : x
          )
        );
      } catch (e: any) {
        setFiles((prev) =>
          prev.map((x) =>
            x.id === id
              ? {
                  ...x,
                  state: 'error',
                  progress: 0,
                  sizeLabel: `${sizeMb} MB • Failed`,
                  error: e?.response?.data?.message || 'Upload failed'
                }
              : x
          )
        );
      }
    }
  }

  return (
    <div className="p-6 lg:p-10">
      {/* Breadcrumb */}
      <div className="text-sm text-ink/50">
        <Link href="/student/assignments" className="hover:underline">
          Assignments
        </Link>{' '}
        <span className="mx-2">›</span>
        <span className="text-ink/70">{assignment?.moduleTitle || assignment?.courseTitle || 'Assignment'}</span>
        <span className="mx-2">›</span>
        <span className="font-semibold text-ink">Submit Assignment</span>
      </div>

      {/* Title */}
      <div className="mt-5 flex items-start gap-4">
        <div className="mt-1 h-12 w-1 rounded-full bg-almonanGreen-500" />
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-ink">
            {assignment?.title || 'Assignment'}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink/60">
            <div className="inline-flex items-center gap-2">
              <span>📅</span>
              <span>
                Due Date:{' '}
                <span className="font-semibold text-ink/70">
                  {assignment?.dueDate ? formatDue(assignment.dueDate) : '—'}
                </span>
              </span>
            </div>

            <div className="inline-flex items-center gap-2 text-almonanGreen-700">
              <span>✓</span>
              <span className="font-extrabold">
                {(assignment as any)?.pointsPossible ? `${(assignment as any).pointsPossible} Points Possible` : 'Points Possible'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="card mt-8 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-black/5 bg-white px-6 py-5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-almonanGreen-100 text-almonanGreen-700">
            ⬆️
          </span>
          <div className="text-lg font-extrabold text-ink">Assignment Submission</div>
        </div>

        <div className="p-6">
          <div className="text-xs font-extrabold tracking-[0.22em] text-ink/50">UPLOAD FILES</div>

          {/* Upload box */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-4 w-full rounded-2xl border-2 border-dashed border-black/10 bg-white px-6 py-10 text-center transition hover:bg-black/[0.02]"
          >
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-almonanGreen-100 text-2xl text-almonanGreen-700">
              ☁️
            </div>
            <div className="mt-5 text-base font-extrabold text-ink">Click or drag files to this area to upload</div>
            <div className="mt-2 text-sm text-ink/50">
              Supports PNG, JPG, and MP4 formats.
              <br />
              Maximum file size: 50MB per file.
            </div>
          </button>

          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const list = Array.from(e.target.files ?? []);
              if (!list.length) return;
              onPickFiles(list);
              e.currentTarget.value = '';
            }}
          />

          {/* Attached */}
          <div className="mt-8 text-xs font-extrabold tracking-[0.22em] text-ink/50">
            ATTACHED FILES ({files.length})
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {files.map((f) => (
              <div
                key={f.id}
                className={cn(
                  'rounded-2xl border border-black/10 bg-white p-4',
                  f.state === 'uploading' && 'border-almonanGreen-200 bg-almonanGreen-50',
                  f.state === 'error' && 'border-red-200 bg-red-50'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl bg-black/5" />
                    <div>
                      <div className="text-sm font-extrabold text-ink">{f.name}</div>
                      <div
                        className={cn(
                          'mt-1 text-xs',
                          f.state === 'uploading'
                            ? 'text-almonanGreen-700'
                            : f.state === 'error'
                              ? 'text-red-700'
                              : 'text-ink/50'
                        )}
                      >
                        {f.sizeLabel}
                        {f.state === 'error' && f.error ? ` • ${f.error}` : ''}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                    className="rounded-xl px-2 py-1 text-sm font-extrabold text-ink/40 hover:bg-black/5 hover:text-ink"
                    aria-label="Remove file"
                  >
                    ✕
                  </button>
                </div>

                {f.state === 'uploading' ? (
                  <div className="mt-4 h-2 w-full rounded-full bg-black/10">
                    <div
                      className="h-2 rounded-full bg-almonanGreen-500 transition"
                      style={{ width: `${Math.min(100, Math.max(0, f.progress ?? 0))}%` }}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="mt-10 text-xs font-extrabold tracking-[0.22em] text-ink/50">ADDITIONAL NOTES FOR INSTRUCTOR</div>
          <textarea
            className="mt-3 w-full rounded-2xl border border-black/10 bg-white p-4 text-sm outline-none focus:border-almonanGreen-500"
            placeholder="Type any comments about your submission here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
          />

          {/* Actions */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              className={cn('btn-primary h-[52px]', (!canSubmit || submitMut.isPending) && 'opacity-60')}
              disabled={!canSubmit || submitMut.isPending}
              onClick={() => submitMut.mutate()}
            >
              ►&nbsp;&nbsp;{submitMut.isPending ? 'Submitting…' : 'Submit Assignment'}
            </button>

            <button
              type="button"
              className="btn-outline h-[52px] border-2 border-almonanBrown-900 font-extrabold text-almonanBrown-900 hover:bg-black/5"
              onClick={() => {
                // draft can be wired if backend supports it
                alert('Draft saved (UI). Wire API if backend supports drafts.');
              }}
            >
              Save as Draft
            </button>
          </div>
        </div>
      </div>

      {/* Technical note */}
      <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-4 text-sm text-ink/60">
        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/5">i</span>
        <span className="font-semibold text-ink/70">Technical Note:</span> This form presigns uploads via POST /uploads/presign,
        uploads with PUT, then submits via POST /assignments/:id/submissions.
      </div>
    </div>
  );
}
