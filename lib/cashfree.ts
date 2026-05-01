import { load } from '@cashfreepayments/cashfree-js';

let cashfree: any = null;

export const getCashfree = async () => {
  if (cashfree) return cashfree;

  cashfree = await load({
    mode: process.env.NEXT_PUBLIC_CASHFREE_MODE === 'production' ? 'production' : 'sandbox',
  });

  return cashfree;
};
