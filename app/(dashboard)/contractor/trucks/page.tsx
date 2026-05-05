'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import Drawer, { FormLabel, FormSection, inputCls } from '@/components/ui/Drawer';
import { SvgIconProps } from '@mui/material/SvgIcon';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import PowerSettingsNewRoundedIcon from '@mui/icons-material/PowerSettingsNewRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import OilBarrelOutlinedIcon from '@mui/icons-material/OilBarrelOutlined';

interface TruckData {
  _id: string;
  truckName: string;
  truckNumber: string;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  driverId?:
    | {
        _id: string;
        name: string;
        mobile: string;
      }
    | string;
  createdAt: string;
}

type StatusKey = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

const STATUS_STYLES: Record<StatusKey, string> = {
  ACTIVE: 'bg-success-subtle text-success',
  INACTIVE: 'bg-slate-100 text-ink-muted',
  MAINTENANCE: 'bg-amber-50 text-amber-700',
};

type StatusFilter = 'ALL' | StatusKey;

export default function TrucksPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<TruckData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const queryClient = useQueryClient();

  const { data: trucksRes, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['trucks'],
    queryFn: async () => {
      const res = await api.get<any>('/truck');
      return res.data as TruckData[];
    },
  });

  const trucks: TruckData[] = trucksRes || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/truck/${id}`),
    onSuccess: () => {
      toast.success('Truck deleted');
      queryClient.invalidateQueries({ queryKey: ['trucks'] });
    },
    onError: (err: { message?: string }) => toast.error(err.message || 'Failed to delete truck'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ number, status }: { number: string; status: string }) =>
      api.patch(`/truck/status/${number}`, { status }),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['trucks'] });
    },
    onError: (err: { message?: string }) => toast.error(err.message || 'Failed to update status'),
  });

  const handleEdit = (truck: TruckData) => {
    setEditingTruck(truck);
    setDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this truck? This cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAdd = () => {
    setEditingTruck(null);
    setDrawerOpen(true);
  };

  const handleClose = () => {
    setDrawerOpen(false);
    setEditingTruck(null);
  };

  const filtered = trucks.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q || t.truckName.toLowerCase().includes(q) || t.truckNumber.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    active: trucks.filter((t) => t.status === 'ACTIVE').length,
    maintenance: trucks.filter((t) => t.status === 'MAINTENANCE').length,
    inactive: trucks.filter((t) => t.status === 'INACTIVE').length,
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-up">
        {/* Hero */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 pb-5 border-b border-edge-light">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1">
              Operations → Tankers
            </p>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Tanker Fleet</h1>
            <p className="text-sm text-ink-muted mt-1">
              Register, monitor and manage tankers across your operations.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-surface border border-edge-light hover:border-blue-200 hover:bg-brand-subtle/40 hover:text-brand text-ink-secondary rounded-md text-xs font-semibold transition-all"
            >
              <RefreshRoundedIcon sx={{ fontSize: 16 }} className={isFetching ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-brand hover:bg-brand-hover text-white rounded-md text-xs font-semibold shadow-sm shadow-blue-600/20 transition-all active:scale-[0.98]"
            >
              <AddRoundedIcon sx={{ fontSize: 16 }} />
              Add Truck
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MiniStat label="Total" value={trucks.length} Icon={LocalShippingOutlinedIcon} />
          <MiniStat label="Active" value={counts.active} Icon={VerifiedOutlinedIcon} accent="success" />
          <MiniStat label="Maintenance" value={counts.maintenance} Icon={BuildOutlinedIcon} accent="amber" />
          <MiniStat label="Inactive" value={counts.inactive} Icon={PowerSettingsNewRoundedIcon} accent="muted" />
        </div>

        {/* Table */}
        <div className="minimal-card overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-edge-light">
            <div>
              <h2 className="text-sm font-semibold text-ink">Tankers</h2>
              <p className="text-[10px] text-ink-muted">
                {isLoading ? 'Loading…' : `${filtered.length} of ${trucks.length}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:inline-flex items-center bg-base border border-edge-light rounded-md p-0.5">
                {(['ALL', 'ACTIVE', 'MAINTENANCE', 'INACTIVE'] as const).map((s) => (
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
                  placeholder="Search by name or number…"
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
                  <th className="px-5 py-2.5">Tanker</th>
                  <th className="px-5 py-2.5">Number</th>
                  <th className="px-5 py-2.5 text-right">Capacity</th>
                  <th className="px-5 py-2.5">Driver</th>
                  <th className="px-5 py-2.5">Status</th>
                  <th className="px-5 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge-light">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-5 py-3 h-12 bg-base/40" />
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        Icon={LocalShippingOutlinedIcon}
                        title={
                          searchQuery || statusFilter !== 'ALL'
                            ? 'No tankers match your filters'
                            : 'No tankers yet'
                        }
                        hint={
                          searchQuery || statusFilter !== 'ALL'
                            ? 'Try a different search term or clear filters.'
                            : 'Register your first tanker to get started.'
                        }
                        action={
                          !searchQuery && statusFilter === 'ALL' ? (
                            <button
                              onClick={handleAdd}
                              className="inline-flex items-center gap-1.5 mt-2 h-8 px-3 bg-brand hover:bg-brand-hover text-white rounded-md text-[11px] font-semibold transition-colors"
                            >
                              <AddRoundedIcon sx={{ fontSize: 14 }} />
                              Add Truck
                            </button>
                          ) : null
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((truck) => (
                    <tr key={truck._id} className="hover:bg-base/60 transition-colors group">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded bg-brand-subtle text-brand flex items-center justify-center font-semibold text-[11px] uppercase">
                            {truck.truckName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-ink truncate">{truck.truckName}</p>
                            <p className="text-[10px] text-ink-muted">
                              Added {new Date(truck.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <code className="text-[11px] font-mono font-semibold text-ink-secondary bg-base px-1.5 py-0.5 rounded border border-edge-light uppercase">
                          {truck.truckNumber}
                        </code>
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <span className="inline-flex items-center justify-end text-sm font-semibold text-ink tabular-nums">
                          <OilBarrelOutlinedIcon sx={{ fontSize: 14 }} className="text-ink-disabled mr-0.5" />
                          {truck.capacity.toLocaleString()}
                        </span>
                        <span className="ml-1 text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
                          L
                        </span>
                      </td>
                      <td className="px-5 py-2.5">
                        {truck.driverId && typeof truck.driverId === 'object' ? (
                          <>
                            <p className="text-sm text-ink truncate max-w-45">{truck.driverId.name}</p>
                            <p className="text-[10px] text-ink-muted font-mono tracking-tight">
                              {truck.driverId.mobile}
                            </p>
                          </>
                        ) : (
                          <span className="text-[12px] text-ink-disabled italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-2.5">
                        <select
                          value={truck.status}
                          onChange={(e) =>
                            statusMutation.mutate({ number: truck.truckNumber, status: e.target.value })
                          }
                          className={`h-7 pl-2 pr-6 rounded text-[10px] font-semibold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600/10 ${STATUS_STYLES[truck.status]}`}
                          style={{
                            backgroundImage:
                              "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath d='M5.5 7.5l4.5 4.5 4.5-4.5z'/%3E%3C/svg%3E\")",
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 4px center',
                          }}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="MAINTENANCE">Maintenance</option>
                          <option value="INACTIVE">Inactive</option>
                        </select>
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(truck)}
                            className="p-1.5 text-ink-disabled hover:text-brand hover:bg-brand-subtle rounded transition-colors"
                            title="Edit"
                          >
                            <EditRoundedIcon sx={{ fontSize: 14 }} />
                          </button>
                          <button
                            onClick={() => handleDelete(truck._id)}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 text-ink-disabled hover:text-danger hover:bg-danger-subtle rounded transition-colors disabled:opacity-50"
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

      <TruckDrawer
        open={drawerOpen}
        truck={editingTruck}
        onClose={handleClose}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['trucks'] })}
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
  accent?: 'default' | 'success' | 'amber' | 'muted';
}) {
  const tile =
    accent === 'success'
      ? 'bg-success-subtle text-success'
      : accent === 'amber'
        ? 'bg-amber-50 text-amber-600'
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

function TruckDrawer({
  open,
  truck,
  onClose,
  onRefresh,
}: {
  open: boolean;
  truck: TruckData | null;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const isEdit = !!truck;
  const [formData, setFormData] = useState({
    truckName: truck?.truckName || '',
    truckNumber: truck?.truckNumber || '',
    capacity: truck?.capacity || 5000,
    driverId:
      truck?.driverId && typeof truck.driverId === 'object'
        ? truck.driverId._id
        : (truck?.driverId as string) || '',
  });

  // Re-sync form when switching between add/edit
  const truckKey = truck?._id || 'new';
  const [lastKey, setLastKey] = useState(truckKey);
  if (lastKey !== truckKey) {
    setFormData({
      truckName: truck?.truckName || '',
      truckNumber: truck?.truckNumber || '',
      capacity: truck?.capacity || 5000,
      driverId:
        truck?.driverId && typeof truck.driverId === 'object'
          ? truck.driverId._id
          : (truck?.driverId as string) || '',
    });
    setLastKey(truckKey);
  }

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (truck) return api.put(`/truck/${truck._id}`, data);
      return api.post('/truck/register', data);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Tanker updated' : 'Tanker registered');
      onRefresh();
      onClose();
    },
    onError: (err: { message?: string }) => toast.error(err.message || 'Action failed'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      icon={<LocalShippingOutlinedIcon sx={{ fontSize: 20 }} />}
      title={isEdit ? 'Edit Tanker' : 'Register Tanker'}
      subtitle={
        isEdit ? 'Update tanker details and driver assignment.' : 'Add a new tanker to your fleet.'
      }
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
            form="truck-form"
            type="submit"
            disabled={mutation.isPending}
            className="h-9 px-4 text-xs font-semibold bg-brand hover:bg-brand-hover text-white rounded-md transition-all active:scale-[0.98] disabled:opacity-70 inline-flex items-center gap-1.5"
          >
            {mutation.isPending ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <AddRoundedIcon sx={{ fontSize: 14 }} />
                {isEdit ? 'Save Changes' : 'Register Tanker'}
              </>
            )}
          </button>
        </>
      }
    >
      <div className="px-5 py-5">
        <form id="truck-form" onSubmit={handleSubmit} className="flex flex-col gap-7">
          <FormSection title="Tanker Details" subtitle="Identifies the vehicle in your fleet.">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col gap-1.5">
                <FormLabel required>Display Name</FormLabel>
                <input
                  required
                  type="text"
                  value={formData.truckName}
                  onChange={(e) => setFormData({ ...formData, truckName: e.target.value })}
                  className={inputCls}
                  placeholder="Tanker Alpha-01"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <FormLabel required>Registration Plate</FormLabel>
                <input
                  required
                  type="text"
                  value={formData.truckNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, truckNumber: e.target.value.toUpperCase() })
                  }
                  className={`${inputCls} font-mono uppercase tracking-wider`}
                  placeholder="MH02AB1234"
                  disabled={isEdit}
                />
                {isEdit && (
                  <p className="text-[10px] text-ink-muted leading-snug">
                    Registration plate cannot be changed after creation.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <FormLabel required>Capacity (Liters)</FormLabel>
                <div className="relative">
                  <input
                    required
                    type="number"
                    min={1}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className={`${inputCls} pr-12 tabular-nums`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wider text-ink-disabled pointer-events-none">
                    L
                  </span>
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="Driver Assignment" subtitle="Optional. Link a registered driver by their ID.">
            <div className="flex flex-col gap-1.5">
              <FormLabel optional>Driver ID</FormLabel>
              <input
                type="text"
                value={String(formData.driverId || '')}
                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                className={`${inputCls} font-mono`}
                placeholder="64f0a1b2c3d4e5f60718293a"
              />
              <p className="text-[10px] text-ink-muted leading-snug">
                Leave blank to keep the tanker unassigned.
              </p>
            </div>
          </FormSection>
        </form>
      </div>
    </Drawer>
  );
}
