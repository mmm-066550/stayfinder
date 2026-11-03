'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseHoldCountdownOptions {
  holdExpiresAt: string | null;
  serverTime: string;
}

export function useHoldCountdown({ holdExpiresAt, serverTime }: UseHoldCountdownOptions) {
  const calcSecondsLeft = useCallback(() => {
    if (!holdExpiresAt) return 0;
    const serverOffset = Date.now() - new Date(serverTime).getTime();
    const expiresAtLocal = new Date(holdExpiresAt).getTime() + serverOffset;
    return Math.max(0, Math.floor((expiresAtLocal - Date.now()) / 1000));
  }, [holdExpiresAt, serverTime]);

  const [secondsLeft, setSecondsLeft] = useState(() => calcSecondsLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      const left = calcSecondsLeft();
      setSecondsLeft(left);
      if (left <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [calcSecondsLeft]);

  const isExpired = secondsLeft <= 0;
  const isWarning = secondsLeft > 0 && secondsLeft <= 60;

  const formatted = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`;

  return { secondsLeft, isExpired, isWarning, formatted };
}
