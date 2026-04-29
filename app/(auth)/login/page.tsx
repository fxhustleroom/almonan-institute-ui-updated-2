'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { useAuth } from '@/components/AuthProvider';
import { login } from '@/lib/queries';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login({ emailOrPhone, password });

      setAuth({
        tokens: { accessToken: data.accessToken, refreshToken: data.refreshToken },
        user: data.user
      });

      const role = String(data.user?.role || '').toLowerCase();
      if (role.includes('admin')) router.push('/admin');
      else if (role.includes('staff')) router.push('/staff');
      else router.push('/student/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout variant="login">
      <main className="mx-auto flex max-w-6xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg rounded-2xl bg-white p-10 shadow-soft ring-1 ring-black/5">
          <h1 className="text-center text-3xl font-extrabold text-brown">Welcome Back</h1>
          <p className="mt-2 text-center text-sm text-muted">Please enter your credentials to access the portal</p>

          {error ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-semibold text-brown">Email or Phone Number</label>
              <input
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="Enter your email or phone"
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-green focus:ring-4 focus:ring-green/15"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-brown">Password</label>
                <Link href="/forgot-password" className="text-sm font-semibold text-green hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 pr-12 outline-none focus:border-green focus:ring-4 focus:ring-green/15"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-muted hover:bg-black/5"
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-black/20 accent-green"
              />
              Remember this device
            </label>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-green px-4 py-3 text-center text-sm font-extrabold text-white shadow-soft hover:brightness-95 disabled:opacity-60"
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>
        </div>
      </main>
    </AuthLayout>
  );
}
