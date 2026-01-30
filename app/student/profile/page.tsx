'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMe, presignUpload, setAvatar, updateMe, updatePrivacy } from '@/lib/queries';

export default function ProfilePrivacyPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe
  });

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [profileVisible, setProfileVisible] = useState(true);

  // Seed form when user loads
  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || '');
    setPhone(user.phone || '');
    setBio(user.bio || '');
    setProfileVisible(user.profileVisible !== false);
  }, [user?.id]); // only re-seed when user changes

  const saveMutation = useMutation({
    mutationFn: async () => {
      await updateMe({ fullName, phone, bio });
      await updatePrivacy({ profileVisible });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['me'] });
    }
  });

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      // 1) presign
      const p = await presignUpload({
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
        purpose: 'avatar'
      });

      // 2) PUT upload
      await fetch(p.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });

      // 3) Save avatar
      await setAvatar({ uploadId: p.uploadId, url: p.publicUrl });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['me'] });
    }
  });

  if (isLoading || !user) {
    return (
      <div className="p-8">
        <div className="h-8 w-64 animate-pulse rounded bg-black/5" />
        <div className="mt-4 h-40 w-full animate-pulse rounded-2xl bg-black/5" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-6">
        <div className="text-sm text-black/50">Home / Profile &amp; Privacy</div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-brown-900">Profile &amp; Privacy Settings</h1>
        <p className="mt-2 max-w-3xl text-black/60">
          Manage your personal information and institutional directory visibility.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Left card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-soft">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-32 w-32 overflow-hidden rounded-full bg-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Avatar"
                    src={user.avatarUrl || 'https://placehold.co/256x256/png'}
                    className="h-full w-full object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-2 right-2 rounded-full bg-green-600 px-3 py-2 text-xs font-semibold text-white shadow"
                >
                  Edit
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) avatarMutation.mutate(f);
                    e.currentTarget.value = '';
                  }}
                />
              </div>

              <div className="mt-4 text-center">
                <div className="text-xl font-bold text-brown-900">{user.fullName || 'Student'}</div>
                <div className="mt-1 inline-flex items-center gap-2 text-sm text-green-700">
                  <span className="h-2 w-2 rounded-full bg-green-600" /> Active Student Status
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-black/50">Member since</div>
                <div className="font-semibold">{new Date().getFullYear()}</div>
              </div>
              <div className="text-right">
                <div className="text-black/50">Profile Completeness</div>
                <div className="font-semibold text-green-700">85%</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-brown-900 p-6 text-white shadow-soft">
            <div className="text-lg font-bold">Directory Visibility</div>
            <p className="mt-1 text-white/80">Control how other students see your profile.</p>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
              <div className="font-semibold">Hide my profile from other students</div>
              <button
                type="button"
                onClick={() => setProfileVisible((v) => !v)}
                className={`relative h-7 w-12 rounded-full transition ${profileVisible ? 'bg-white/30' : 'bg-white/20'}`}
                aria-label="Toggle profile visibility"
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${profileVisible ? 'left-1' : 'left-6'}`}
                />
              </button>
            </div>

            <p className="mt-3 text-xs text-white/70">
              {profileVisible
                ? 'Your profile is visible in the student directory.'
                : 'Your profile is hidden from the public student directory.'}
            </p>
          </div>
        </div>

        {/* Right form */}
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold tracking-widest text-black/50">STUDENT INFORMATION</div>
            <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">EDITABLE</div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-black/60">FULL NAME</label>
              <input className="input mt-2" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-semibold text-black/60">INSTITUTIONAL EMAIL</label>
              <input className="input mt-2" value={user.email || ''} disabled />
              <div className="mt-1 text-xs text-black/40">Locked by institution</div>
            </div>

            <div>
              <label className="text-xs font-semibold text-black/60">PHONE NUMBER</label>
              <input className="input mt-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="lg:col-span-2">
              <label className="text-xs font-semibold text-black/60">PERSONAL BIO</label>
              <textarea className="input mt-2 min-h-[120px]" value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
          </div>

          <div className="mt-10 flex items-center justify-end gap-3">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setFullName(user.fullName || '');
                setPhone(user.phone || '');
                setBio(user.bio || '');
                setProfileVisible(user.profileVisible !== false);
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
