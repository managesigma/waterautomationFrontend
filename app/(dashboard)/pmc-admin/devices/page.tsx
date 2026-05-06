'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { deviceService } from '../../../../lib/services/deviceService';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import PowerSettingsNewRoundedIcon from '@mui/icons-material/PowerSettingsNewRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { MasterDevice } from '../../../../types/device';
import Link from 'next/link';

export default function PmcDevicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL');

  const { data: response, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['master-devices'],
    queryFn: () => deviceService.getAllMasters(),
  });

  const masters = response?.data || [];

  const filteredMasters = masters.filter((m) => {
    const matchesSearch =
      m.masterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.masterId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.stationId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onlineCount = masters.filter((m) => m.status === 'ONLINE').length;
  const offlineCount = masters.filter((m) => m.status === 'OFFLINE').length;
  const totalSlaves = masters.reduce((acc, m) => acc + (m.slaveIds?.length || 0), 0);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-up">
      {/* Hero header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 pb-5 border-b border-edge-light">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1">
            Operations → Devices
          </p>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Device Management</h1>
          <p className="text-sm text-ink-muted mt-1">
            Monitor and manage master and slave devices across all stations.
          </p>
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
        <MiniStat label="Masters" value={masters.length} Icon={HubOutlinedIcon} />
        <MiniStat label="Online" value={onlineCount} Icon={VerifiedOutlinedIcon} accent="success" />
        <MiniStat
          label="Offline"
          value={offlineCount}
          Icon={PowerSettingsNewRoundedIcon}
          accent="muted"
        />
        <MiniStat label="Slaves" value={totalSlaves} Icon={SensorsOutlinedIcon} />
      </div>

      {/* Table */}
      <div className="minimal-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-edge-light">
          <div>
            <h2 className="text-sm font-semibold text-ink">Master Devices</h2>
            <p className="text-[10px] text-ink-muted">
              {isLoading ? 'Loading…' : `${filteredMasters.length} of ${masters.length}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:inline-flex items-center bg-base border border-edge-light rounded-md p-0.5">
              {(['ALL', 'ONLINE', 'OFFLINE'] as const).map((s) => (
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
                placeholder="Search devices…"
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
                <th className="px-5 py-2.5">Device</th>
                <th className="px-5 py-2.5">Station</th>
                <th className="px-5 py-2.5">IP Address</th>
                <th className="px-5 py-2.5">Firmware</th>
                <th className="px-5 py-2.5 text-center">Slaves</th>
                <th className="px-5 py-2.5">Status</th>
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
              ) : filteredMasters.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      Icon={HubOutlinedIcon}
                      title="No master devices found"
                      hint={searchQuery ? 'Try a different search term' : 'Devices will appear once registered'}
                    />
                  </td>
                </tr>
              ) : (
                filteredMasters.map((master: MasterDevice) => (
                  <tr key={master._id} className="hover:bg-base/60 transition-colors group">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded flex items-center justify-center border transition-colors ${
                            master.status === 'ONLINE'
                              ? 'bg-success-subtle text-success border-emerald-200'
                              : 'bg-base text-ink-secondary border-edge-light group-hover:text-brand group-hover:border-blue-200'
                          }`}
                        >
                          <HubOutlinedIcon sx={{ fontSize: 16 }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink truncate">{master.masterName}</p>
                          <p className="text-[10px] text-ink-muted font-mono uppercase tracking-tight">
                            {master.masterId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-sm text-ink-secondary">{master.stationId}</td>
                    <td className="px-5 py-2.5">
                      <code className="text-[11px] font-mono text-ink-secondary bg-base px-1.5 py-0.5 rounded border border-edge-light">
                        {master.ipAddress}
                      </code>
                    </td>
                    <td className="px-5 py-2.5">
                      <span className="px-2 py-0.5 bg-base text-ink-secondary border border-edge-light rounded text-[10px] font-semibold">
                        {master.firmwareVersion}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-center">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-secondary tabular-nums">
                        <SensorsOutlinedIcon sx={{ fontSize: 14 }} className="text-ink-disabled" />
                        {master.slaveIds?.length || 0}
                      </span>
                    </td>
                    <td className="px-5 py-2.5">
                      <StatusPill status={master.status} />
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <Link
                        href={`/pmc-admin/devices/${master._id}`}
                        className="inline-flex items-center gap-1 h-7 px-2.5 rounded border border-edge-light bg-surface text-[11px] font-semibold text-ink-secondary hover:text-brand hover:border-blue-200 hover:bg-brand-subtle/40 transition-all"
                        title="Open"
                      >
                        <OpenInNewRoundedIcon sx={{ fontSize: 13 }} />
                        Open
                      </Link>
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
  accent?: 'default' | 'success' | 'muted';
}) {
  const tile =
    accent === 'success'
      ? 'bg-success-subtle text-success'
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

function StatusPill({ status }: { status: 'ONLINE' | 'OFFLINE' }) {
  const isOnline = status === 'ONLINE';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${
        isOnline ? 'bg-success-subtle text-success' : 'bg-slate-100 text-ink-muted'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-success' : 'bg-slate-400'}`} />
      {isOnline ? 'Online' : 'Offline'}
    </span>
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
