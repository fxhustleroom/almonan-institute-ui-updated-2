'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StudentShell } from '@/components/StudentShell';
import { useAuth } from '@/components/AuthProvider';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthed } = useAuth();

  useEffect(() => {
    if (!isAuthed) router.replace('/login');
  }, [isAuthed, router]);

  return <StudentShell>{children}</StudentShell>;
}
