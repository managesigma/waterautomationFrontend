'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { toast } from 'sonner';
import Drawer, { FormLabel, FormSection, inputCls } from '@/components/ui/Drawer';
import { SvgIconProps } from '@mui/material/SvgIcon';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import LocalAtmRoundedIcon from '@mui/icons-material/LocalAtmRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LocalDrinkRoundedIcon from '@mui/icons-material/LocalDrinkRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import DonutLargeRoundedIcon from '@mui/icons-material/DonutLargeRounded';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Order {
  _id: string;
  amountReserved: number;
  liters: number;
  ratePerLiter: number;
  status: string;
  executionToken: string;
  driverName?: string;
  driverMobile?: string;
  truckId?: { truckName: string; truckNumber: string; capacity: number } | string;
  createdAt: string;
}

interface TruckOption {
  _id: string;
  truckName: string;
  truckNumber: string;
  capacity: number;
  status: string;
}

interface WalletData {
  walletBalance: number;
  walletReserved: number;
  availableBalance: number;
}

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

// TODO: Replace with real backend data from a route like GET /analytics/contractor/volume
// Example: const { data: volumeData } = useQuery({ queryKey: ['volume-stats'], queryFn: ... })
const mockWeeklyVolume = [
  { day: 'Mon', volume: 12000 },
  { day: 'Tue', volume: 14500 },
  { day: 'Wed', volume: 9000 },
  { day: 'Thu', volume: 16000 },
  { day: 'Fri', volume: 21000 },
  { day: 'Sat', volume: 18000 },
  { day: 'Sun', volume: 22000 },
];

// TODO: Replace with real backend data from a route like GET /analytics/contractor/fleet
const mockFleetStatus = [
  { name: 'Active', value: 12, color: '#1c75bc' },
  { name: 'Maintenance', value: 2, color: '#f59e0b' },
  { name: 'Idle', value: 4, color: '#94a3b8' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-edge-light rounded shadow-sm p-2 flex flex-col gap-1 text-xs">
        <p className="font-semibold text-ink">{label}</p>
        <p className="text-brand tabular-nums font-medium">
          {payload[0].value.toLocaleString()} L
        </p>
      </div>
    );
  }
  return null;
};

export default function ContractorDashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: walletRes, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async () => {
      const res = await api.get<any>('/wallet/balance');
      return res.data as WalletData;
    },
  });

  const { data: ordersRes, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => api.get<any>('/orders'),
  });

  const allOrders: Order[] = ordersRes?.data || [];
  const recentOrders: Order[] = allOrders.slice(0, 6);
  const wallet = walletRes;

  const completedToday = allOrders.filter(
    (o) => o.status === 'COMPLETED' && new Date(o.createdAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-up">
        {/* Action bar */}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MiniStat
            label="Wallet Balance"
            value={wallet?.walletBalance || 0}
            Icon={AccountBalanceWalletOutlinedIcon}
            currency
            loading={walletLoading}
          />
          <MiniStat
            label="Completed Today"
            value={completedToday}
            Icon={LocalShippingOutlinedIcon}
            accent="indigo"
          />
          <MiniStat
            label="Water Sourced (MTD)"
            value={142500}
            suffix=" L"
            Icon={LocalDrinkRoundedIcon}
            accent="success"
          />
          <MiniStat
            label="Avg Dispatch Time"
            value={42}
            suffix=" min"
            Icon={AccessTimeRoundedIcon}
            accent="warning"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Dispatch Volume Chart */}
          <section className="lg:col-span-8 minimal-card flex flex-col p-5">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShowChartRoundedIcon sx={{ fontSize: 16 }} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink leading-tight">Weekly Dispatch Volume</h2>
                <p className="text-[10px] text-ink-muted">Aggregated liters dispensed over the last 7 days</p>
              </div>
            </div>
            <div className="h-56 w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockWeeklyVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1c75bc" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#1c75bc" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#1c75bc"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVolume)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Fleet Status Chart */}
          <section className="lg:col-span-4 minimal-card flex flex-col p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <DonutLargeRoundedIcon sx={{ fontSize: 16 }} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink leading-tight">Fleet Availability</h2>
                <p className="text-[10px] text-ink-muted">Current status of registered tankers</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center relative">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockFleetStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {mockFleetStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
                <p className="text-2xl font-bold text-ink">18</p>
                <p className="text-[10px] uppercase font-semibold text-ink-muted tracking-wider">Total</p>
              </div>
              <div className="flex gap-4 mt-2 justify-center w-full">
                {mockFleetStatus.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-medium text-ink-secondary">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Data Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Wallet card */}
          <aside className="lg:col-span-4 minimal-card overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-edge-light flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-brand-subtle text-brand flex items-center justify-center">
                  <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 16 }} />
                </div>
                <h2 className="text-sm font-semibold text-ink">Wallet Financials</h2>
              </div>
              <Link
                href="/contractor/wallet"
                className="p-1.5 text-ink-muted hover:text-brand hover:bg-brand-subtle rounded transition-colors"
                title="Open wallet"
              >
                <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
              </Link>
            </div>

            <div className="px-5 py-5 flex flex-col gap-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                  Total Balance
                </p>
                <p className="text-3xl font-bold text-ink tracking-tight tabular-nums leading-none flex items-center">
                  <CurrencyRupeeRoundedIcon sx={{ fontSize: 24 }} className="text-ink-secondary" />
                  {(wallet?.walletBalance || 0).toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-edge-light">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-1">
                    Available
                  </p>
                  <p className="text-[15px] font-semibold text-success tabular-nums leading-none flex items-center">
                    <CurrencyRupeeRoundedIcon sx={{ fontSize: 14 }} />
                    {(wallet?.availableBalance || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-1">
                    Reserved
                  </p>
                  <p className="text-[15px] font-semibold text-amber-600 tabular-nums leading-none flex items-center">
                    <CurrencyRupeeRoundedIcon sx={{ fontSize: 14 }} />
                    {(wallet?.walletReserved || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <Link
                href="/contractor/wallet"
                className="mt-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 bg-surface border border-edge-light hover:border-blue-200 hover:bg-brand-subtle/40 hover:text-brand text-ink-secondary rounded-md text-xs font-semibold transition-all"
              >
                <RefreshRoundedIcon sx={{ fontSize: 14 }} />
                Recharge Wallet
              </Link>
            </div>
          </aside>

          {/* Recent orders */}
          <section className="lg:col-span-8 minimal-card overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-edge-light flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <HistoryRoundedIcon sx={{ fontSize: 16 }} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-ink leading-tight">Recent Dispatches</h2>
                  <p className="text-[10px] text-ink-muted">Latest filling tokens issued</p>
                </div>
              </div>
              <div>
              <Link
                href="/contractor/orders"
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded text-[11px] font-semibold text-brand hover:bg-brand-subtle transition-colors"
              >
                View all
                <ArrowForwardRoundedIcon sx={{ fontSize: 12 }} />
              </Link>
              <button
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex items-center gap-1 h-8 px-2.5 bg-brand hover:bg-brand-hover text-white rounded-md text-xs font-semibold shadow-sm shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            <AddRoundedIcon sx={{ fontSize: 12 }} />
            Issue Filling Token
          </button>
          </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider border-b border-edge-light">
                    <th className="px-5 py-2.5">Ref</th>
                    <th className="px-5 py-2.5">Driver / Tanker</th>
                    <th className="px-5 py-2.5 text-right">Volume</th>
                    <th className="px-5 py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge-light">
                  {isOrdersLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="px-5 py-3 h-12 bg-base/40" />
                      </tr>
                    ))
                  ) : recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <EmptyState
                          Icon={HistoryRoundedIcon}
                          title="No dispatches yet"
                          hint="Issue your first filling token to begin."
                          action={
                            <button
                              onClick={() => setIsDrawerOpen(true)}
                              className="inline-flex items-center gap-1.5 mt-2 h-8 px-3 bg-brand hover:bg-brand-hover text-white rounded-md text-[11px] font-semibold transition-colors"
                            >
                              <AddRoundedIcon sx={{ fontSize: 14 }} />
                              Issue Token
                            </button>
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => {
                      const truckLabel =
                        typeof order.truckId === 'object' && order.truckId ? order.truckId.truckNumber : '—';
                      return (
                        <tr key={order._id} className="hover:bg-base/60 transition-colors">
                          <td className="px-5 py-2.5">
                            <p className="text-[12px] font-mono font-semibold text-ink uppercase tracking-tight">
                              #{order._id.slice(-6).toUpperCase()}
                            </p>
                            <p className="text-[10px] text-ink-muted">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="px-5 py-2.5">
                            <p className="text-sm font-medium text-ink truncate max-w-[180px]">
                              {order.driverName || order.driverMobile || 'Unknown'}
                            </p>
                            <p className="text-[10px] text-ink-muted font-mono tracking-tight">{truckLabel}</p>
                          </td>
                          <td className="px-5 py-2.5 text-right">
                            <span className="text-sm font-semibold text-ink tabular-nums">
                              {order.liters.toLocaleString()}
                            </span>
                            <span className="ml-1 text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
                              L
                            </span>
                          </td>
                          <td className="px-5 py-2.5 text-right">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                                statusStyles[order.status] || 'bg-slate-100 text-ink-muted'
                              }`}
                            >
                              {order.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      <CreateOrderDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
          queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
        }}
      />
    </>
  );
}

function MiniStat({
  label,
  value,
  Icon,
  accent = 'default',
  currency = false,
  suffix = '',
  loading = false,
}: {
  label: string;
  value: number | string;
  Icon: React.ComponentType<SvgIconProps>;
  accent?: 'default' | 'success' | 'warning' | 'indigo';
  currency?: boolean;
  suffix?: string;
  loading?: boolean;
}) {
  const tile =
    accent === 'success'
      ? 'bg-success-subtle text-success'
      : accent === 'warning'
        ? 'bg-amber-50 text-amber-600'
        : accent === 'indigo'
          ? 'bg-indigo-50 text-indigo-600'
          : 'bg-base text-ink-secondary border border-edge-light';

  return (
    <div className="minimal-card p-4 flex items-center justify-between hover:border-blue-200 transition-colors">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1">{label}</p>
        {loading ? (
          <div className="h-7 w-24 bg-base rounded animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-ink tabular-nums tracking-tight leading-none flex items-center">
            {currency && <CurrencyRupeeRoundedIcon sx={{ fontSize: 18 }} className="text-ink-secondary" />}
            {typeof value === 'number' ? value.toLocaleString() : value}
            {suffix && <span className="text-sm text-ink-muted font-medium ml-0.5 mt-1">{suffix}</span>}
          </p>
        )}
      </div>
      <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${tile}`}>
        <Icon sx={{ fontSize: 18 }} />
      </div>
    </div>
  );
}

function EmptyState({
  Icon,
  title,
  hint,
  action,
}: {
  Icon: React.ComponentType<SvgIconProps>;
  title: string;
  hint: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-12">
      <div className="w-10 h-10 rounded bg-base border border-edge-light flex items-center justify-center text-ink-disabled">
        <Icon sx={{ fontSize: 20 }} />
      </div>
      <p className="text-sm font-medium text-ink-secondary">{title}</p>
      <p className="text-[11px] text-ink-muted">{hint}</p>
      {action}
    </div>
  );
}

function CreateOrderDrawer({
  open,
  onClose,
  onRefresh,
}: {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [formData, setFormData] = useState({
    truckId: '',
    driverName: '',
    driverMobile: '',
    liters: 5000,
  });

  const { data: trucksRes } = useQuery({
    queryKey: ['contractor-trucks'],
    queryFn: async () => api.get<any>('/truck'),
    enabled: open,
  });

  const trucks: TruckOption[] = (trucksRes?.data || []).filter((t: TruckOption) => t.status === 'ACTIVE');
  const selectedTruck = trucks.find((t) => t._id === formData.truckId);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => api.post('/orders/create', data),
    onSuccess: () => {
      toast.success('Order dispatched. SMS sent to driver.');
      setFormData({ truckId: '', driverName: '', driverMobile: '', liters: 5000 });
      onRefresh();
      onClose();
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || 'Failed to dispatch order');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.truckId) {
      toast.error('Please select a truck');
      return;
    }
    mutation.mutate(formData);
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
      icon={<WaterDropOutlinedIcon sx={{ fontSize: 20 }} />}
      title="Issue Filling Token"
      subtitle="Reserve funds and dispatch a token to the driver."
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
            form="create-order-form"
            type="submit"
            disabled={mutation.isPending}
            className="h-9 px-4 text-xs font-semibold bg-brand hover:bg-brand-hover text-white rounded-md transition-all active:scale-[0.98] disabled:opacity-70 inline-flex items-center gap-1.5"
          >
            {mutation.isPending ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Dispatching…
              </>
            ) : (
              <>
                <SendRoundedIcon sx={{ fontSize: 14 }} />
                Authorize Dispatch
              </>
            )}
          </button>
        </>
      }
    >
      <div className="px-5 py-5">
        <form id="create-order-form" onSubmit={handleSubmit} className="flex flex-col gap-7">
          <FormSection title="Tanker" subtitle="Choose an active tanker for this dispatch.">
            <div className="flex flex-col gap-1.5">
              <FormLabel required>Select Tanker</FormLabel>
              <select
                required
                value={formData.truckId}
                onChange={(e) => setFormData({ ...formData, truckId: e.target.value })}
                className={inputCls}
              >
                <option value="">— Choose available truck —</option>
                {trucks.map((truck) => (
                  <option key={truck._id} value={truck._id}>
                    {truck.truckNumber} — {truck.truckName} ({truck.capacity.toLocaleString()}L)
                  </option>
                ))}
              </select>
              {trucks.length === 0 && (
                <p className="text-[10px] text-amber-600 font-medium leading-snug">
                  No active tankers found. Add one from the Trucks page first.
                </p>
              )}
            </div>
          </FormSection>

          <FormSection title="Driver" subtitle="Token execution link is sent via SMS.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <FormLabel required>Driver Name</FormLabel>
                <div className="relative">
                  <PersonOutlineRoundedIcon
                    sx={{ fontSize: 16 }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-disabled pointer-events-none"
                  />
                  <input
                    required
                    type="text"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className={`${inputCls} pl-8`}
                    placeholder="Ramesh Kumar"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <FormLabel required>Driver Mobile</FormLabel>
                <div className="relative">
                  <PhoneIphoneRoundedIcon
                    sx={{ fontSize: 16 }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-disabled pointer-events-none"
                  />
                  <input
                    required
                    type="tel"
                    inputMode="tel"
                    value={formData.driverMobile}
                    onChange={(e) => setFormData({ ...formData, driverMobile: e.target.value })}
                    className={`${inputCls} pl-8 font-mono tracking-wide`}
                    placeholder="98765 43210"
                  />
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="Volume" subtitle="Cannot exceed tanker capacity.">
            <div className="flex flex-col gap-1.5">
              <FormLabel required>
                Liters
                {selectedTruck && (
                  <span className="ml-2 text-[10px] font-normal text-ink-disabled normal-case">
                    Max {selectedTruck.capacity.toLocaleString()} L
                  </span>
                )}
              </FormLabel>
              <div className="relative">
                <input
                  required
                  type="number"
                  min={100}
                  max={selectedTruck?.capacity}
                  value={formData.liters}
                  onChange={(e) => setFormData({ ...formData, liters: Number(e.target.value) })}
                  className={`${inputCls} pr-12 tabular-nums`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wider text-ink-disabled pointer-events-none">
                  L
                </span>
              </div>
            </div>
          </FormSection>

          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-md bg-blue-50/60 border border-blue-100">
            <InfoOutlinedIcon sx={{ fontSize: 16 }} className="text-brand mt-0.5 shrink-0" />
            <p className="text-[11px] text-ink-secondary leading-relaxed">
              Funds are reserved on token issuance. Driver receives an execution link via SMS.
            </p>
          </div>
        </form>
      </div>
    </Drawer>
  );
}

