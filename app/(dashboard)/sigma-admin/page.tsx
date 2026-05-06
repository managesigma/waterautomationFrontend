'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ReportGmailerrorredOutlinedIcon from '@mui/icons-material/ReportGmailerrorredOutlined';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { SvgIconProps } from '@mui/material/SvgIcon';
import Link from 'next/link';

interface PMC {
  _id: string;
  name: string;
  code: string;
  deploymentType: 'SAAS' | 'ON_PREM';
  status: string;
}

export default function SigmaDashboardPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['pmcs-dashboard'],
    queryFn: async () => api.get<any>('/admin/pmc'),
  });

  const pmcs = response?.data || [];
  const activeCount = pmcs.filter((p: PMC) => p.status === 'ACTIVE').length;
  const recentPMCs = pmcs.slice(0, 5);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-up">
      {/* Hero header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 pb-5 border-b border-edge-light">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1">{today}</p>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Platform Overview</h1>
          <p className="text-sm text-ink-muted mt-1">A snapshot of your cities, infrastructure and operations.</p>
        </div>
        <Link
          href="/sigma-admin/pmc"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-brand hover:bg-brand-hover text-white rounded-md text-xs font-semibold shadow-sm shadow-blue-600/20 transition-all active:scale-[0.98] self-start md:self-auto"
        >
          <AddRoundedIcon sx={{ fontSize: 16 }} />
          Onboard New City
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Cities"
          value={pmcs.length.toString()}
          trend="Total registered"
          Icon={LocationCityOutlinedIcon}
        />
        <StatCard
          title="Active Cities"
          value={activeCount.toString()}
          trend="Currently online"
          Icon={VerifiedOutlinedIcon}
          accent="success"
        />
        <StatCard
          title="Platform Issues"
          value="0"
          trend="All systems clear"
          Icon={ReportGmailerrorredOutlinedIcon}
          accent="success"
        />
        <StatCard
          title="Pending Reviews"
          value="0"
          trend="Up to date"
          Icon={HourglassEmptyRoundedIcon}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent PMCs */}
        <div className="minimal-card lg:col-span-2 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 h-12 border-b border-edge-light">
            <div>
              <h2 className="text-sm font-semibold text-ink">Recently Added Cities</h2>
              <p className="text-[10px] text-ink-muted">Latest 5 PMCs onboarded</p>
            </div>
            <Link
              href="/sigma-admin/pmc"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:text-brand-hover transition-colors"
            >
              View all
              <ArrowForwardRoundedIcon sx={{ fontSize: 13 }} />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider border-b border-edge-light">
                  <th className="px-5 py-2.5 font-semibold">City</th>
                  <th className="px-5 py-2.5 font-semibold">Code</th>
                  <th className="px-5 py-2.5 font-semibold">Type</th>
                  <th className="px-5 py-2.5 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge-light">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-5 py-3 h-12 bg-base/40" />
                    </tr>
                  ))
                ) : recentPMCs.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState
                        Icon={LocationCityOutlinedIcon}
                        title="No cities yet"
                        hint="Onboard your first PMC to get started"
                      />
                    </td>
                  </tr>
                ) : (
                  recentPMCs.map((pmc: PMC) => (
                    <tr key={pmc._id} className="hover:bg-base/60 transition-colors">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded bg-base border border-edge-light flex items-center justify-center text-ink-secondary">
                            <LocationCityOutlinedIcon sx={{ fontSize: 16 }} />
                          </div>
                          <p className="text-sm font-medium text-ink">{pmc.name}</p>
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
                      <td className="px-5 py-2.5 text-right">
                        <StatusPill status={pmc.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="minimal-card flex flex-col">
          <div className="px-5 h-12 flex items-center border-b border-edge-light">
            <div>
              <h2 className="text-sm font-semibold text-ink">Quick Actions</h2>
              <p className="text-[10px] text-ink-muted">Frequently used shortcuts</p>
            </div>
          </div>
          <div className="p-3 flex flex-col gap-2">
            <QuickAction
              href="/sigma-admin/pmc"
              title="Manage Cities"
              description="Add or edit PMC clients"
              Icon={LocationCityOutlinedIcon}
            />
            <QuickAction
              href="/sigma-admin/devices"
              title="Device Inventory"
              description="Register master devices"
              Icon={DnsOutlinedIcon}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  trend,
  Icon,
  accent = 'default',
}: {
  title: string;
  value: string;
  trend: string;
  Icon: React.ComponentType<SvgIconProps>;
  accent?: 'default' | 'success';
}) {
  return (
    <div className="minimal-card p-4 flex flex-col gap-3 hover:border-blue-200 transition-colors">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{title}</p>
        <Icon sx={{ fontSize: 16 }} className="text-ink-disabled" />
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="text-3xl font-bold text-ink tabular-nums tracking-tight leading-none">{value}</p>
        <div
          className={`flex items-center gap-1 text-[10px] font-medium ${
            accent === 'success' ? 'text-success' : 'text-ink-muted'
          }`}
        >
          {accent === 'success' && <span className="w-1.5 h-1.5 rounded-full bg-success" />}
          {trend}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
  Icon,
}: {
  href: string;
  title: string;
  description: string;
  Icon: React.ComponentType<SvgIconProps>;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 p-2.5 rounded-md border border-edge-light hover:border-blue-200 hover:bg-brand-subtle/40 transition-all"
    >
      <div className="w-9 h-9 rounded bg-base border border-edge-light flex items-center justify-center text-ink-secondary group-hover:bg-brand-subtle group-hover:text-brand group-hover:border-blue-200 transition-colors shrink-0">
        <Icon sx={{ fontSize: 18 }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink group-hover:text-brand transition-colors">{title}</p>
        <p className="text-[11px] text-ink-muted truncate">{description}</p>
      </div>
      <ArrowOutwardRoundedIcon
        sx={{ fontSize: 14 }}
        className="text-ink-disabled group-hover:text-brand transition-colors"
      />
    </Link>
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
}: {
  Icon: React.ComponentType<SvgIconProps>;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-12">
      <div className="w-10 h-10 rounded bg-base border border-edge-light flex items-center justify-center text-ink-disabled">
        <Icon sx={{ fontSize: 20 }} />
      </div>
      <p className="text-sm font-medium text-ink-secondary">{title}</p>
      <p className="text-[11px] text-ink-muted">{hint}</p>
    </div>
  );
}
