'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { SvgIconProps } from '@mui/material/SvgIcon';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

interface Order {
  _id: string;
  contractorId: string;
  truckId?: { truckName: string; truckNumber: string; capacity: number } | string;
  driverName?: string;
  driverMobile?: string;
  liters: number;
  ratePerLiter: number;
  amountReserved: number;
  finalAmount?: number;
  status: string;
  poleId?: string;
  executionToken: string;
  expiresAt: string;
  completedAt?: string;
  createdAt: string;
}

const ALL_STATUSES = [
  'ALL',
  'PENDING',
  'WALLET_RESERVED',
  'TOKEN_SENT',
  'READY_FOR_EXECUTION',
  'DISPENSING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'EXPIRED',
] as const;

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  WALLET_RESERVED: 'bg-blue-50 text-blue-700',
  TOKEN_SENT: 'bg-indigo-50 text-indigo-700',
  READY_FOR_EXECUTION: 'bg-cyan-50 text-cyan-700',
  DISPENSING: 'bg-violet-50 text-violet-700',
  COMPLETED: 'bg-success-subtle text-success',
  FAILED: 'bg-danger-subtle text-danger',
  CANCELLED: 'bg-slate-100 text-ink-muted',
  EXPIRED: 'bg-orange-50 text-orange-700',
};

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<(typeof ALL_STATUSES)[number]>('ALL');

  const { data: ordersRes, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['all-orders', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      return api.get<any>(`/orders${params}`);
    },
  });

  const orders: Order[] = ordersRes?.data || [];

  const counts = {
    completed: orders.filter((o) => o.status === 'COMPLETED').length,
    pending: orders.filter((o) =>
      ['PENDING', 'WALLET_RESERVED', 'TOKEN_SENT', 'READY_FOR_EXECUTION', 'DISPENSING'].includes(o.status)
    ).length,
    failed: orders.filter((o) => ['FAILED', 'EXPIRED', 'CANCELLED'].includes(o.status)).length,
  };

  return (
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
              Operations → Orders
            </p>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Order History</h1>
            <p className="text-sm text-ink-muted mt-1">
              All filling tokens issued, with current status and final amount.
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-surface border border-edge-light hover:border-blue-200 hover:bg-brand-subtle/40 hover:text-brand text-ink-secondary rounded-md text-xs font-semibold transition-all self-start md:self-auto"
        >
          <RefreshRoundedIcon sx={{ fontSize: 16 }} className={isFetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat label="Total" value={orders.length} Icon={Inventory2OutlinedIcon} />
        <MiniStat label="Completed" value={counts.completed} Icon={VerifiedOutlinedIcon} accent="success" />
        <MiniStat label="In Progress" value={counts.pending} Icon={HourglassEmptyRoundedIcon} accent="amber" />
        <MiniStat label="Failed / Expired" value={counts.failed} Icon={ErrorOutlineRoundedIcon} accent="muted" />
      </div>

      {/* Table */}
      <div className="minimal-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-edge-light">
          <div>
            <h2 className="text-sm font-semibold text-ink">Orders</h2>
            <p className="text-[10px] text-ink-muted">
              {isLoading
                ? 'Loading…'
                : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}${
                    statusFilter !== 'ALL' ? ` · ${statusFilter.replace(/_/g, ' ').toLowerCase()}` : ''
                  }`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <FilterListRoundedIcon
                sx={{ fontSize: 16 }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-disabled pointer-events-none"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as (typeof ALL_STATUSES)[number])}
                className="pl-8 pr-3 h-8 border border-edge-light rounded-md text-xs text-ink bg-surface focus:outline-none focus:border-brand focus:ring-2 focus:ring-blue-600/10 transition-all min-w-45 appearance-none"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === 'ALL' ? 'All statuses' : s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider border-b border-edge-light">
                <th className="px-5 py-2.5">Order</th>
                <th className="px-5 py-2.5">Driver</th>
                <th className="px-5 py-2.5">Truck</th>
                <th className="px-5 py-2.5 text-right">Volume</th>
                <th className="px-5 py-2.5 text-right">Amount</th>
                <th className="px-5 py-2.5">Status</th>
                <th className="px-5 py-2.5">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge-light">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-5 py-3 h-12 bg-base/40" />
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      Icon={Inventory2OutlinedIcon}
                      title={
                        statusFilter !== 'ALL'
                          ? `No ${statusFilter.replace(/_/g, ' ').toLowerCase()} orders`
                          : 'No orders yet'
                      }
                      hint={
                        statusFilter !== 'ALL'
                          ? 'Try a different status filter.'
                          : 'Issue a filling token from the dashboard to begin.'
                      }
                    />
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-base/60 transition-colors">
                    <td className="px-5 py-2.5">
                      <p className="text-[12px] font-mono font-semibold text-ink uppercase tracking-tight">
                        #{order._id.slice(-6).toUpperCase()}
                      </p>
                      {order.poleId && (
                        <p className="text-[10px] text-ink-muted font-mono tracking-tight">
                          Pole {order.poleId}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-2.5">
                      <p className="text-sm font-medium text-ink truncate max-w-45">
                        {order.driverName || '—'}
                      </p>
                      {order.driverMobile && (
                        <p className="text-[10px] text-ink-muted font-mono tracking-tight">{order.driverMobile}</p>
                      )}
                    </td>
                    <td className="px-5 py-2.5">
                      {typeof order.truckId === 'object' && order.truckId ? (
                        <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-secondary">
                          <LocalShippingOutlinedIcon sx={{ fontSize: 14 }} className="text-ink-disabled" />
                          <span className="font-mono tracking-tight">{order.truckId.truckNumber}</span>
                        </span>
                      ) : (
                        <span className="text-[12px] text-ink-disabled">—</span>
                      )}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <span className="text-sm font-semibold text-ink tabular-nums">
                        {order.liters.toLocaleString()}
                      </span>
                      <span className="ml-1 text-[10px] font-semibold text-ink-muted uppercase">L</span>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <span className="inline-flex items-center justify-end text-sm font-semibold text-ink tabular-nums">
                        <CurrencyRupeeRoundedIcon sx={{ fontSize: 13 }} className="text-ink-disabled" />
                        {(order.finalAmount ?? order.amountReserved).toLocaleString()}
                      </span>
                      <p className="text-[10px] text-ink-muted">@ ₹{order.ratePerLiter}/L</p>
                    </td>
                    <td className="px-5 py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          statusStyles[order.status] || 'bg-slate-100 text-ink-muted'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="inline-flex items-center gap-1.5 text-[11px] text-ink-secondary">
                        <AccessTimeRoundedIcon sx={{ fontSize: 12 }} className="text-ink-disabled" />
                        {new Date(order.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  Icon,
  accent = 'default',
}: {
  label: string;
  value: number;
  Icon: React.ComponentType<SvgIconProps>;
  accent?: 'default' | 'success' | 'amber' | 'muted';
}) {
  const tile =
    accent === 'success'
      ? 'bg-success-subtle text-success'
      : accent === 'amber'
        ? 'bg-amber-50 text-amber-600'
        : accent === 'muted'
          ? 'bg-base text-ink-muted border border-edge-light'
          : 'bg-base text-ink-secondary border border-edge-light';

  return (
    <div className="minimal-card p-4 flex items-center justify-between hover:border-blue-200 transition-colors">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1">{label}</p>
        <p className="text-2xl font-bold text-ink tabular-nums tracking-tight leading-none">{value}</p>
      </div>
      <div className={`w-9 h-9 rounded flex items-center justify-center ${tile}`}>
        <Icon sx={{ fontSize: 18 }} />
      </div>
    </div>
  );
}

function EmptyState({
  Icon,
  title,
  hint,
}: {
  Icon: React.ComponentType<SvgIconProps>;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-14">
      <div className="w-10 h-10 rounded bg-base border border-edge-light flex items-center justify-center text-ink-disabled">
        <Icon sx={{ fontSize: 20 }} />
      </div>
      <p className="text-sm font-medium text-ink-secondary">{title}</p>
      <p className="text-[11px] text-ink-muted">{hint}</p>
    </div>
  );
}
