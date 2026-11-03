import type { Money } from './types';

export function formatHalalas(amount: Money): string {
  const sar = amount / 100;
  return `SAR ${sar.toFixed(2)}`;
}
