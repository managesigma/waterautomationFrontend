'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ReportGmailerrorredOutlinedIcon from '@mui/icons-material/ReportGmailerrorredOutlined';
import { SvgIconProps } from '@mui/material/SvgIcon';

export default function PollsManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-polls'],
    queryFn: async () => api.get<any>('/admin/devices/polls'),
  });

  const stats = response?.data || { active: 0, inactive: 0, total: 0, polls: [] };
  const polls = stats.polls;

  const filteredPolls = polls.filter((poll: any) =>
    poll.stationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (poll.pmcId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (poll.masterId?.stationId || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-up">
      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat label="Total Polls" value={stats.total} Icon={DnsOutlinedIcon} />
        <MiniStat label="Active Polls" value={stats.active} Icon={VerifiedOutlinedIcon} accent="success" />
        <MiniStat label="Inactive Polls" value={stats.inactive} Icon={ReportGmailerrorredOutlinedIcon} />
      </div>

      {/* Table */}
      <div className="minimal-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-edge-light">
          <div>
            <h2 className="text-sm font-semibold text-ink">All Polls (Slave Devices)</h2>
            <p className="text-[10px] text-ink-muted">
              {isLoading ? 'Loading…' : `${filteredPolls.length} polls found`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchRoundedIcon sx={{ fontSize: 16 }} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-disabled" />
              <input
                type="text"
                placeholder="Search station ID or corp…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 h-8 border border-edge-light rounded-md text-xs text-ink bg-surface placeholder:text-ink-disabled focus:outline-none focus:border-brand focus:ring-2 focus:ring-blue-600/10 transition-all w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider border-b border-edge-light">
                <th className="px-5 py-2.5">Station ID (Poll)</th>
                <th className="px-5 py-2.5">Corporation</th>
                <th className="px-5 py-2.5">Owner (Master ID)</th>
                <th className="px-5 py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge-light">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-5 py-3 h-12 bg-base/40" />
                  </tr>
                ))
              ) : filteredPolls.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      Icon={DnsOutlinedIcon}
                      title="No polls found"
                      hint="Adjust your search query"
                    />
                  </td>
                </tr>
              ) : (
                filteredPolls.map((poll: any) => (
                  <tr key={poll._id} className="hover:bg-base/60 transition-colors group">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-base border border-edge-light flex items-center justify-center text-ink-secondary">
                          <DnsOutlinedIcon sx={{ fontSize: 16 }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink">{poll.stationId}</p>
                          <p className="text-[10px] text-ink-muted">Token: {poll.deviceToken ? 'Set' : 'None'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-2.5">
                      <p className="text-xs text-ink">{poll.pmcId?.name || 'N/A'}</p>
                      <p className="text-[10px] text-ink-muted">{poll.pmcId?.code}</p>
                    </td>
                    <td className="px-5 py-2.5 text-xs text-ink-secondary">
                      {poll.masterId?.stationId || 'Unlinked'}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <StatusPill status={poll.status} />
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
  accent?: 'default' | 'success';
}) {
  return (
    <div className="minimal-card p-3 flex items-center justify-between hover:border-blue-200 transition-colors">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-0.5">{label}</p>
        <p className="text-lg font-bold text-ink tabular-nums tracking-tight leading-none">{value}</p>
      </div>
      <div
        className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
          accent === 'success' ? 'bg-success-subtle text-success' : 'bg-base text-ink-secondary border border-edge-light'
        }`}
      >
        <Icon sx={{ fontSize: 14 }} />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const isOnline = status === 'ONLINE';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${
        isOnline ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-success' : 'bg-danger'}`} />
      {status}
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
