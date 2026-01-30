import Link from 'next/link';
import { AuthLayout } from '@/components/AuthLayout';

export default function VerificationSuccessPage() {
  return (
    <AuthLayout variant="simple">
      <main className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-2xl border border-black/10 bg-white p-10 shadow-soft">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green text-white">
              ✓
            </div>
          </div>
          <div className="mx-auto mb-2 w-fit rounded-full bg-green/10 px-3 py-1 text-xs font-bold tracking-[0.25em] text-green">
            SUCCESS
          </div>
          <h1 className="text-center text-4xl font-extrabold text-ink">Verification Successful!</h1>
          <p className="mx-auto mt-4 max-w-md text-center text-ink/70">
            Your email has been successfully verified. You can now access your Almonan Institute learning dashboard and begin your educational journey.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/login" className="btn-primary inline-flex items-center justify-center px-8">
              Go to Login <span className="ml-2">→</span>
            </Link>
          </div>
          <div className="mt-8 border-t border-black/5 pt-6 text-center text-sm text-ink/60">
            Need help? <Link href="/support" className="font-semibold text-green">Contact our support team</Link>
          </div>
        </div>
      </main>
    </AuthLayout>
  );
}
