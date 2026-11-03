'use client';

import { ErrorState } from '@/shared/ui/ErrorState';

export default function BookingsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <ErrorState onRetry={reset} />
    </div>
  );
}
