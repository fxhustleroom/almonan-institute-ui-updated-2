'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { me, updateStudentSettings, type StudentSettingsPayload } from '@/lib/queries';

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-black/10 bg-white p-4 shadow-soft',
        disabled && 'opacity-60'
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-extrabold text-ink">{label}</div>
          {description ? <div className="mt-1 text-xs text-ink/50">{description}</div> : null}
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={cn(
            'relative h-8 w-14 rounded-full transition',
            checked ? 'bg-almonanGreen-500' : 'bg-black/10',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          )}
          aria-label={label}
        >
          <span
            className={cn(
              'absolute top-1 h-6 w-6 rounded-full bg-white shadow transition',
              checked ? 'left-7' : 'left-1'
            )}
          />
        </button>
      </div>
    </div>
  );
}

export default function StudentSettingsPage() {
  const qc = useQueryClient();

  // fetch current user/profile
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: me
  });

  // local UI state (matches your screenshot)
  const [displayName, setDisplayName] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [announcements, setAnnouncements] = useState(true);
  const [examReminders, setExamReminders] = useState(true);

  const [seeded, setSeeded] = useState(false);

  // seed from API once (don’t overwrite user edits)
  useEffect(() => {
    if (!user || seeded) return;

    setDisplayName(user.fullName || 'Student');

    // optional: if backend returns settings in user.settings, respect it
    const settings = (user as any)?.settings;
    if (settings) {
      setDarkMode(Boolean(settings.darkMode));
      setEmailNotifications(settings.emailNotifications !== false);
      setSmsNotifications(Boolean(settings.smsNotifications));
      setAnnouncements(settings.announcements !== false);
      setExamReminders(settings.examReminders !== false);
    }

    setSeeded(true);
  }, [user, seeded]);

  const payload: StudentSettingsPayload = useMemo(
    () => ({
      displayName,
      darkMode,
      notifications: {
        email: emailNotifications,
        sms: smsNotifications,
        announcements,
        examReminders
      }
    }),
    [displayName, darkMode, emailNotifications, smsNotifications, announcements, examReminders]
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      // If endpoint doesn’t exist yet, this may throw — handled below
      await updateStudentSettings(payload);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['me'] });
    }
  });

  return (
    <div className="p-6 lg:p-10">
      {/* breadcrumb */}
      <div className="text-sm text-ink/50">Home / Settings</div>

      {/* title */}
      <div className="mt-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink">Settings</h1>
        <p className="mt-2 text-sm text-ink/60">
          Manage your account preferences, notifications, and exam experience.
        </p>
      </div>

      {/* error */}
      {saveMutation.isError ? (
        <div className="card mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {String((saveMutation.error as any)?.response?.data?.message || (saveMutation.error as any)?.message || 'Save failed')}
          <div className="mt-1 text-xs text-red-700/80">
            If your backend doesn’t have <b>/me/settings</b> yet, add it or tell me your endpoint and I’ll map it.
          </div>
        </div>
      ) : null}

      {/* content grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_.9fr]">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* ACCOUNT card */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold tracking-[0.22em] text-ink/50">ACCOUNT</div>
              <span className="rounded-full bg-almonanGreen-100 px-3 py-1 text-xs font-extrabold text-almonanGreen-700">
                STUDENT
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs font-extrabold tracking-[0.18em] text-ink/50">DISPLAY NAME</div>
                <input
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-almonanGreen-500"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Student"
                  disabled={isLoading}
                />
                <div className="mt-1 text-xs text-ink/40">Synced from your profile</div>
              </div>

              <div>
                <div className="text-xs font-extrabold tracking-[0.18em] text-ink/50">PREFERRED THEME</div>

                <div className="mt-2 rounded-2xl border border-black/10 bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-extrabold text-ink">Dark mode</div>
                      <div className="mt-1 text-xs text-ink/50">
                        Optional UI theme (if enabled on your build).
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDarkMode((v) => !v)}
                      className={cn(
                        'relative h-8 w-14 rounded-full transition',
                        darkMode ? 'bg-almonanGreen-500' : 'bg-black/10'
                      )}
                      aria-label="Dark mode"
                    >
                      <span
                        className={cn(
                          'absolute top-1 h-6 w-6 rounded-full bg-white shadow transition',
                          darkMode ? 'left-7' : 'left-1'
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                className="btn-outline h-[44px]"
                onClick={() => {
                  // reset to API (best effort)
                  setSeeded(false);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary h-[44px]"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* NOTIFICATIONS */}
          <div className="card p-6">
            <div className="text-xs font-extrabold tracking-[0.22em] text-ink/50">NOTIFICATIONS</div>

            <div className="mt-5 space-y-4">
              <Toggle
                checked={emailNotifications}
                onChange={setEmailNotifications}
                label="Email notifications"
                description="Course updates, reminders, and messages."
              />
              <Toggle
                checked={smsNotifications}
                onChange={setSmsNotifications}
                label="SMS notifications"
                description="Urgent alerts for deadlines and exams."
              />
              <Toggle
                checked={announcements}
                onChange={setAnnouncements}
                label="Announcements"
                description="News and institutional updates."
              />
              <Toggle
                checked={examReminders}
                onChange={setExamReminders}
                label="Exam reminders"
                description="Countdown alerts before scheduled exams."
              />
            </div>

            <div className="mt-6 flex items-center justify-end">
              <button
                type="button"
                className="btn-primary h-[44px]"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                {saveMutation.isPending ? 'Saving…' : 'Save Notifications'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* QUICK HELP */}
          <div className="card p-6">
            <div className="text-xs font-extrabold tracking-[0.22em] text-ink/50">QUICK HELP</div>

            <div className="mt-5 space-y-4">
              <Link
                href="/student/support"
                className="block rounded-2xl border border-black/10 bg-white p-4 hover:bg-black/[0.02]"
              >
                <div className="text-sm font-extrabold text-ink">Support Center</div>
                <div className="mt-1 text-xs text-ink/50">
                  If something isn&apos;t working, raise a ticket in Support.
                </div>
              </Link>

              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="text-sm font-extrabold text-ink">Exam Rules</div>
                <div className="mt-1 text-xs text-ink/50">
                  Keep your device stable during timed exams to avoid invalidation.
                </div>
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div className="card p-6">
            <div className="text-xs font-extrabold tracking-[0.22em] text-ink/50">STATUS</div>

            <div className="mt-5 rounded-2xl border border-black/10 bg-white p-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-almonanGreen-500" />
                <div className="text-sm font-extrabold text-ink">Account Active</div>
              </div>
              <div className="mt-2 text-xs text-ink/50">
                Your account is in good standing and can access all student services.
              </div>
            </div>
          </div>

          {/* Optional small loading skeleton */}
          {isLoading ? (
            <div className="card p-6">
              <div className="h-4 w-36 animate-pulse rounded bg-black/5" />
              <div className="mt-4 h-10 w-full animate-pulse rounded bg-black/5" />
              <div className="mt-3 h-10 w-full animate-pulse rounded bg-black/5" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
