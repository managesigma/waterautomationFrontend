'use client';

import { SvgIconProps } from '@mui/material/SvgIcon';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SouthRoundedIcon from '@mui/icons-material/SouthRounded';
import NorthRoundedIcon from '@mui/icons-material/NorthRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

export interface WalletLog {
  _id: string;
  type: 'CREDIT' | 'RESERVE' | 'DEBIT' | 'REFUND';
  amount: number;
  orderId?: string;
  paymentId?: string;
  balanceAfter: number;
  description?: string;
  createdAt: string;
}

const TYPE_CONFIG: Record<
  WalletLog['type'],
  {
    label: string;
    pillCls: string;
    iconCls: string;
    Icon: React.ComponentType<SvgIconProps>;
    sign: '+' | '−';
    isPositive: boolean;
  }
> = {
  CREDIT: {
    label: 'Credit',
    pillCls: 'bg-success-subtle text-success',
    iconCls: 'bg-success-subtle text-success',
    Icon: SouthRoundedIcon,
    sign: '+',
    isPositive: true,
  },
  REFUND: {
    label: 'Refund',
    pillCls: 'bg-blue-50 text-blue-700',
    iconCls: 'bg-blue-50 text-brand',
    Icon: RestartAltRoundedIcon,
    sign: '+',
    isPositive: true,
  },
  RESERVE: {
    label: 'Reserved',
    pillCls: 'bg-amber-50 text-amber-700',
    iconCls: 'bg-amber-50 text-amber-600',
    Icon: LockOutlinedIcon,
    sign: '−',
    isPositive: false,
  },
  DEBIT: {
    label: 'Debited',
    pillCls: 'bg-danger-subtle text-danger',
    iconCls: 'bg-danger-subtle text-danger',
    Icon: NorthRoundedIcon,
    sign: '−',
    isPositive: false,
  },
};

export default function TransactionList({
  history,
  loading,
}: {
  history: WalletLog[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="divide-y divide-edge-light">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-5 py-3 h-14 animate-pulse bg-base/40" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-5 py-14">
        <div className="w-10 h-10 rounded bg-base border border-edge-light flex items-center justify-center text-ink-disabled">
          <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} />
        </div>
        <p className="text-sm font-medium text-ink-secondary">No transactions yet</p>
        <p className="text-[11px] text-ink-muted">Recharge your wallet to see activity here.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-edge-light">
      {history.map((txn) => {
        const config = TYPE_CONFIG[txn.type] || TYPE_CONFIG.DEBIT;
        const Icon = config.Icon;
        return (
          <li
            key={txn._id}
            className="flex items-center gap-3 px-5 py-3 hover:bg-base/60 transition-colors"
          >
            <div
              className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${config.iconCls}`}
            >
              <Icon sx={{ fontSize: 16 }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${config.pillCls}`}
                >
                  {config.label}
                </span>
                {txn.orderId && (
                  <span className="text-[10px] font-mono text-ink-muted bg-base border border-edge-light px-1.5 py-0.5 rounded">
                    #{typeof txn.orderId === 'string' ? txn.orderId.slice(-6).toUpperCase() : ''}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-ink-secondary mt-0.5 truncate">
                {txn.description || 'Wallet transaction'}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p
                className={`text-sm font-semibold tabular-nums leading-none flex items-center justify-end ${
                  config.isPositive ? 'text-success' : 'text-danger'
                }`}
              >
                <span className="mr-0.5">{config.sign}</span>
                <CurrencyRupeeRoundedIcon sx={{ fontSize: 13 }} />
                {txn.amount.toLocaleString()}
              </p>
              <p className="text-[10px] text-ink-muted mt-1">
                Bal ₹{txn.balanceAfter.toLocaleString()}
              </p>
            </div>

            <div className="hidden md:block shrink-0 text-right border-l border-edge-light pl-4 ml-2">
              <div className="inline-flex items-center gap-1 text-[11px] text-ink-secondary">
                <AccessTimeRoundedIcon sx={{ fontSize: 12 }} className="text-ink-disabled" />
                {new Date(txn.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <p className="text-[10px] text-ink-muted">
                {new Date(txn.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
