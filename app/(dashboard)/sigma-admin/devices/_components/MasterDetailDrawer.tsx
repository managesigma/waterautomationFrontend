'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import LanOutlinedIcon from '@mui/icons-material/LanOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { deviceService } from '@/lib/services/deviceService';
import { SlaveDevice } from '@/types/device';
import Drawer from '@/components/ui/Drawer';
import RegisterSlaveDrawer from './RegisterSlaveDrawer';

export default function MasterDetailDrawer({
  masterId,
  pmcMap,
  onClose,
}: {
  masterId: string | null;
  pmcMap: Map<string, string>;
  onClose: () => void;
}) {
  const open = !!masterId;
  const [registerSlaveOpen, setRegisterSlaveOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: masterRes } = useQuery({
    queryKey: ['master-device', masterId],
    queryFn: () => deviceService.getMasterById(masterId!),
    enabled: !!masterId,
  });

  const { data: slavesRes, isLoading: slavesLoading } = useQuery({
    queryKey: ['master-slaves', masterId],
    queryFn: () => deviceService.getSlavesByMaster(masterId!),
    enabled: !!masterId,
  });

  const master = masterRes?.data;
  const slaves: SlaveDevice[] = slavesRes?.data || [];

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['master-device', masterId] });
    queryClient.invalidateQueries({ queryKey: ['master-slaves', masterId] });
    queryClient.invalidateQueries({ queryKey: ['all-master-devices'] });
  };

  const deleteSlaveMutation = useMutation({
    mutationFn: (id: string) => deviceService.deleteSlave(id),
    onSuccess: () => {
      toast.success('Slave removed');
      refresh();
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || 'Failed to remove slave');
    },
  });

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={master?.masterName || 'Master Controller'}
        subtitle={
          master ? (
            <span className="font-mono">{master.masterId}</span>
          ) : (
            'Loading…'
          )
        }
        icon={<HubOutlinedIcon sx={{ fontSize: 20 }} />}
        size="xl"
      >
        <div className="px-5 py-5 flex flex-col gap-6">
          {/* Status banner */}
          {master && (
            <div className="flex items-center justify-between bg-base/60 border border-edge-light rounded-md px-4 py-3">
              <div className="flex items-center gap-3">
                <StatusDot status={master.status} />
                <div className="leading-tight">
                  <p className="text-xs font-semibold text-ink">{master.status}</p>
                  <p className="text-[10px] text-ink-muted">
                    Last seen{' '}
                    {master.lastSeenAt
                      ? new Date(master.lastSeenAt).toLocaleString()
                      : 'never'}
                  </p>
                </div>
              </div>
              <div className="text-right leading-tight">
                <p className="text-[10px] text-ink-muted uppercase tracking-wider">Slaves</p>
                <p className="text-sm font-semibold text-ink tabular-nums">
                  {master.slaveIds?.length ?? slaves.length}
                </p>
              </div>
            </div>
          )}

          {/* Master info grid */}
          {master && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoTile
                Icon={LocationCityOutlinedIcon}
                label="PMC"
                value={pmcMap.get(master.pmcId) || master.pmcId}
              />
              <InfoTile
                Icon={PlaceOutlinedIcon}
                label="Station"
                value={master.stationId}
                mono
              />
              <InfoTile
                Icon={LanOutlinedIcon}
                label="IP Address"
                value={master.ipAddress}
                mono
              />
              <InfoTile
                Icon={MemoryOutlinedIcon}
                label="Firmware"
                value={master.firmwareVersion}
                mono
              />
            </div>
          )}

          {/* Slaves */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-semibold text-ink">Linked Slaves</h3>
                <p className="text-[10px] text-ink-muted">
                  Field sensors reporting to this master.
                </p>
              </div>
              <button
                onClick={() => setRegisterSlaveOpen(true)}
                disabled={!masterId}
                className="inline-flex items-center gap-1.5 h-8 px-3 bg-brand hover:bg-brand-hover text-white rounded-md text-[11px] font-semibold transition-colors disabled:opacity-50"
              >
                <AddRoundedIcon sx={{ fontSize: 14 }} />
                Register Slave
              </button>
            </div>

            <div className="border border-edge-light rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider border-b border-edge-light">
                      <th className="px-4 py-2.5">Slave</th>
                      <th className="px-4 py-2.5">Pole</th>
                      <th className="px-4 py-2.5">Firmware</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-edge-light">
                    {slavesLoading ? (
                      Array.from({ length: 2 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="px-4 py-3 h-10 bg-base/40" />
                        </tr>
                      ))
                    ) : slaves.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-8 h-8 rounded bg-base border border-edge-light flex items-center justify-center text-ink-disabled">
                              <SensorsOutlinedIcon sx={{ fontSize: 16 }} />
                            </div>
                            <p className="text-xs text-ink-secondary font-medium">
                              No slaves yet
                            </p>
                            <p className="text-[10px] text-ink-muted">
                              Register a slave to start receiving telemetry.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      slaves.map((slave) => (
                        <tr key={slave._id} className="hover:bg-base/40 transition-colors group">
                          <td className="px-4 py-2.5">
                            <div className="leading-tight">
                              <p className="text-[12px] font-mono text-ink">
                                {slave.slaveDeviceId || slave._id}
                              </p>
                              <p className="text-[10px] text-ink-muted">{slave.stationId}</p>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-[11px] font-mono text-ink-secondary">
                            {slave.poleId}
                          </td>
                          <td className="px-4 py-2.5 text-[11px] font-mono text-ink-secondary">
                            {slave.firmwareVersion}
                          </td>
                          <td className="px-4 py-2.5">
                            <StatusPill status={slave.status} />
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => {
                                if (confirm('Remove this slave from the master?'))
                                  deleteSlaveMutation.mutate(slave._id);
                              }}
                              className="p-1.5 text-ink-disabled hover:text-danger hover:bg-danger-subtle rounded transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete"
                            >
                              <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
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
        </div>
      </Drawer>

      <RegisterSlaveDrawer
        open={registerSlaveOpen}
        masterId={masterId}
        pmcId={master?.pmcId ?? null}
        masterName={master?.masterName}
        onClose={() => setRegisterSlaveOpen(false)}
        onRefresh={refresh}
      />
    </>
  );
}

function InfoTile({
  Icon,
  label,
  value,
  mono,
}: {
  Icon: React.ComponentType<SvgIconProps>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="border border-edge-light rounded-md px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded bg-base border border-edge-light flex items-center justify-center text-ink-secondary shrink-0">
        <Icon sx={{ fontSize: 16 }} />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="text-[10px] text-ink-muted uppercase tracking-wider">{label}</p>
        <p className={`text-xs text-ink truncate ${mono ? 'font-mono' : 'font-medium'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: 'ONLINE' | 'OFFLINE' }) {
  const isOnline = status === 'ONLINE';
  return (
    <span
      className={`relative w-2.5 h-2.5 rounded-full ${
        isOnline ? 'bg-emerald-500' : 'bg-slate-400'
      }`}
    >
      {isOnline && (
        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60" />
      )}
    </span>
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
