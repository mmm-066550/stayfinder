import { Skeleton } from '@/components/ui/skeleton';

export default function WishlistLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-28 w-full rounded-lg" />
      ))}
    </div>
  );
}
