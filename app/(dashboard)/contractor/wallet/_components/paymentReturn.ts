'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';

export const PENDING_PAYMENT_KEY = 'pendingPaymentId';
export const RETURN_PATH = '/contractor/wallet';

const SUCCESS_STATUSES = new Set(['SUCCESS', 'PAID', 'COMPLETED', 'CREDITED']);
const FAILED_STATUSES = new Set(['FAILED', 'CANCELLED', 'EXPIRED', 'DROPPED', 'USER_DROPPED']);

interface VerifyResponse {
  status?: string;
  amount?: number;
}

/**
 * After the user returns from Cashfree, verify the payment status and refresh
 * the wallet. We check:
 *   - `?order_id=<paymentId>` from Cashfree's redirect (preferred), and
 *   - `pendingPaymentId` in localStorage as a fallback.
 *
 * The wallet is auto-credited via webhook on the backend, so this call is a
 * UX confirmation — verify, toast, refresh queries, clean up.
 */
export function usePaymentReturn(onVerified: () => void) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;

    const orderIdFromUrl = searchParams.get('order_id');
    const stored = typeof window !== 'undefined' ? localStorage.getItem(PENDING_PAYMENT_KEY) : null;
    const paymentId = orderIdFromUrl || stored;
    if (!paymentId) return;

    handledRef.current = true;

    const cleanup = () => {
      try {
        localStorage.removeItem(PENDING_PAYMENT_KEY);
      } catch {
        // ignore
      }
      if (orderIdFromUrl) router.replace(RETURN_PATH);
    };

    api
      .get<{ data: VerifyResponse }>(`/payments/verify/${paymentId}`)
      .then((res: any) => {
        const status = String(res?.data?.status || '').toUpperCase();
        if (SUCCESS_STATUSES.has(status)) {
          toast.success('Payment successful. Your wallet has been credited.');
        } else if (FAILED_STATUSES.has(status)) {
          toast.error('Payment failed. No amount was charged.');
        } else {
          toast.message('Payment is still being processed. Refresh in a few seconds.');
        }
        onVerified();
      })
      .catch(() => {
        // Stale or unknown payment — clean up silently.
      })
      .finally(cleanup);
  }, [searchParams, router, onVerified]);
}
