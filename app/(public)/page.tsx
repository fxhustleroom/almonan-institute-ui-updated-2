'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PublicLayout } from '@/components/PublicLayout';
import { fetchPublicCourses } from '@/lib/queries';
import { CourseCard } from '@/components/CourseCard';

const categories = [
  { label: 'Programming', icon: '</>' },
  { label: 'Corporate Law', icon: '⚖' },
  { label: 'Data Science', icon: '◌' },
  { label: 'Design', icon: '✎' },
  { label: 'Finance', icon: '💵' },
  { label: 'Pedagogy', icon: '🎓' }
];

export default function HomePage() {
  const { data: courses, isLoading, isError } = useQuery({
    queryKey: ['public-courses', { featured: true }],
    queryFn: () => fetchPublicCourses({ page: 1 })
  });

  const coursesList = Array.isArray(courses)
    ? courses
    : Array.isArray((courses as any)?.items)
    ? (courses as any).items
    : Array.isArray((courses as any)?.data)
    ? (courses as any).data
    : [];


  return (
    <PublicLayout active="home">
      <div className="py-10 md:py-14">
        {/* Hero */}
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-5">
            <h1 className="h1">
              Almonan Institute —<br /> Learn Online &amp; Track Offline Students
            </h1>
            <p className="muted max-w-md text-base leading-relaxed">
              Empowering learners with digital excellence and innovative tracking solutions for physical campuses.
              Your bridge to professional success.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/courses" className="btn-primary">Explore Courses</Link>
              <Link href="/register" className="btn-secondary">Register</Link>
            </div>
          </div>

          <div className="card overflow-hidden p-4">
            <div className="relative h-[260px] w-full overflow-hidden rounded-xl2 bg-almonanGreen-100">
              <Image
                src="/mock/courses.png"
                alt="Dashboard preview"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="section-mint mt-10 p-6 md:p-8">
          <div className="text-center text-sm font-extrabold text-ink/70">Popular Categories</div>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-6">
            {categories.map((c) => (
              <div key={c.label} className="card flex items-center justify-center gap-2 px-4 py-4 text-sm font-semibold">
                <span className="text-almonanGreen-700">{c.icon}</span>
                <span>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Courses */}
        <div className="mt-12">
          <div className="flex items-end justify-between">
            <h2 className="h2">Featured Courses</h2>
            <Link href="/courses" className="text-sm font-semibold text-almonanGreen-700 hover:underline">
              View All →
            </Link>
          </div>

          {isLoading && <div className="mt-6 muted">Loading featured courses…</div>}
          {isError && <div className="mt-6 text-sm text-red-600">Failed to load courses. Check API.</div>}
          {!isLoading && !isError && (
            <div className="mt-6 grid gap-5 md:grid-cols-4">
              {coursesList.slice(0, 4).map((c: any) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="mt-14">
          <h2 className="h2 text-center">How It Works</h2>
          <p className="muted mx-auto mt-2 max-w-2xl text-center">
            Whether you are a remote learner or a campus-based student, Almonan provides a unified tracking ecosystem.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-almonanGreen-100 text-almonanGreen-700">◌</span>
                <div className="text-lg font-extrabold">Online Excellence</div>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex gap-2"><span className="text-almonanGreen-700">✓</span> Access high-definition video lectures anytime, anywhere.</li>
                <li className="flex gap-2"><span className="text-almonanGreen-700">✓</span> AI-powered personalized study roadmaps.</li>
                <li className="flex gap-2"><span className="text-almonanGreen-700">✓</span> Join global study groups and live Q&amp;A sessions.</li>
              </ul>
            </div>

            <div className="section-brown p-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">⌁</span>
                <div className="text-lg font-extrabold">Offline Tracking</div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-white/90">
                <li className="flex gap-2"><span className="text-almonanGreen-100">✓</span> QR-based attendance for physical campus sessions.</li>
                <li className="flex gap-2"><span className="text-almonanGreen-100">✓</span> Offline-to-online grade synchronization.</li>
                <li className="flex gap-2"><span className="text-almonanGreen-100">✓</span> Smart card integration for library and cafeteria.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-14">
          <h2 className="h2 text-center">What Our Students Say</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { initials: 'JD', name: 'John Doe', role: 'Computer Science Student', text: 'The tracking system is a lifesaver. I can see my physical attendance and my online progress in one single dashboard.' },
              { initials: 'SM', name: 'Sarah Miller', role: 'Professor, Almonan Campus', text: 'As an educator, the ability to track students who are lagging behind offline has improved our graduation rates significantly.' },
              { initials: 'AL', name: 'Ahmed Lateef', role: 'Digital Marketing Student', text: 'Quality courses and highly interactive sessions. The Almonan Institute sets the gold standard for blended learning.' }
            ].map((t) => (
              <div key={t.name} className="card p-6">
                <div className="text-almonanGreen-500">★★★★★</div>
                <p className="mt-3 text-sm leading-relaxed text-ink/80">“{t.text}”</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-almonanGreen-100 font-bold text-almonanGreen-700">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold">{t.name}</div>
                    <div className="text-xs text-ink/60">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
