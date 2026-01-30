'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/AuthLayout';
import { requestPasswordReset } from '@/lib/queries';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    if (!identifier.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await requestPasswordReset({ identifier });
      setDone(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout variant="simple">
      <div className="mx-auto w-full max-w-xl px-4 py-16">
        <div className="mx-auto rounded-2xl border border-black/10 bg-white p-8 shadow-soft">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand/10">
            <div className="h-7 w-7 rounded-full border-2 border-brand" />
          </div>
          <h1 className="mt-5 text-center text-3xl font-extrabold text-ink">Forgot Password?</h1>
          <p className="mt-3 text-center text-sm text-ink/70">
            Enter your registered email address or phone number, and we&apos;ll send you a link to reset your
            password.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {done ? (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              If an account exists for <span className="font-semibold">{identifier}</span>, a reset link has been
              sent.
            </div>
          ) : (
            <div className="mt-8">
              <label className="text-xs font-semibold text-ink">Email or Phone Number</label>
              <input
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. name@email.com or +1234567890"
              />

              <button
                type="button"
                onClick={onSubmit}
                disabled={!identifier.trim() || loading}
                className="btn-primary mt-6 w-full disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send Reset Link →'}
              </button>
            </div>
          )}

          <div className="mt-8 border-t border-black/10 pt-5 text-center text-sm text-ink/60">
            Suddenly remembered?{' '}
            <Link href="/login" className="font-semibold text-brand hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
