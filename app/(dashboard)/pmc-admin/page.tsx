'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { SvgIconProps } from '@mui/material/SvgIcon';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import PowerSettingsNewRoundedIcon from '@mui/icons-material/PowerSettingsNewRounded';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import CreateContractorDrawer from './_components/CreateContractorDrawer';

interface Contractor {
  _id: string;
  name: string;
  mobile: string;
  activeTrucks: number;
  walletBalance: number;
  walletReserved: number;
  status: string;
}

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export default function PmcAdminDashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['contractors'],
    queryFn: async () => api.get<any>('/pmc/contractor'),
  });

  const contractors: Contractor[] = response?.data || [];

  const filteredContractors = contractors.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.mobile.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = contractors.filter((c) => c.status === 'ACTIVE').length;
  const totalTrucks = contractors.reduce((acc, c) => acc + (c.activeTrucks || 0), 0);
  const totalDispersed = contractors.reduce((acc, c) => acc + (c.walletBalance || 0), 0);

  return (
    <>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-up">
        {/* Hero header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 pb-5 border-b border-edge-light">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1">
              Operations → Contractors
            </p>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Contractor Management</h1>
            <p className="text-sm text-ink-muted mt-1">
              Onboard and oversee fleet contractors operating under this municipality.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Link
              href="/pmc-admin/devices"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-surface border border-edge-light hover:border-blue-200 hover:bg-brand-subtle/40 hover:text-brand text-ink-secondary rounded-md text-xs font-semibold transition-all"
            >
              <DnsOutlinedIcon sx={{ fontSize: 16 }} />
              Manage Devices
            </Link>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-brand hover:bg-brand-hover text-white rounded-md text-xs font-semibold shadow-sm shadow-blue-600/20 transition-all active:scale-[0.98]"
            >
              <PersonAddAltRoundedIcon sx={{ fontSize: 16 }} />
              Add Contractor
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MiniStat label="Total Contractors" value={contractors.length} Icon={GroupsOutlinedIcon} />
          <MiniStat label="Active" value={activeCount} Icon={VerifiedOutlinedIcon} accent="success" />
          <MiniStat label="Active Trucks" value={totalTrucks} Icon={LocalShippingOutlinedIcon} accent="indigo" />
          <MiniStat
            label="Funds Dispersed"
            value={totalDispersed}
            Icon={AccountBalanceWalletOutlinedIcon}
            currency
          />
        </div>

        {/* Table */}
        <div className="minimal-card overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-edge-light">
            <div>
              <h2 className="text-sm font-semibold text-ink">Registered Contractors</h2>
              <p className="text-[10px] text-ink-muted">
                {isLoading ? 'Loading…' : `${filteredContractors.length} of ${contractors.length}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:inline-flex items-center bg-base border border-edge-light rounded-md p-0.5">
                {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 h-7 text-[11px] font-semibold rounded transition-colors ${
                      statusFilter === s ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              <div className="relative">
                <SearchRoundedIcon
                  sx={{ fontSize: 16 }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-disabled"
                />
                <input
                  type="text"
                  placeholder="Search by name or mobile…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 h-8 border border-edge-light rounded-md text-xs text-ink bg-surface placeholder:text-ink-disabled focus:outline-none focus:border-brand focus:ring-2 focus:ring-blue-600/10 transition-all w-full sm:w-72"
                />
              </div>

              <button
                className="md:hidden h-8 w-8 inline-flex items-center justify-center border border-edge-light bg-surface rounded-md text-ink-muted hover:text-ink transition-colors"
                title="Filter"
              >
                <FilterListRoundedIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider border-b border-edge-light">
                  <th className="px-5 py-2.5">Contractor</th>
                  <th className="px-5 py-2.5">Contact</th>
                  <th className="px-5 py-2.5 text-center">Trucks</th>
                  <th className="px-5 py-2.5">Status</th>
                  <th className="px-5 py-2.5 text-right">Wallet</th>
                  <th className="px-5 py-2.5 text-right">Reserved</th>
                  <th className="px-5 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge-light">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-5 py-3 h-12 bg-base/40" />
                    </tr>
                  ))
                ) : filteredContractors.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        Icon={EngineeringOutlinedIcon}
                        title={searchQuery || statusFilter !== 'ALL' ? 'No contractors match your filters' : 'No contractors yet'}
                        hint={
                          searchQuery || statusFilter !== 'ALL'
                            ? 'Try a different search term or clear filters.'
                            : 'Register your first fleet contractor to begin.'
                        }
                        action={
                          !searchQuery && statusFilter === 'ALL' ? (
                            <button
                              onClick={() => setIsDrawerOpen(true)}
                              className="inline-flex items-center gap-1.5 mt-2 h-8 px-3 bg-brand hover:bg-brand-hover text-white rounded-md text-[11px] font-semibold transition-colors"
                            >
                              <PersonAddAltRoundedIcon sx={{ fontSize: 14 }} />
                              Add Contractor
                            </button>
                          ) : null
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  filteredContractors.map((contractor) => (
                    <tr key={contractor._id} className="hover:bg-base/60 transition-colors group">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded flex items-center justify-center border ${
                              contractor.status === 'ACTIVE'
                                ? 'bg-brand-subtle text-brand border-blue-200'
                                : 'bg-base text-ink-disabled border-edge-light'
                            }`}
                          >
                            <EngineeringOutlinedIcon sx={{ fontSize: 16 }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-ink truncate">{contractor.name}</p>
                            <p className="text-[10px] text-ink-muted font-mono uppercase tracking-tight">
                              ID · {contractor._id.slice(-6).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="inline-flex items-center gap-1.5 text-[12px] text-ink-secondary">
                          <PhoneInTalkOutlinedIcon sx={{ fontSize: 14 }} className="text-ink-disabled" />
                          <span className="font-mono tracking-tight">{contractor.mobile}</span>
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-center">
                        <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <LocalShippingOutlinedIcon sx={{ fontSize: 12 }} />
                          {contractor.activeTrucks || 0}
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <StatusPill status={contractor.status} />
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <span className="inline-flex items-center justify-end text-sm font-semibold text-ink tabular-nums">
                          <CurrencyRupeeRoundedIcon sx={{ fontSize: 13 }} className="text-ink-disabled" />
                          {(contractor.walletBalance || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <span className="inline-flex items-center justify-end text-[12px] text-ink-secondary tabular-nums">
                          <CurrencyRupeeRoundedIcon sx={{ fontSize: 12 }} className="text-ink-disabled" />
                          {(contractor.walletReserved || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <button
                          className="p-1.5 text-ink-disabled hover:text-ink rounded hover:bg-base transition-colors opacity-0 group-hover:opacity-100"
                          title="Actions"
                        >
                          <MoreHorizRoundedIcon sx={{ fontSize: 16 }} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CreateContractorDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['contractors'] })}
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
}: {
  label: string;
  value: number;
  Icon: React.ComponentType<SvgIconProps>;
  accent?: 'default' | 'success' | 'indigo';
  currency?: boolean;
}) {
  const iconWrap =
    accent === 'success'
      ? 'bg-success-subtle text-success'
      : accent === 'indigo'
      ? 'bg-indigo-50 text-indigo-600'
      : 'bg-base text-ink-secondary border border-edge-light';

  return (
    <div className="minimal-card p-4 flex items-center justify-between hover:border-blue-200 transition-colors">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1">{label}</p>
        <p className="text-2xl font-bold text-ink tabular-nums tracking-tight leading-none flex items-center">
          {currency && <CurrencyRupeeRoundedIcon sx={{ fontSize: 18 }} className="text-ink-secondary" />}
          {value.toLocaleString()}
        </p>
      </div>
      <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${iconWrap}`}>
        <Icon sx={{ fontSize: 18 }} />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const isActive = status === 'ACTIVE';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${
        isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'
      }`}
    >
      {isActive ? (
        <span className="w-1.5 h-1.5 rounded-full bg-success" />
      ) : (
        <PowerSettingsNewRoundedIcon sx={{ fontSize: 10 }} />
      )}
      {isActive ? 'Active' : 'Offline'}
    </span>
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
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-14">
      <div className="w-10 h-10 rounded bg-base border border-edge-light flex items-center justify-center text-ink-disabled">
        <Icon sx={{ fontSize: 20 }} />
      </div>
      <p className="text-sm font-medium text-ink-secondary">{title}</p>
      <p className="text-[11px] text-ink-muted">{hint}</p>
      {action}
    </div>
  );
}
