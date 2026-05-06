'use client';

import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import LocalAtmRoundedIcon from '@mui/icons-material/LocalAtmRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import BalanceCard from './_components/BalanceCard';
import TransactionList, { WalletLog } from './_components/TransactionList';
import RechargeDrawer from './_components/RechargeDrawer';
import { usePaymentReturn } from './_components/paymentReturn';

interface WalletBalance {
  walletBalance: number;
  walletReserved: number;
  availableBalance: number;
}

export default function WalletPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  const balanceQuery = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async () => {
      const res = await api.get<any>('/wallet/balance');
      return res.data as WalletBalance;
    },
  });

  const historyQuery = useQuery({
    queryKey: ['wallet-history'],
    queryFn: async () => api.get<any>('/wallet/history'),
  });

  const wallet = balanceQuery.data;
  const history: WalletLog[] = historyQuery.data?.data || [];
  const isFetching = balanceQuery.isFetching || historyQuery.isFetching;

  const handleRefresh = useCallback(() => {
    balanceQuery.refetch();
    historyQuery.refetch();
  }, [balanceQuery, historyQuery]);

  const onPaymentVerified = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
    queryClient.invalidateQueries({ queryKey: ['wallet-history'] });
  }, [queryClient]);

  // Verifies any pending payment when the user returns from Cashfree.
  usePaymentReturn(onPaymentVerified);

  return (
    <>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-up">
        {/* Hero */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 pb-5 border-b border-edge-light">
          <div className="flex items-start gap-3 min-w-0">
            <Link
              href="/contractor"
              className="mt-1 h-8 w-8 inline-flex items-center justify-center rounded-md border border-edge-light bg-surface text-ink-muted hover:text-ink hover:border-blue-200 hover:bg-brand-subtle/40 transition-all shrink-0"
              title="Back"
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
            </Link>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1">
                Finance → Wallet
              </p>
              <h1 className="text-2xl font-bold text-ink tracking-tight">Wallet</h1>
              <p className="text-sm text-ink-muted mt-1">
                Balance overview, reserved funds and full transaction history.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-surface border border-edge-light hover:border-blue-200 hover:bg-brand-subtle/40 hover:text-brand text-ink-secondary rounded-md text-xs font-semibold transition-all"
            >
              <RefreshRoundedIcon sx={{ fontSize: 16 }} className={isFetching ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-brand hover:bg-brand-hover text-white rounded-md text-xs font-semibold shadow-sm shadow-blue-600/20 transition-all active:scale-[0.98]"
            >
              <AddRoundedIcon sx={{ fontSize: 16 }} />
              Recharge
            </button>
          </div>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <BalanceCard
            label="Total Balance"
            value={wallet?.walletBalance || 0}
            Icon={AccountBalanceWalletOutlinedIcon}
            loading={balanceQuery.isLoading}
          />
          <BalanceCard
            label="Available"
            value={wallet?.availableBalance || 0}
            Icon={LocalAtmRoundedIcon}
            accent="success"
            loading={balanceQuery.isLoading}
          />
          <BalanceCard
            label="Reserved"
            value={wallet?.walletReserved || 0}
            Icon={LockOutlinedIcon}
            accent="amber"
            loading={balanceQuery.isLoading}
          />
        </div>

        {/* Transaction history */}
        <div className="minimal-card overflow-hidden">
          <div className="px-5 py-3 border-b border-edge-light flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-ink leading-tight">Transaction History</h2>
                <p className="text-[10px] text-ink-muted">
                  {historyQuery.isLoading
                    ? 'Loading…'
                    : `${history.length} ${history.length === 1 ? 'entry' : 'entries'}`}
                </p>
              </div>
            </div>
          </div>

          <TransactionList history={history} loading={historyQuery.isLoading} />
        </div>
      </div>

      <RechargeDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
