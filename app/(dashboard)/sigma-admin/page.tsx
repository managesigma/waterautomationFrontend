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
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { SvgIconProps } from '@mui/material/SvgIcon';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

interface PMC {
  _id: string;
  name: string;
  code: string;
  deploymentType: 'SAAS' | 'ON_PREM';
  status: string;
}

// TODO: Replace with real backend data from a route like GET /analytics/admin/onboarding
const mockMonthlyOnboarding = [
  { month: 'Jan', count: 2 },
  { month: 'Feb', count: 3 },
  { month: 'Mar', count: 1 },
  { month: 'Apr', count: 4 },
  { month: 'May', count: 5 },
  { month: 'Jun', count: 8 },
];

// TODO: Replace with real backend data from a route like GET /analytics/admin/health
const mockSystemHealth = [
  { time: '00:00', load: 30 },
  { time: '04:00', load: 20 },
  { time: '08:00', load: 75 },
  { time: '12:00', load: 85 },
  { time: '16:00', load: 60 },
  { time: '20:00', load: 45 },
];

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-edge-light rounded shadow-sm p-2 flex flex-col gap-1 text-xs">
        <p className="font-semibold text-ink">{label}</p>
        <p className="text-brand tabular-nums font-medium">
          {payload[0].value} Onboarded
        </p>
      </div>
    );
  }
  return null;
};

const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-edge-light rounded shadow-sm p-2 flex flex-col gap-1 text-xs">
        <p className="font-semibold text-ink">{label}</p>
        <p className="text-indigo-600 tabular-nums font-medium">
          Load: {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

export default function SigmaDashboardPage() {
  const { data: pmcsResponse, isLoading: isLoadingPMCs } = useQuery({
    queryKey: ['pmcs-dashboard'],
    queryFn: async () => api.get<any>('/admin/pmc'),
  });

  const { data: trucksResponse } = useQuery({
    queryKey: ['trucks-dashboard'],
    queryFn: async () => api.get<any>('/admin/trucks'),
  });

  const { data: pollsResponse } = useQuery({
    queryKey: ['polls-dashboard'],
    queryFn: async () => api.get<any>('/admin/devices/polls'),
  });

  const { data: waterResponse } = useQuery({
    queryKey: ['water-dashboard'],
    queryFn: async () => api.get<any>('/admin/stats/water-dispensed'),
  });

  const pmcs = pmcsResponse?.data || [];
  const activeCount = pmcs.filter((p: PMC) => p.status === 'ACTIVE').length;
  const recentPMCs = pmcs.slice(0, 5);

  const trucksCount = trucksResponse?.data?.length || 0;
  const pollsStats = pollsResponse?.data || { active: 0, inactive: 0, total: 0, polls: [] };
  const waterStats = waterResponse?.data || { totalWaterDispensed: 0 };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-up">


      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          title="Total Cities"
          value={pmcs.length.toString()}
          Icon={LocationCityOutlinedIcon}
        />
        <StatCard
          title="Total Trucks"
          value={trucksCount.toString()}
          Icon={LocalShippingOutlinedIcon}
          href="/sigma-admin/trucks"
        />
        <StatCard
          title="Total Water Dispensed"
          value={`${waterStats.totalWaterDispensed.toLocaleString()}L`}
          Icon={VerifiedOutlinedIcon}
          accent="success"
        />
        <StatCard
          title="Active Polls"
          value={pollsStats.active.toString()}
          Icon={DnsOutlinedIcon}
          accent="success"
        />
        <StatCard
          title="Inactive Polls"
          value={pollsStats.inactive.toString()}
          Icon={ReportGmailerrorredOutlinedIcon}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Onboarding Trends */}
        <section className="lg:col-span-6 minimal-card flex flex-col p-5">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <BarChartRoundedIcon sx={{ fontSize: 16 }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink leading-tight">Onboarding Trends</h2>
              <p className="text-[10px] text-ink-muted">New cities added per month</p>
            </div>
          </div>
          <div className="h-56 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockMonthlyOnboarding} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                />
                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} content={<CustomBarTooltip />} />
                <Bar dataKey="count" fill="#1c75bc" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* System Health */}
        <section className="lg:col-span-6 minimal-card flex flex-col p-5">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShowChartRoundedIcon sx={{ fontSize: 16 }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink leading-tight">System Load</h2>
              <p className="text-[10px] text-ink-muted">Average network request load over 24h</p>
            </div>
          </div>
          <div className="h-56 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockSystemHealth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  tickFormatter={(value) => `${value}%`}
                />
                <RechartsTooltip content={<CustomAreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="load"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorLoad)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recent PMCs */}
        <div className="minimal-card lg:col-span-8 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-edge-light">
            <div>
              <h2 className="text-sm font-semibold text-ink">Recently Added Cities</h2>
              <p className="text-[10px] text-ink-muted">Latest 5 PMCs onboarded</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/sigma-admin/pmc"
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded text-[11px] font-semibold text-brand hover:bg-brand-subtle transition-colors"
              >
                View all
                <ArrowForwardRoundedIcon sx={{ fontSize: 12 }} />
              </Link>
              <Link
                href="/sigma-admin/pmc"
                className="inline-flex items-center gap-1.5 h-7 px-2.5 bg-brand hover:bg-brand-hover text-white rounded text-[11px] font-semibold transition-all active:scale-[0.98]"
              >
                <AddRoundedIcon sx={{ fontSize: 14 }} />
                Onboard City
              </Link>
            </div>
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
                {isLoadingPMCs ? (
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
        <div className="minimal-card lg:col-span-4 flex flex-col">
          <div className="px-5 py-3 flex items-center border-b border-edge-light">
            <div>
              <h2 className="text-sm font-semibold text-ink">Quick Actions</h2>
              <p className="text-[10px] text-ink-muted">Frequently used shortcuts</p>
            </div>
          </div>
          <div className="p-4 flex flex-col gap-3">
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
            <QuickAction
              href="#"
              title="System Logs"
              description="View error tracing and events"
              Icon={ReportGmailerrorredOutlinedIcon}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-2">
        {/* Polls Summary */}
        <div className="minimal-card lg:col-span-8 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-edge-light">
            <div>
              <h2 className="text-sm font-semibold text-ink">Total Number of Polls</h2>
              <p className="text-[10px] text-ink-muted">Overview of active and inactive devices</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/sigma-admin/polls"
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded text-[11px] font-semibold text-brand hover:bg-brand-subtle transition-colors"
              >
                View all
                <ArrowForwardRoundedIcon sx={{ fontSize: 12 }} />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider border-b border-edge-light">
                  <th className="px-5 py-2.5 font-semibold">Station ID</th>
                  <th className="px-5 py-2.5 font-semibold">Corporation</th>
                  <th className="px-5 py-2.5 font-semibold">Master</th>
                  <th className="px-5 py-2.5 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge-light">
                {pollsStats.polls.slice(0, 5).map((poll: any) => (
                  <tr key={poll._id} className="hover:bg-base/60 transition-colors">
                    <td className="px-5 py-2.5 text-sm font-medium text-ink">
                      {poll.stationId}
                    </td>
                    <td className="px-5 py-2.5 text-[11px] text-ink-secondary">
                      {poll.pmcId?.name}
                    </td>
                    <td className="px-5 py-2.5 text-[11px] text-ink-secondary">
                      {poll.masterId?.stationId || 'N/A'}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <StatusPill status={poll.status} />
                    </td>
                  </tr>
                ))}
                {pollsStats.polls.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState
                        Icon={DnsOutlinedIcon}
                        title="No polls found"
                        hint="No slave devices are registered yet"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        <div className="minimal-card lg:col-span-4 flex flex-col">
          <div className="px-5 py-3 flex items-center border-b border-edge-light">
            <div>
              <h2 className="text-sm font-semibold text-ink">Alerts</h2>
              <p className="text-[10px] text-ink-muted">System notifications</p>
            </div>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3 p-3 rounded-md bg-danger-subtle/50 border border-danger/20">
              <ReportGmailerrorredOutlinedIcon sx={{ fontSize: 18 }} className="text-danger mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-danger-dark">Inactive Polls</p>
                <p className="text-[11px] text-danger/80">There are {pollsStats.inactive} polls currently offline.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-md bg-success-subtle/50 border border-success/20">
              <VerifiedOutlinedIcon sx={{ fontSize: 18 }} className="text-success mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-success-dark">Active Polls</p>
                <p className="text-[11px] text-success/80">There are {pollsStats.active} polls operating normally.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  Icon,
  accent = 'default',
  href,
}: {
  title: string;
  value: string;
  Icon: React.ComponentType<SvgIconProps>;
  accent?: 'default' | 'success';
  href?: string;
}) {
  return (
    <div className="minimal-card p-3 flex flex-col gap-1.5 hover:border-blue-200 transition-colors">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{title}</p>
        <Icon sx={{ fontSize: 16 }} className="text-ink-disabled" />
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="text-xl font-bold text-ink tabular-nums tracking-tight leading-none">{value}</p>
        <div className="flex items-center gap-1 text-[9px]">
          {href && (
            <Link href={href}>
              <OpenInNewRoundedIcon sx={{ fontSize: 15 }} className='hover:text-blue-500 transition-colors cursor-pointer' />
            </Link>
          )}
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
      className="group flex items-center gap-3 p-3 rounded-md border border-edge-light hover:border-blue-200 hover:bg-brand-subtle/40 transition-all"
    >
      <div className="w-10 h-10 rounded bg-base border border-edge-light flex items-center justify-center text-ink-secondary group-hover:bg-brand-subtle group-hover:text-brand group-hover:border-blue-200 transition-colors shrink-0">
        <Icon sx={{ fontSize: 18 }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink group-hover:text-brand transition-colors">{title}</p>
        <p className="text-[11px] text-ink-muted truncate">{description}</p>
      </div>
      <ArrowOutwardRoundedIcon
        sx={{ fontSize: 16 }}
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
