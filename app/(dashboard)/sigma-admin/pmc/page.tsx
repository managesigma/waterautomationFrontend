'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import { SvgIconProps } from '@mui/material/SvgIcon';
import CreatePmcDrawer from './_components/CreatePmcDrawer';

interface PMC {
  _id: string;
  name: string;
  code: string;
  deploymentType: 'SAAS' | 'ON_PREM';
  status: string;
  createdAt: string;
}

export default function PmcManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'SAAS' | 'ON_PREM'>('ALL');
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['pmcs'],
    queryFn: async () => api.get<any>('/admin/pmc'),
  });

  const pmcs: PMC[] = response?.data || [];

  const filteredPMCs = pmcs.filter((pmc) => {
    const matchesSearch =
      pmc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pmc.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || pmc.deploymentType === filterType;
    return matchesSearch && matchesType;
  });

  const activeCount = pmcs.filter((p) => p.status === 'ACTIVE').length;
  const cloudCount = pmcs.filter((p) => p.deploymentType === 'SAAS').length;
  const onPremCount = pmcs.filter((p) => p.deploymentType === 'ON_PREM').length;

  return (
    <>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-up">
      {/* Hero header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 pb-5 border-b border-edge-light">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1">
            Platform → Cities
          </p>
          <h1 className="text-2xl font-bold text-ink tracking-tight">PMC Management</h1>
          <p className="text-sm text-ink-muted mt-1">
            Onboard, monitor and configure all registered cities and their administrators.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-brand hover:bg-brand-hover text-white rounded-md text-xs font-semibold shadow-sm shadow-blue-600/20 transition-all active:scale-[0.98] self-start md:self-auto"
        >
          <AddRoundedIcon sx={{ fontSize: 16 }} />
          Onboard New City
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat label="Total" value={pmcs.length} Icon={LocationCityOutlinedIcon} />
        <MiniStat label="Active" value={activeCount} Icon={VerifiedOutlinedIcon} accent="success" />
        <MiniStat label="Cloud" value={cloudCount} Icon={CloudOutlinedIcon} />
        <MiniStat label="On-Premise" value={onPremCount} Icon={DnsOutlinedIcon} />
      </div>

      {/* Table */}
      <div className="minimal-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-edge-light">
          <div>
            <h2 className="text-sm font-semibold text-ink">All Cities</h2>
            <p className="text-[10px] text-ink-muted">
              {isLoading ? 'Loading…' : `${filteredPMCs.length} of ${pmcs.length}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Type filter */}
            <div className="hidden md:inline-flex items-center bg-base border border-edge-light rounded-md p-0.5">
              {(['ALL', 'SAAS', 'ON_PREM'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 h-7 text-[11px] font-semibold rounded transition-colors ${
                    filterType === t ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {t === 'ALL' ? 'All' : t === 'SAAS' ? 'Cloud' : 'On-Prem'}
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
                placeholder="Search cities…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 h-8 border border-edge-light rounded-md text-xs text-ink bg-surface placeholder:text-ink-disabled focus:outline-none focus:border-brand focus:ring-2 focus:ring-blue-600/10 transition-all w-full sm:w-64"
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
                <th className="px-5 py-2.5">City</th>
                <th className="px-5 py-2.5">Code</th>
                <th className="px-5 py-2.5">Deployment</th>
                <th className="px-5 py-2.5">Status</th>
                <th className="px-5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge-light">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-5 py-3 h-12 bg-base/40" />
                  </tr>
                ))
              ) : filteredPMCs.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      Icon={LocationCityOutlinedIcon}
                      title="No cities found"
                      hint={searchQuery ? 'Try a different search term' : 'Onboard your first city to begin'}
                      action={
                        !searchQuery ? (
                          <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-1.5 mt-2 h-8 px-3 bg-brand hover:bg-brand-hover text-white rounded-md text-[11px] font-semibold transition-colors"
                          >
                            <AddRoundedIcon sx={{ fontSize: 14 }} />
                            Onboard New City
                          </button>
                        ) : null
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredPMCs.map((pmc) => (
                  <tr key={pmc._id} className="hover:bg-base/60 transition-colors group">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-base border border-edge-light flex items-center justify-center text-ink-secondary group-hover:text-brand group-hover:border-blue-200 transition-colors">
                          <LocationCityOutlinedIcon sx={{ fontSize: 16 }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink truncate">{pmc.name}</p>
                          <p className="text-[10px] text-ink-muted">
                            Joined {new Date(pmc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-2.5">
                      <code className="text-[11px] font-mono text-ink-secondary bg-base px-1.5 py-0.5 rounded border border-edge-light">
                        {pmc.code}
                      </code>
                    </td>
                    <td className="px-5 py-2.5">
                      <DeploymentBadge type={pmc.deploymentType} />
                    </td>
                    <td className="px-5 py-2.5">
                      <StatusPill status={pmc.status} />
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

      <CreatePmcDrawer
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['pmcs'] })}
      />
    </>
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
    <div className="minimal-card p-4 flex items-center justify-between hover:border-blue-200 transition-colors">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1">{label}</p>
        <p className="text-2xl font-bold text-ink tabular-nums tracking-tight leading-none">{value}</p>
      </div>
      <div
        className={`w-9 h-9 rounded flex items-center justify-center ${
          accent === 'success' ? 'bg-success-subtle text-success' : 'bg-base text-ink-secondary border border-edge-light'
        }`}
      >
        <Icon sx={{ fontSize: 18 }} />
      </div>
    </div>
  );
}

function DeploymentBadge({ type }: { type: 'SAAS' | 'ON_PREM' }) {
  return type === 'SAAS' ? (
    <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-secondary">
      <CloudOutlinedIcon sx={{ fontSize: 14 }} className="text-ink-disabled" />
      Cloud
    </div>
  ) : (
    <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-secondary">
      <DnsOutlinedIcon sx={{ fontSize: 14 }} className="text-ink-disabled" />
      On-Premise
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
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success' : 'bg-danger'}`} />
      {isActive ? 'Active' : 'Inactive'}
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

