'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { deviceService } from '@/lib/services/deviceService';
import { MasterDevice } from '@/types/device';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import PowerSettingsNewRoundedIcon from '@mui/icons-material/PowerSettingsNewRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { toast } from 'sonner';
import RegisterMasterDrawer from './_components/RegisterMasterDrawer';
import MasterDetailDrawer from './_components/MasterDetailDrawer';

interface PMC {
  _id: string;
  name: string;
}

export default function SigmaDevicesPage() {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL');
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['all-master-devices'],
    queryFn: () => deviceService.getAllMasters(),
  });

  const { data: pmcsRes } = useQuery({
    queryKey: ['pmcs-list'],
    queryFn: () => api.get<{ data: PMC[] }>('/admin/pmc') as unknown as Promise<{ data: PMC[] }>,
  });

  const masters: MasterDevice[] = response?.data || [];
  const pmcs: PMC[] = pmcsRes?.data || [];
  const pmcMap = new Map(pmcs.map((p) => [p._id, p.name]));

  const filteredMasters = masters.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      m.masterName?.toLowerCase().includes(q) ||
      m.masterId?.toLowerCase().includes(q) ||
      m.ipAddress?.toLowerCase().includes(q) ||
      m.stationId?.toLowerCase().includes(q);
    const matchesStatus = filterStatus === 'ALL' || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const onlineCount = masters.filter((m) => m.status === 'ONLINE').length;
  const offlineCount = masters.length - onlineCount;
  const totalSlaves = masters.reduce((sum, m) => sum + (m.slaveIds?.length || 0), 0);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deviceService.deleteMaster(id),
    onSuccess: () => {
      toast.success('Master device deleted');
      queryClient.invalidateQueries({ queryKey: ['all-master-devices'] });
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || 'Failed to delete device');
    },
  });

  return (
    <>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-up">


        {/* Quick stats */}
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
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-edge-light">
            <div>
              <h2 className="text-sm font-semibold text-ink">Master Controllers</h2>
              <p className="text-[10px] text-ink-muted">
                {isLoading ? 'Loading…' : `${filteredMasters.length} of ${masters.length}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:inline-flex items-center bg-base border border-edge-light rounded-md p-0.5">
                {(['ALL', 'ONLINE', 'OFFLINE'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-2.5 h-7 text-[11px] font-semibold rounded transition-colors ${
                      filterStatus === s
                        ? 'bg-surface text-ink shadow-sm'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    {s === 'ALL' ? 'All' : s === 'ONLINE' ? 'Online' : 'Offline'}
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
                  placeholder="Search masters…"
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

              <button
                onClick={() => setRegisterOpen(true)}
                className="inline-flex items-center gap-1.5 h-8 px-3 bg-brand hover:bg-brand-hover text-white rounded-md text-xs font-semibold shadow-sm shadow-blue-600/20 transition-all active:scale-[0.98]"
              >
                <AddRoundedIcon sx={{ fontSize: 14 }} />
                Register Master
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider border-b border-edge-light">
                  <th className="px-5 py-2.5">Device</th>
                  <th className="px-5 py-2.5">PMC</th>
                  <th className="px-5 py-2.5">Network</th>
                  <th className="px-5 py-2.5">Slaves</th>
                  <th className="px-5 py-2.5">Status</th>
                  <th className="px-5 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge-light">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-5 py-3 h-12 bg-base/40" />
                    </tr>
                  ))
                ) : filteredMasters.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        Icon={HubOutlinedIcon}
                        title="No masters found"
                        hint={
                          searchQuery
                            ? 'Try a different search term'
                            : 'Register your first master controller'
                        }
                        action={
                          !searchQuery ? (
                            <button
                              onClick={() => setRegisterOpen(true)}
                              className="inline-flex items-center gap-1.5 mt-2 h-8 px-3 bg-brand hover:bg-brand-hover text-white rounded-md text-[11px] font-semibold transition-colors"
                            >
                              <AddRoundedIcon sx={{ fontSize: 14 }} />
                              Register Master
                            </button>
                          ) : null
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  filteredMasters.map((master) => (
                    <tr
                      key={master._id}
                      onClick={() => setSelectedMasterId(master._id)}
                      className="hover:bg-base/60 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded bg-base border border-edge-light flex items-center justify-center text-ink-secondary group-hover:text-brand group-hover:border-blue-200 transition-colors">
                            <HubOutlinedIcon sx={{ fontSize: 16 }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-ink truncate">
                              {master.masterName}
                            </p>
                            <p className="text-[10px] font-mono text-ink-muted">
                              {master.masterId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-secondary">
                          <LocationCityOutlinedIcon
                            sx={{ fontSize: 14 }}
                            className="text-ink-disabled"
                          />
                          {pmcMap.get(master.pmcId) || '—'}
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="leading-tight">
                          <p className="text-[12px] font-mono text-ink">{master.ipAddress}</p>
                          <p className="text-[10px] text-ink-muted">
                            {master.stationId} · {master.firmwareVersion}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-secondary tabular-nums">
                          <SensorsOutlinedIcon
                            sx={{ fontSize: 14 }}
                            className="text-ink-disabled"
                          />
                          {master.slaveIds?.length || 0}
                        </span>
                      </td>
                      <td className="px-5 py-2.5">
                        <StatusPill status={master.status} />
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMasterId(master._id);
                            }}
                            className="p-1.5 text-ink-disabled hover:text-brand hover:bg-brand-subtle rounded transition-colors"
                            title="Open"
                          >
                            <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  'Delete this master controller? All linked slaves will be disconnected.'
                                )
                              )
                                deleteMutation.mutate(master._id);
                            }}
                            className="p-1.5 text-ink-disabled hover:text-danger hover:bg-danger-subtle rounded transition-colors"
                            title="Delete"
                          >
                            <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
                          </button>
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

      <RegisterMasterDrawer
        open={registerOpen}
        pmcs={pmcs}
        onClose={() => setRegisterOpen(false)}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['all-master-devices'] })}
      />

      <MasterDetailDrawer
        masterId={selectedMasterId}
        pmcMap={pmcMap}
        onClose={() => setSelectedMasterId(null)}
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
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-ink tabular-nums tracking-tight leading-none">
          {value}
        </p>
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
      <span
        className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-success' : 'bg-slate-400'}`}
      />
      {isOnline ? 'Online' : 'Offline'}
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
