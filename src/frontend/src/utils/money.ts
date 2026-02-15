export function formatPrice(cents: bigint | number): string {
  const amount = typeof cents === 'bigint' ? Number(cents) : cents;
  return `₹${(amount / 100).toFixed(2)}`;
}

export function centsToRupees(cents: bigint | number): number {
  const amount = typeof cents === 'bigint' ? Number(cents) : cents;
  return amount / 100;
}
