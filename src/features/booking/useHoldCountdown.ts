'use client';

import { useState, useEffect } from 'react';

interface UseHoldCountdownOptions {
  holdExpiresAt: string | null;
  serverTime: string;
}

export function useHoldCountdown({ holdExpiresAt, serverTime }: UseHoldCountdownOptions) {
  const [secondsLeft, setSecondsLeft] = useState(-1);

  useEffect(() => {
    if (!holdExpiresAt) return;

    const offset = Date.now() - new Date(serverTime).getTime();
    const expiresAtClient = new Date(holdExpiresAt).getTime() + offset;

    const tick = () => {
      const left = Math.max(0, Math.floor((expiresAtClient - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) clearInterval(interval);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [holdExpiresAt, serverTime]);

  const isExpired = holdExpiresAt !== null && secondsLeft <= 0;
  const isWarning = secondsLeft > 0 && secondsLeft <= 60;
  const isLoading = holdExpiresAt === null;

  const formatted = secondsLeft >= 0
    ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`
    : '--:--';

  return { secondsLeft, isExpired, isWarning, isLoading, formatted };
}
