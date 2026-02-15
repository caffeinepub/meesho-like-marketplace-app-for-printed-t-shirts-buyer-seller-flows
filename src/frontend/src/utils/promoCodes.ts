// Allowlisted promo codes for 50% discount
const VALID_PROMO_CODES = [
  'X7P9K2Q4',
  'L3M8Z1T6',
  'R5V2N9C7',
  'B8Q4Y6W1',
  'T2H7J5K9',
  'P9D3F8L2',
  'Z4X6C1V8',
  'N7M2A5S9',
  'K1R8E4T3',
  'W6Y9U2I5',
  'C3B7N1M8',
  'J8L4P6Q2'
];

export function isPromoCodeValid(code: string): boolean {
  return VALID_PROMO_CODES.includes(code.toUpperCase().trim());
}

export function calculateDiscount(totalCents: number, promoCode: string | null): {
  discountCents: number;
  finalTotalCents: number;
  isValid: boolean;
} {
  if (!promoCode || !isPromoCodeValid(promoCode)) {
    return {
      discountCents: 0,
      finalTotalCents: totalCents,
      isValid: false
    };
  }

  const discountCents = Math.floor(totalCents / 2);
  return {
    discountCents,
    finalTotalCents: totalCents - discountCents,
    isValid: true
  };
}
