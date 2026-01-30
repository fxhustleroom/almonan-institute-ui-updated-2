'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { registerOffline, registerOnline } from '@/lib/queries';

type Tab = 'online' | 'offline';

export default function RegisterPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('online');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Online
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileVisible, setProfileVisible] = useState(true);
  const [agreeToTermsOnline, setAgreeToTermsOnline] = useState(true);

  // Offline
  const [offlineName, setOfflineName] = useState('');
  const [offlinePhone, setOfflinePhone] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [level, setLevel] = useState('100');
  const [agree, setAgree] = useState(false);

  const canSubmit = useMemo(() => {
    if (tab === 'online') {
      return (
        fullName.trim().length > 2 &&
        (email.trim().length > 4 || phone.trim().length > 5) &&
        password.length >= 6 &&
        password === confirmPassword
      );
    }
    return (
      offlineName.trim().length > 2 &&
      offlinePhone.trim().length > 5 &&
      matricNumber.trim().length > 2 &&
      agree
    );
  }, [
    tab,
    fullName,
    email,
    phone,
    password,
    confirmPassword,
    offlineName,
    offlinePhone,
    matricNumber,
    agree
  ]);

async function onSubmit() {
  if (!canSubmit) return;
  setLoading(true);
  setError(null);

  try {
  if (tab === 'online') {
    await registerOnline({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      agreeToTerms: agreeToTermsOnline
    });
    router.push('/verify/success');
  } else {
    await registerOffline({
      fullName: offlineName.trim(),
      phone: offlinePhone.trim(),
      matricNumber: matricNumber.trim(),
      department,
      level,
      agreeToTerms: agree // reuse your existing offline checkbox
    });
    router.push('/verify/success');
  }
  } catch (e: any) {
    setError(e?.response?.data?.message || e?.message || 'Registration failed.');
  } finally {
    setLoading(false);
  }
}

  return (
    <AuthLayout variant="register">
      <div className="mx-auto w-full max-w-4xl px-4 py-14">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-ink">Create Student Account</h1>
          <p className="mt-3 text-sm text-ink/70">Join the Almonan academic community today.</p>
        </div>

        <div className="mx-auto mt-8 rounded-2xl border border-black/10 bg-white shadow-soft">
          <div className="grid grid-cols-2 overflow-hidden rounded-t-2xl bg-cream">
            <button
              type="button"
              onClick={() => setTab('online')}
              className={
                tab === 'online'
                  ? 'border-b-2 border-brand px-6 py-4 text-sm font-semibold text-ink'
                  : 'border-b border-black/10 px-6 py-4 text-sm font-semibold text-ink/60 hover:text-ink'
              }
            >
              ONLINE STUDENT
            </button>
            <button
              type="button"
              onClick={() => setTab('offline')}
              className={
                tab === 'offline'
                  ? 'border-b-2 border-brand px-6 py-4 text-sm font-semibold text-ink'
                  : 'border-b border-black/10 px-6 py-4 text-sm font-semibold text-ink/60 hover:text-ink'
              }
            >
              OFFLINE STUDENT
            </button>
          </div>

          <div className="p-8">
            <p className="text-center text-xs text-ink/60">
              {tab === 'online'
                ? 'Please fill in your details to register for the online portal.'
                : 'Register for offline student tracking (no course enrollment required).'}
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {tab === 'online' ? (
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-ink">Full Name</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink">Email Address</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink">Phone Number</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 ..."
                  />
                </div>
                <div className="hidden md:block" />
                <div>
                  <label className="text-xs font-semibold text-ink">Password</label>
                  <input
                    type="password"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink">Confirm Password</label>
                  <input
                    type="password"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 text-sm text-ink/70">
                    <input
                      type="checkbox"
                      checked={agreeToTermsOnline}
                      onChange={(e) => setAgreeToTermsOnline(e.target.checked)}
                      className="h-4 w-4 accent-brand"
                    />
                    I agree to the <Link href="/privacy" className="text-brand underline">Privacy Policy</Link> and Terms.
                  </label>
                </div>
              </div>
            ) : (
              <div className="mt-8 mx-auto max-w-2xl">
                <div className="grid gap-6">
                  <div>
                    <label className="text-xs font-semibold text-ink">Full Name</label>
                    <input
                      className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                      value={offlineName}
                      onChange={(e) => setOfflineName(e.target.value)}
                      placeholder="e.g. Johnathan Almonan"
                    />
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-ink">Phone Number</label>
                      <input
                        className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                        value={offlinePhone}
                        onChange={(e) => setOfflinePhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-ink">Matric Number</label>
                      <input
                        className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                        value={matricNumber}
                        onChange={(e) => setMatricNumber(e.target.value)}
                        placeholder="ALM/2023/001"
                      />
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-ink">Department</label>
                      <select
                        className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      >
                        <option>Computer Science</option>
                        <option>Business Administration</option>
                        <option>Engineering</option>
                        <option>Economics</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-ink">Level</label>
                      <select
                        className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                      >
                        <option value="100">100 Level</option>
                        <option value="200">200 Level</option>
                        <option value="300">300 Level</option>
                        <option value="400">400 Level</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-3 text-sm text-ink/70">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="h-4 w-4 accent-brand"
                    />
                    I agree to the <Link href="/privacy" className="text-brand underline">Privacy Policy</Link> and data storage terms for offline processing.
                  </label>
                </div>
              </div>
            )}

            <div className="mt-10">
              <button
                onClick={onSubmit}
                disabled={!canSubmit || loading}
                className="w-full rounded-xl bg-brand px-6 py-4 text-sm font-semibold text-white shadow-soft disabled:opacity-50"
              >
                {loading ? 'Please wait…' : tab === 'online' ? 'Register Online Student' : 'Complete Registration'}
              </button>
              <p className="mt-4 text-center text-sm text-ink/70">
                Already have an account?{' '}
                <Link href="/login" className="text-brand font-semibold">
                  Log in
                </Link>
              </p>
              <div className="mt-10 rounded-xl border border-dashed border-black/10 bg-cream px-4 py-3 text-center text-[10px] tracking-widest text-ink/40">
                SYSTEM INTEGRATION POINT: {tab === 'online' ? 'POST /auth/register/online' : 'POST /auth/register/offline'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
