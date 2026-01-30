'use client';

import React from 'react';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import { PublicLayout } from '@/components/PublicLayout';
import { createSupportTicket } from '@/lib/queries';

const faqs = [
  { title: 'Enrollment & Admissions', body: 'Admissions are open year-round. Online students can enroll instantly. Offline students are registered by the institution and can track attendance and access library resources.' },
  { title: 'Technical Support', body: 'If you have trouble logging in, viewing modules, or submitting assignments, create a ticket and our team will respond within 24–48 business hours.' },
  { title: 'Payments & Refunds', body: 'Payments are processed securely via configured gateways (Stripe, Paystack, Flutterwave). Refund eligibility depends on the course policy.' },
  { title: 'Certification', body: 'Certificates are issued after you complete course modules and pass required quizzes/exams. You can download your certificate from your dashboard.' }
];

export default function SupportPage() {
  const [open, setOpen] = React.useState(0);
  const [fullName, setFullName] = React.useState('');
  const [contact, setContact] = React.useState('');
  const [subject, setSubject] = React.useState('Enrollment & Admissions');
  const [message, setMessage] = React.useState('');

  const mutation = useMutation({
    mutationFn: () => createSupportTicket({ fullName, contact, subject, message }),
    onSuccess: () => {
      setMessage('');
      alert('Support request sent successfully.');
    }
  });

  return (
    <PublicLayout active="support">
      <div className="py-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div>
            <div className="text-6xl font-extrabold text-almonanBrown-900 leading-[0.95]">
              How can we help you<br /> today?
            </div>
            <p className="muted mt-4 max-w-md text-sm leading-relaxed">
              Our dedicated support team is available Monday through Friday, 9:00 AM – 5:00 PM EST to assist with your educational journey.
            </p>
            <button className="btn-primary mt-6">View Documentation</button>
          </div>

          <div className="card overflow-hidden">
            <div className="relative h-[220px] w-full bg-almonanGreen-100">
              <Image src="/mock/support.png" alt="Support illustration" fill className="object-cover" />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {/* FAQ */}
          <div>
            <div className="flex items-center gap-2 text-lg font-extrabold">
              <span className="text-almonanGreen-500">❓</span> Frequently Asked Questions
            </div>

            <div className="mt-5 space-y-3">
              {faqs.map((f, idx) => (
                <div key={f.title} className="card">
                  <button
                    className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-extrabold"
                    onClick={() => setOpen(open === idx ? -1 : idx)}
                    type="button"
                  >
                    {f.title}
                    <span className="text-ink/40">{open === idx ? '▴' : '▾'}</span>
                  </button>
                  {open === idx && (
                    <div className="px-5 pb-5 text-sm text-ink/70">{f.body}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Ticket form */}
          <div className="card p-6 md:p-8">
            <div className="flex items-center gap-2 text-lg font-extrabold">
              <span className="text-almonanGreen-500">✉</span> Submit a Support Ticket
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-ink/60">Full Name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-ink/60">Email or Phone</label>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-extrabold text-ink/60">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
              >
                {faqs.map((f) => <option key={f.title} value={f.title}>{f.title}</option>)}
              </select>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-extrabold text-ink/60">How can we help?</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your request in detail..."
                className="h-36 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
              />
            </div>

            <button
              className="btn-primary mt-6 w-full !py-4"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Sending…' : 'Send Support Request →'}
            </button>

            <div className="mt-2 text-center text-xs text-ink/40">
              Ticket processing usually takes 24–48 business hours.
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
