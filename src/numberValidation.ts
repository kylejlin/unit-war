export function isPositiveInteger(n: number): boolean {
  return n > 0 && Math.floor(n) === n && Number.isFinite(n);
}

export function isPositiveFiniteNumber(n: number): boolean {
  return n > 0 && Number.isFinite(n);
}

export function isOnInclusiveUnitInterval(n: number): boolean {
  return 0 <= n && n <= 1;
}
