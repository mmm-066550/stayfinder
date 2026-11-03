'use client';

import { ErrorState } from '@/shared/ui/ErrorState';

export default function CheckoutError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <ErrorState onRetry={reset} />
    </div>
  );
}
