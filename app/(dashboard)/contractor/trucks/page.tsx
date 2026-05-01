'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Truck, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Edit2,
  AlertTriangle,
  X,
  Search,
  Download,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';

interface TruckData {
  _id: string;
  truckName: string;
  truckNumber: string;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  driverId?: {
    _id: string;
    name: string;
    mobile: string;
  } | string;
  createdAt: string;
}

const statusConfig = {
  ACTIVE: { label: 'Active', color: 'text-success bg-success-subtle border-success/30', icon: CheckCircle2 },
  INACTIVE: { label: 'Inactive', color: 'text-ink-disabled bg-surface border-edge-light', icon: Clock },
  MAINTENANCE: { label: 'Maintenance', color: 'text-warning bg-warning-subtle border-warning/30', icon: AlertTriangle },
};

export default function TrucksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<TruckData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: trucksRes, isLoading } = useQuery({
    queryKey: ['trucks'],
    queryFn: async () => {
      const res = await api.get<any>('/truck');
      return res.data as TruckData[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/truck/${id}`),
    onSuccess: () => {
      toast.success('Truck deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['trucks'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete truck'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ number, status }: { number: string; status: string }) => 
      api.patch(`/truck/status/${number}`, { status }),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['trucks'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update status'),
  });

  const handleEdit = (truck: TruckData) => {
    setEditingTruck(truck);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this truck?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredTrucks = trucksRes?.filter(t => 
    t.truckName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.truckNumber.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Truck Management</h1>
          <p className="text-sm text-ink-muted mt-0.5">Manage and monitor your tanker fleet efficiency</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-edge-light rounded-xl text-sm font-bold text-ink-secondary hover:bg-white hover:border-ink-disabled transition-all shadow-sm">
              <Download className="w-4 h-4" />
              Export CSV
           </button>
           <button
             onClick={() => {
               setEditingTruck(null);
               setIsModalOpen(true);
             }}
             className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand/20 active:scale-[0.98]"
           >
             <Plus className="w-4 h-4" />
             Add New Truck
           </button>
        </div>
      </div>

      {/* Table Container (Ref image 2) */}
      <div className="bg-white rounded-2xl border border-edge-light shadow-sm overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-edge-light bg-surface/30 flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-disabled" />
              <input 
                type="text" 
                placeholder="Search trucks by name or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-edge-light rounded-xl text-sm text-ink focus:outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all"
              />
           </div>
           
           <div className="flex items-center gap-2">
              <button className="p-2 text-ink-secondary hover:bg-white hover:border-edge-light border border-transparent rounded-lg transition-all">
                 <Filter className="w-5 h-5" />
              </button>
              <div className="h-4 w-px bg-edge-light mx-1"></div>
              <p className="text-xs font-bold text-ink-muted uppercase tracking-widest px-2">
                 Total: {filteredTrucks.length}
              </p>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[11px] font-bold uppercase tracking-[0.1em]">
                <th className="px-6 py-4 rounded-tl-xl">Truck Info</th>
                <th className="px-6 py-4">Vehicle Number</th>
                <th className="px-6 py-4">Capacity (L)</th>
                <th className="px-6 py-4">Assigned Driver</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge-light">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-6 h-16 bg-white" />
                  </tr>
                ))
              ) : filteredTrucks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                     <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center">
                           <Truck className="w-6 h-6 text-ink-disabled" />
                        </div>
                        <p className="text-sm font-bold text-ink-muted">No trucks found matching your search</p>
                     </div>
                  </td>
                </tr>
              ) : (
                filteredTrucks.map((truck) => (
                  <tr key={truck._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-brand-subtle text-brand rounded-lg flex items-center justify-center font-bold text-xs">
                             {truck.truckName.charAt(0)}
                          </div>
                          <span className="font-bold text-ink text-sm">{truck.truckName}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="font-mono text-xs font-bold text-ink-secondary bg-surface px-2.5 py-1 rounded-md border border-edge-light uppercase">
                          {truck.truckNumber}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-ink">{truck.capacity.toLocaleString()}</span>
                          <span className="text-[10px] font-bold text-ink-disabled uppercase">Liters</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-sm font-medium text-ink">
                          {truck.driverId && typeof truck.driverId === 'object' ? truck.driverId.name : 'Unassigned'}
                       </p>
                       {truck.driverId && typeof truck.driverId === 'object' && (
                          <p className="text-[10px] text-ink-muted">{truck.driverId.mobile}</p>
                       )}
                    </td>
                    <td className="px-6 py-4">
                       <StatusBadge 
                         status={truck.status} 
                         onChange={(s) => statusMutation.mutate({ number: truck.truckNumber, status: s })} 
                       />
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(truck)}
                            className="p-2 text-ink-disabled hover:text-brand hover:bg-brand-subtle rounded-lg transition-all"
                            title="Edit"
                          >
                             <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(truck._id)}
                            className="p-2 text-ink-disabled hover:text-danger hover:bg-danger-subtle rounded-lg transition-all"
                            title="Delete"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-ink-disabled hover:text-ink hover:bg-surface rounded-lg transition-all">
                             <MoreVertical className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="px-6 py-4 border-t border-edge-light bg-surface/30 flex items-center justify-between">
           <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              Showing 1 - {filteredTrucks.length} of {filteredTrucks.length}
           </p>
           <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg border border-edge-light bg-white text-ink-disabled cursor-not-allowed">
                 <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand text-white text-xs font-bold shadow-md shadow-brand/20">
                 1
              </button>
              <button className="p-1.5 rounded-lg border border-edge-light bg-white text-ink-secondary hover:border-brand transition-all">
                 <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>

      {isModalOpen && (
        <TruckModal 
          truck={editingTruck} 
          onClose={() => setIsModalOpen(false)} 
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['trucks'] })} 
        />
      )}
    </div>
  );
}

function StatusBadge({ status, onChange }: { status: string; onChange: (s: string) => void }) {
  const config = (status && statusConfig[status as keyof typeof statusConfig]) || statusConfig.INACTIVE;
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3">
       <div className={clsx(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tight",
          config.color
        )}>
          <Icon className="w-3 h-3" />
          {config.label}
       </div>
       
       <select 
          value={status}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent border-none text-[10px] font-bold text-ink-disabled uppercase cursor-pointer hover:text-ink transition-colors outline-none"
       >
          {Object.keys(statusConfig).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
       </select>
    </div>
  );
}

function TruckModal({ 
  truck, 
  onClose, 
  onRefresh 
}: { 
  truck: TruckData | null; 
  onClose: () => void; 
  onRefresh: () => void 
}) {
  const [formData, setFormData] = useState({
    truckName: truck?.truckName || '',
    truckNumber: truck?.truckNumber || '',
    capacity: truck?.capacity || 5000,
    driverId: (truck?.driverId && typeof truck.driverId === 'object') ? truck.driverId._id : (truck?.driverId as string || ''),
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (truck) {
        return api.put(`/truck/${truck._id}`, data);
      }
      return api.post('/truck/register', data);
    },
    onSuccess: () => {
      toast.success(`Truck ${truck ? 'updated' : 'registered'} successfully`);
      onRefresh();
      onClose();
    },
    onError: (err: any) => toast.error(err.message || 'Action failed'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[480px] rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col animate-in zoom-in-95 fade-in duration-300">
        <div className="px-8 py-6 border-b border-edge-light flex justify-between items-center bg-surface/30">
          <h2 className="text-xl font-bold text-ink flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-500/20">
               <Truck className="w-5 h-5" />
            </div>
            {truck ? 'Modify Tanker' : 'Register Tanker'}
          </h2>
          <button onClick={onClose} className="p-2 text-ink-muted hover:text-ink hover:bg-surface rounded-full transition-all">
             <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-[0.1em] ml-1">Tanker Display Name</label>
            <input 
              required 
              type="text" 
              value={formData.truckName}
              onChange={(e) => setFormData({...formData, truckName: e.target.value})}
              className="px-4 py-3.5 text-sm font-medium rounded-2xl border border-edge-light bg-surface/50 text-ink focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand w-full transition-all" 
              placeholder="e.g. Tanker Alpha-01" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-[0.1em] ml-1">Registration Plate</label>
            <input 
              required 
              type="text" 
              value={formData.truckNumber}
              onChange={(e) => setFormData({...formData, truckNumber: e.target.value})}
              className="px-4 py-3.5 text-sm font-bold rounded-2xl border border-edge-light bg-surface/50 text-ink focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand w-full font-mono uppercase transition-all" 
              placeholder="e.g. MH02AB1234" 
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-[0.1em] ml-1">Capacity (L)</label>
              <input 
                required 
                type="number" 
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
                className="px-4 py-3.5 text-sm font-bold rounded-2xl border border-edge-light bg-surface/50 text-ink focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand w-full transition-all" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-[0.1em] ml-1">Driver ID (Opt)</label>
              <input 
                type="text" 
                value={String(formData.driverId || '')}
                onChange={(e) => setFormData({...formData, driverId: e.target.value})}
                className="px-4 py-3.5 text-sm font-medium rounded-2xl border border-edge-light bg-surface/50 text-ink focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand w-full transition-all" 
                placeholder="User ID" 
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3 pt-6 border-t border-edge-light">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 text-sm font-bold text-ink-secondary hover:bg-surface rounded-xl transition-all"
            >
              Discard
            </button>
            <button 
              type="submit" 
              disabled={mutation.isPending} 
              className="px-8 py-3 text-sm font-bold bg-brand hover:bg-brand-hover text-white rounded-xl transition-all shadow-xl shadow-brand/20 active:scale-[0.98] disabled:opacity-70"
            >
              {mutation.isPending ? 'Processing...' : truck ? 'Save Changes' : 'Confirm Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
