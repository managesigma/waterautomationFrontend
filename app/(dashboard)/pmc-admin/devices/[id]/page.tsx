'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useHeaderStore } from '@/store/headerStore';
import { deviceService } from '../../../../../lib/services/deviceService';
import { SlaveDevice } from '../../../../../types/device';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PowerSettingsNewRoundedIcon from '@mui/icons-material/PowerSettingsNewRounded';
import DevicesOtherOutlinedIcon from '@mui/icons-material/DevicesOtherOutlined';
import { SvgIconProps } from '@mui/material/SvgIcon';

export default function MasterDeviceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { setHeader, resetHeader } = useHeaderStore();

  const { data: masterRes, isLoading: masterLoading, refetch: refetchMaster, isFetching: masterFetching } = useQuery({
    queryKey: ['master-device', id],
    queryFn: () => deviceService.getMasterById(id as string),
    enabled: !!id,
  });

  const {
    data: slavesRes,
    isLoading: slavesLoading,
    refetch: refetchSlaves,
    isFetching: slavesFetching,
  } = useQuery({
    queryKey: ['master-slaves', id],
    queryFn: () => deviceService.getSlavesByMaster(id as string),
    enabled: !!id,
  });

  const master = masterRes?.data;
  const slaves: SlaveDevice[] = slavesRes?.data || [];
  const onlineSlaves = slaves.filter((s) => s.status === 'ONLINE').length;
  const isFetching = masterFetching || slavesFetching;

  useEffect(() => {
    if (master) {
      setHeader({
        title: master.masterName || 'Device Detail',
        subtitle: master.masterId || 'Monitor telemetry and connected slave sensors.',
        category: 'Operations → Devices → Detail',
      });
    }
    return () => resetHeader();
  }, [master, setHeader, resetHeader]);

  const handleRefresh = () => {
    refetchMaster();
    refetchSlaves();
  };

  if (masterLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-8 h-8 border-2 border-edge-light border-t-brand rounded-full animate-spin" />
        <p className="text-xs text-ink-muted">Loading device details…</p>
      </div>
    );
  }

  if (!master) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="minimal-card p-12 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-12 h-12 rounded-md bg-base border border-edge-light flex items-center justify-center text-ink-disabled">
            <HubOutlinedIcon sx={{ fontSize: 22 }} />
          </div>
          <p className="text-sm font-medium text-ink-secondary">Master device not found</p>
          <p className="text-[11px] text-ink-muted">This device may have been removed or is unavailable.</p>
          <button
            onClick={() => router.back()}
            className="mt-2 inline-flex items-center gap-1.5 h-8 px-3 bg-brand hover:bg-brand-hover text-white rounded-md text-[11px] font-semibold transition-colors"
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 14 }} />
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-up">
      {/* Action bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-edge-light bg-surface text-ink-muted hover:text-ink hover:border-blue-200 hover:bg-brand-subtle/40 transition-all shrink-0"
            title="Back"
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
          </button>
          <StatusPill status={master.status} />
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted bg-base border border-edge-light rounded px-1.5 py-0.5">
            <VisibilityOutlinedIcon sx={{ fontSize: 12 }} />
            Read-only
          </span>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-surface border border-edge-light hover:border-blue-200 hover:bg-brand-subtle/40 hover:text-brand text-ink-secondary rounded-md text-xs font-semibold transition-all"
        >
          <RefreshRoundedIcon sx={{ fontSize: 16 }} className={isFetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat
          label="Master Status"
          value={master.status === 'ONLINE' ? 'Online' : 'Offline'}
          Icon={master.status === 'ONLINE' ? VerifiedOutlinedIcon : PowerSettingsNewRoundedIcon}
          accent={master.status === 'ONLINE' ? 'success' : 'muted'}
        />
        <MiniStat label="Connected Slaves" value={slaves.length.toString()} Icon={SensorsOutlinedIcon} />
        <MiniStat label="Slaves Online" value={onlineSlaves.toString()} Icon={VerifiedOutlinedIcon} accent="success" />
        <MiniStat label="Firmware" value={master.firmwareVersion} Icon={DevicesOtherOutlinedIcon} mono />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* System details */}
        <aside className="lg:col-span-1 minimal-card overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-edge-light flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">System Details</h2>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Master</span>
          </div>
          <dl className="px-5 py-4 flex flex-col divide-y divide-edge-light">
            <DetailRow Icon={LocationOnOutlinedIcon} label="Station ID" value={master.stationId} mono />
            <DetailRow Icon={RouterOutlinedIcon} label="IP Address" value={master.ipAddress} mono code />
            <DetailRow Icon={DevicesOtherOutlinedIcon} label="Firmware" value={master.firmwareVersion} mono />
            <DetailRow
              Icon={AccessTimeRoundedIcon}
              label="Last Seen"
              value={new Date(master.lastSeenAt).toLocaleString()}
            />
            <DetailRow
              Icon={EventAvailableOutlinedIcon}
              label="Registered"
              value={new Date(master.createdAt).toLocaleDateString()}
            />
          </dl>
        </aside>

        {/* Slaves table */}
        <section className="lg:col-span-2 minimal-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-edge-light">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <SensorsOutlinedIcon sx={{ fontSize: 16 }} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-ink leading-tight">Connected Slaves</h2>
                <p className="text-[10px] text-ink-muted">
                  {slavesLoading ? 'Loading…' : `${slaves.length} device${slaves.length === 1 ? '' : 's'}`}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider border-b border-edge-light">
                  <th className="px-5 py-2.5">Pole / ID</th>
                  <th className="px-5 py-2.5">Station</th>
                  <th className="px-5 py-2.5">Firmware</th>
                  <th className="px-5 py-2.5">Last Activity</th>
                  <th className="px-5 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge-light">
                {slavesLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-5 py-3 h-12 bg-base/40" />
                    </tr>
                  ))
                ) : slaves.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        Icon={SensorsOutlinedIcon}
                        title="No slave devices"
                        hint="No slaves are currently registered to this master."
                      />
                    </td>
                  </tr>
                ) : (
                  slaves.map((slave) => (
                    <tr key={slave._id} className="hover:bg-base/60 transition-colors">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded flex items-center justify-center border ${
                              slave.status === 'ONLINE'
                                ? 'bg-success-subtle text-success border-emerald-200'
                                : 'bg-base text-ink-secondary border-edge-light'
                            }`}
                          >
                            <SensorsOutlinedIcon sx={{ fontSize: 16 }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-ink font-mono tracking-tight truncate">
                              {slave.poleId}
                            </p>
                            <p className="text-[10px] text-ink-muted font-mono uppercase tracking-tight">
                              ID · {slave._id.slice(-8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <span className="text-[12px] text-ink-secondary font-mono tracking-tight">
                          {slave.stationId}
                        </span>
                      </td>
                      <td className="px-5 py-2.5">
                        <span className="px-2 py-0.5 bg-base text-ink-secondary border border-edge-light rounded text-[10px] font-semibold">
                          {slave.firmwareVersion}
                        </span>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="inline-flex items-center gap-1.5 text-[11px] text-ink-secondary">
                          <AccessTimeRoundedIcon sx={{ fontSize: 12 }} className="text-ink-disabled" />
                          {new Date(slave.lastSeenAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <StatusPill status={slave.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  Icon,
  accent = 'default',
  mono = false,
}: {
  label: string;
  value: string;
  Icon: React.ComponentType<SvgIconProps>;
  accent?: 'default' | 'success' | 'muted';
  mono?: boolean;
}) {
  const iconWrap =
    accent === 'success'
      ? 'bg-success-subtle text-success'
      : accent === 'muted'
        ? 'bg-base text-ink-muted border border-edge-light'
        : 'bg-base text-ink-secondary border border-edge-light';

  return (
    <div className="minimal-card p-3 flex items-center justify-between hover:border-blue-200 transition-colors">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-0.5">{label}</p>
        <p
          className={`text-lg font-bold text-ink tracking-tight leading-none truncate ${
            mono ? 'font-mono text-sm' : 'tabular-nums'
          }`}
        >
          {value}
        </p>
      </div>
      <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${iconWrap}`}>
        <Icon sx={{ fontSize: 14 }} />
      </div>
    </div>
  );
}

function DetailRow({
  Icon,
  label,
  value,
  mono = false,
  code = false,
}: {
  Icon: React.ComponentType<SvgIconProps>;
  label: string;
  value: string;
  mono?: boolean;
  code?: boolean;
}) {
  return (
    <div className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
      <div className="w-7 h-7 rounded bg-base border border-edge-light flex items-center justify-center text-ink-secondary shrink-0">
        <Icon sx={{ fontSize: 14 }} />
      </div>
      <div className="min-w-0 flex-1">
        <dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{label}</dt>
        <dd className={`mt-0.5 text-sm text-ink ${mono ? 'font-mono tracking-tight' : ''} truncate`}>
          {code ? (
            <code className="text-[12px] font-mono text-ink-secondary bg-base px-1.5 py-0.5 rounded border border-edge-light">
              {value}
            </code>
          ) : (
            value
          )}
        </dd>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
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
