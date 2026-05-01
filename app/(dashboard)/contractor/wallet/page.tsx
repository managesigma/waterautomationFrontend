'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Wallet, ArrowLeft, ArrowDownLeft, ArrowUpRight, Lock, TrendingUp, Plus, Clock, CreditCard, Banknote, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getCashfree } from '@/lib/cashfree';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface WalletBalance {
  walletBalance: number;
  walletReserved: number;
  availableBalance: number;
}

interface WalletLog {
  _id: string;
  type: 'CREDIT' | 'RESERVE' | 'DEBIT' | 'REFUND';
  amount: number;
  orderId?: string;
  paymentId?: string;
  balanceAfter: number;
  description?: string;
  createdAt: string;
}

const typeConfig: Record<string, { label: string; color: string; icon: any; sign: string }> = {
  CREDIT: { label: 'Credit', color: 'text-green-600 bg-green-50 border-green-200', icon: ArrowDownLeft, sign: '+' },
  RESERVE: { label: 'Reserved', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: Lock, sign: '−' },
  DEBIT: { label: 'Debited', color: 'text-red-600 bg-red-50 border-red-200', icon: ArrowUpRight, sign: '−' },
  REFUND: { label: 'Refund', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: ArrowDownLeft, sign: '+' },
};

export default function WalletPage() {
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  // Verify payment if redirected back with a payment_id
  useEffect(() => {
    if (paymentId && status) {
      if (status === 'success') {
        toast.success('Payment successful! Your wallet has been credited.');
        // Clean up URL
        router.replace('/contractor/wallet');
      } else if (status === 'failed') {
        toast.error('Payment failed. Please try again.');
        router.replace('/contractor/wallet');
      }
      
      // Invalidate queries to refresh balance
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-history'] });
    }
  }, [paymentId, status, queryClient, router]);

  const { data: walletRes, isLoading: isBalanceLoading } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async () => {
      const res = await api.get<any>('/wallet/balance');
      return res.data as WalletBalance;
    },
  });

  const { data: historyRes, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['wallet-history'],
    queryFn: async () => {
      const res = await api.get<any>('/wallet/history');
      return res;
    },
  });

  const wallet = walletRes;
  const history: WalletLog[] = historyRes?.data || [];

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/contractor" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-ink">Wallet</h1>
            <p className="text-sm text-ink-muted mt-0.5">Balance overview and transaction history</p>
          </div>
        </div>

        <button
          onClick={() => setShowRechargeModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Recharge Wallet
        </button>
      </div>

      {/* Status Banner */}
      {status && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-2 duration-500 ${
          status === 'success' 
            ? 'bg-green-50 border-green-100 text-green-800' 
            : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          {status === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {status === 'success' ? 'Recharge Successful' : 'Payment Failed'}
            </p>
            <p className="text-xs opacity-80">
              {status === 'success' 
                ? 'Your wallet has been credited successfully. You can now place new orders.' 
                : 'There was an issue processing your payment. Please try again or contact support.'}
            </p>
          </div>
          <button 
            onClick={() => router.replace('/contractor/wallet')}
            className="text-xs font-medium hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BalanceCard
          title="Total Balance"
          value={wallet?.walletBalance || 0}
          icon={<Wallet className="w-4 h-4 text-gray-400" />}
          loading={isBalanceLoading}
        />
        <BalanceCard
          title="Available Balance"
          value={wallet?.availableBalance || 0}
          icon={<TrendingUp className="w-4 h-4 text-green-500" />}
          highlight="green"
          loading={isBalanceLoading}
        />
        <BalanceCard
          title="Reserved for Orders"
          value={wallet?.walletReserved || 0}
          icon={<Lock className="w-4 h-4 text-orange-500" />}
          highlight="orange"
          loading={isBalanceLoading}
        />
      </div>

      {/* Transaction History */}
      <div className="minimal-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-edge-light bg-surface">
          <h2 className="font-semibold text-ink text-sm">Transaction History</h2>
          <span className="text-xs text-ink-muted">{history.length} transaction{history.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="bg-white">
          {isHistoryLoading ? (
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-6 py-4 h-16 animate-pulse bg-gray-50/50" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="flex flex-col items-center gap-2">
                <Banknote className="w-10 h-10 text-gray-300" />
                <p className="text-sm text-gray-500">No transactions yet. Recharge your wallet to get started.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map((txn) => {
                const config = typeConfig[txn.type] || typeConfig.DEBIT;
                const IconComponent = config.icon;
                return (
                  <div key={txn._id} className="flex items-center px-6 py-3.5 hover:bg-gray-50 transition-colors">
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${config.color} border`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>

                    {/* Description */}
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-ink">{config.label}</p>
                        {txn.orderId && (
                          <span className="text-[10px] text-ink-muted bg-surface px-1.5 py-0.5 rounded">
                            Order #{typeof txn.orderId === 'string' ? txn.orderId.slice(-6).toUpperCase() : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-muted truncate">{txn.description || 'Wallet transaction'}</p>
                    </div>

                    {/* Amount + Balance */}
                    <div className="text-right ml-4 shrink-0">
                      <p className={`text-sm font-semibold ${txn.type === 'CREDIT' || txn.type === 'REFUND' ? 'text-green-600' : 'text-red-600'}`}>
                        {config.sign}₹{txn.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-400">Bal: ₹{txn.balanceAfter.toLocaleString()}</p>
                    </div>

                    {/* Timestamp */}
                    <div className="ml-6 text-right shrink-0 hidden md:block">
                      <div className="text-xs text-ink-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-ink-muted">
                        {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showRechargeModal && (
        <RechargeModal 
          onClose={() => setShowRechargeModal(false)} 
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
            queryClient.invalidateQueries({ queryKey: ['wallet-history'] });
          }}
        />
      )}
    </div>
  );
}

function BalanceCard({ title, value, icon, highlight, loading }: { 
  title: string; value: number; icon: React.ReactNode; highlight?: string; loading?: boolean 
}) {
  return (
    <div className="minimal-card p-5 flex flex-col gap-2">
      <p className="text-sm font-medium text-ink-muted flex items-center justify-between">
        {title}
        {icon}
      </p>
      {loading ? (
        <div className="h-8 w-32 bg-surface rounded animate-pulse" />
      ) : (
        <p className={`text-2xl font-bold ${
          highlight === 'green' ? 'text-green-700' : 
          highlight === 'orange' ? 'text-orange-600' : 
          'text-ink'
        }`}>₹{value.toLocaleString()}</p>
      )}
    </div>
  );
}

function RechargeModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [amount, setAmount] = useState<number>(1000);

  const mutation = useMutation({
    mutationFn: async (amt: number) => {
      // Creates a Cashfree payment order; the response contains a paymentSessionId
      const res = await api.post<any>('/payments/create', { amount: amt });
      return res.data;
    },
    onSuccess: async (data: any) => {
      const paymentSessionId = data?.paymentSessionId;
      if (paymentSessionId) {
        try {
          const cashfree = await getCashfree();
          await cashfree.checkout({
            paymentSessionId,
            redirectTarget: "_self", // Redirects back to return_url configured in backend
          });
        } catch (err: any) {
          console.error('Cashfree error:', err);
          toast.error('Failed to initialize payment gateway');
        }
      } else {
        toast.error('Failed to create payment session');
      }
    },
    onError: (err: any) => {
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

  const presets = [500, 1000, 2000, 5000, 10000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-[420px] rounded-xl shadow-xl overflow-hidden border border-edge-light">
        <div className="px-6 py-4 border-b border-edge-light flex justify-between items-center">
          <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
            <div className="bg-green-50 text-green-600 p-1.5 rounded-md border border-green-100">
              <CreditCard className="w-4 h-4" />
            </div>
            Recharge Wallet
          </h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <Plus className="w-5 h-5 rotate-45 transform" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Quick Amounts */}
          <div className="flex flex-wrap gap-2">
            {presets.map(p => (
              <button
                type="button"
                key={p}
                onClick={() => setAmount(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                  amount === p 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                ₹{p.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink-muted uppercase">Amount (₹)</label>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="px-3 py-2.5 text-lg font-semibold rounded-md border border-edge-light bg-base text-ink focus:outline-none focus:ring-1 focus:ring-brand w-full"
              placeholder="Enter amount"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || amount <= 0}
              className="flex-1 px-4 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-70"
            >
              {mutation.isPending ? 'Processing...' : `Pay ₹${amount.toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
