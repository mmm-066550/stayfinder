import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHoldCountdown } from './useHoldCountdown';

describe('useHoldCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-03T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns loading state when holdExpiresAt is null', () => {
    const { result } = renderHook(() =>
      useHoldCountdown({ holdExpiresAt: null, serverTime: '2026-11-03T12:00:00Z' }),
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isExpired).toBe(false);
    expect(result.current.formatted).toBe('--:--');
  });

  it('calculates initial seconds correctly', () => {
    const { result } = renderHook(() =>
      useHoldCountdown({
        holdExpiresAt: '2026-11-03T12:05:00Z',
        serverTime: '2026-11-03T12:00:00Z',
      }),
    );
    expect(result.current.secondsLeft).toBe(300);
    expect(result.current.formatted).toBe('5:00');
    expect(result.current.isExpired).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('counts down every second', () => {
    const { result } = renderHook(() =>
      useHoldCountdown({
        holdExpiresAt: '2026-11-03T12:05:00Z',
        serverTime: '2026-11-03T12:00:00Z',
      }),
    );
    expect(result.current.secondsLeft).toBe(300);

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.secondsLeft).toBe(299);

    act(() => { vi.advanceTimersByTime(4000); });
    expect(result.current.secondsLeft).toBe(295);
    expect(result.current.formatted).toBe('4:55');
  });

  it('sets isWarning when under 60 seconds', () => {
    const { result } = renderHook(() =>
      useHoldCountdown({
        holdExpiresAt: '2026-11-03T12:01:01Z',
        serverTime: '2026-11-03T12:00:00Z',
      }),
    );
    expect(result.current.secondsLeft).toBe(61);
    expect(result.current.isWarning).toBe(false);

    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.secondsLeft).toBe(59);
    expect(result.current.isWarning).toBe(true);
  });

  it('marks expired and stops at zero', () => {
    const { result } = renderHook(() =>
      useHoldCountdown({
        holdExpiresAt: '2026-11-03T12:00:03Z',
        serverTime: '2026-11-03T12:00:00Z',
      }),
    );
    expect(result.current.secondsLeft).toBe(3);

    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isExpired).toBe(true);
    expect(result.current.formatted).toBe('0:00');

    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.secondsLeft).toBe(0);
  });

  it('applies server time offset correctly', () => {
    vi.setSystemTime(new Date('2026-11-03T12:00:05Z'));
    const { result } = renderHook(() =>
      useHoldCountdown({
        holdExpiresAt: '2026-11-03T12:05:00Z',
        serverTime: '2026-11-03T12:00:00Z',
      }),
    );
    // Server is 5s behind client, so expiry is shifted forward by 5s
    expect(result.current.secondsLeft).toBe(300);
  });
});
