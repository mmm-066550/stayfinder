'use client';

import { ErrorState } from '@/shared/ui/ErrorState';

export default function HotelError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <ErrorState message="Failed to load hotel details." onRetry={reset} />
    </div>
  );
}
