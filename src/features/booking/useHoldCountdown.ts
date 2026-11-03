'use client';

import { useState, useEffect, useMemo } from 'react';

interface UseHoldCountdownOptions {
  holdExpiresAt: string | null;
  serverTime: string;
}

export function useHoldCountdown({ holdExpiresAt, serverTime }: UseHoldCountdownOptions) {
  const expiresAtClient = useMemo(() => {
    if (!holdExpiresAt) return null;
    const offset = Date.now() - new Date(serverTime).getTime();
    return new Date(holdExpiresAt).getTime() + offset;
  }, [holdExpiresAt, serverTime]);

  const calcSecondsLeft = () => {
    if (expiresAtClient === null) return -1;
    return Math.max(0, Math.floor((expiresAtClient - Date.now()) / 1000));
  };

  const [secondsLeft, setSecondsLeft] = useState(calcSecondsLeft);

  useEffect(() => {
    if (expiresAtClient === null) return;

    setSecondsLeft(Math.max(0, Math.floor((expiresAtClient - Date.now()) / 1000)));

    const interval = setInterval(() => {
      const left = Math.max(0, Math.floor((expiresAtClient - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAtClient]);

  const isExpired = holdExpiresAt !== null && secondsLeft <= 0;
  const isWarning = secondsLeft > 0 && secondsLeft <= 60;
  const isLoading = holdExpiresAt === null;

  const formatted = secondsLeft >= 0
    ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`
    : '--:--';

  return { secondsLeft, isExpired, isWarning, isLoading, formatted };
}
