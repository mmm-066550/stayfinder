import { Skeleton } from '@/components/ui/skeleton';

export default function HotelLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-5 w-40" />
      <div className="space-y-3 mt-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  );
}
