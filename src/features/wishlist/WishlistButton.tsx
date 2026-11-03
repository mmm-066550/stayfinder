'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleWishlist, selectIsWishlisted } from './wishlistSlice';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  hotelId: string;
  size?: 'sm' | 'lg';
  className?: string;
}

export function WishlistButton({ hotelId, size = 'sm', className }: WishlistButtonProps) {
  const dispatch = useAppDispatch();
  const wishlisted = useAppSelector((s) => selectIsWishlisted(s, hotelId));

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'shrink-0',
        size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
        className,
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(toggleWishlist(hotelId));
      }}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={cn(
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          wishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground',
        )}
      />
    </Button>
  );
}
