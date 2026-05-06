'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { getCashfree } from '@/lib/cashfree';
import Drawer, { FormLabel, FormSection, inputCls } from '@/components/ui/Drawer';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import { PENDING_PAYMENT_KEY, RETURN_PATH } from './paymentReturn';

interface CreatePaymentResponse {
  payment?: { _id: string };
  paymentSessionId?: string;
}

const PRESETS = [500, 1000, 2000, 5000, 10000];

export default function RechargeDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState<number>(1000);

  const mutation = useMutation({
    mutationFn: async (amt: number) => {
      const res = await api.post<any>('/payments/create', { amount: amt });
      return res.data as CreatePaymentResponse;
    },
    onSuccess: async (data) => {
      const paymentSessionId = data?.paymentSessionId;
      const paymentId = data?.payment?._id;

      if (!paymentSessionId || !paymentId) {
        toast.error('Failed to create payment session');
        return;
      }

      // Persist so we can verify even if Cashfree's redirect path differs
      // (e.g. UPI app intents on mobile).
      try {
        localStorage.setItem(PENDING_PAYMENT_KEY, paymentId);
      } catch {
        // ignore — storage may be disabled
      }

      try {
        const cashfree = await getCashfree();
        await cashfree.checkout({
          paymentSessionId,
          redirectTarget: '_self',
          // Override the gateway's configured return URL so the user lands
          // back on the wallet page. Cashfree appends `?order_id=<paymentId>`.
          returnUrl: `${window.location.origin}${RETURN_PATH}`,
        });
      } catch (err) {
        console.error('Cashfree error:', err);
        toast.error('Failed to initialize payment gateway');
      }
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || 'Failed to create payment');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    mutation.mutate(amount);
  };

  const handleClose = () => {
    if (mutation.isPending) return;
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      size="md"
      icon={<CreditCardRoundedIcon sx={{ fontSize: 20 }} />}
      title="Recharge Wallet"
      subtitle="You'll be redirected to Cashfree to complete the payment."
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={mutation.isPending}
            className="h-9 px-4 text-xs font-semibold text-ink-secondary hover:bg-base border border-edge-light rounded-md transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            form="recharge-form"
            type="submit"
            disabled={mutation.isPending || amount <= 0}
            className="h-9 px-4 text-xs font-semibold bg-brand hover:bg-brand-hover text-white rounded-md transition-all active:scale-[0.98] disabled:opacity-70 inline-flex items-center gap-1.5"
          >
            {mutation.isPending ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <CreditCardRoundedIcon sx={{ fontSize: 14 }} />
                Pay ₹{amount.toLocaleString()}
              </>
            )}
          </button>
        </>
      }
    >
      <div className="px-5 py-5">
        <form id="recharge-form" onSubmit={handleSubmit} className="flex flex-col gap-7">
          <FormSection title="Quick Amounts" subtitle="Pick a preset or enter a custom amount.">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => {
                const isActive = amount === p;
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setAmount(p)}
                    className={`inline-flex items-center h-8 px-3 rounded-md text-[11px] font-semibold transition-all ${
                      isActive
                        ? 'bg-brand text-white border border-brand shadow-sm shadow-blue-600/20'
                        : 'bg-surface text-ink-secondary border border-edge-light hover:border-blue-200 hover:text-brand hover:bg-brand-subtle/40'
                    }`}
                  >
                    ₹{p.toLocaleString()}
                  </button>
                );
              })}
            </div>
          </FormSection>

          <FormSection title="Custom Amount" subtitle="Enter the exact amount to credit.">
            <div className="flex flex-col gap-1.5">
              <FormLabel required>Amount</FormLabel>
              <div className="relative">
                <CurrencyRupeeRoundedIcon
                  sx={{ fontSize: 16 }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-disabled pointer-events-none"
                />
                <input
                  required
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className={`${inputCls} pl-8 tabular-nums text-lg font-semibold`}
                  placeholder="1000"
                />
              </div>
            </div>
          </FormSection>
        </form>
      </div>
    </Drawer>
  );
}
