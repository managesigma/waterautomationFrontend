'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { deviceService } from '../../../../../lib/services/deviceService';
import { 
  Server, 
  Cpu, 
  ArrowLeft, 
  Plus, 
  Settings, 
  Trash2, 
  Activity, 
  Wifi, 
  WifiOff,
  Clock,
  ChevronRight,
  Monitor,
  Box
} from 'lucide-react';
import { toast } from 'sonner';
import { SlaveDevice } from '../../../../../types/device';

export default function MasterDeviceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSlaveModalOpen, setIsSlaveModalOpen] = useState(false);

  const { data: masterRes, isLoading: masterLoading } = useQuery({
    queryKey: ['master-device', id],
    queryFn: () => deviceService.getMasterById(id as string),
    enabled: !!id,
  });

  const { data: slavesRes, isLoading: slavesLoading } = useQuery({
    queryKey: ['master-slaves', id],
    queryFn: () => deviceService.getSlavesByMaster(id as string),
    enabled: !!id,
  });

  const master = masterRes?.data;
  const slaves = slavesRes?.data || [];

  const deleteSlaveMutation = useMutation({
    mutationFn: (slaveId: string) => deviceService.deleteSlave(slaveId),
    onSuccess: () => {
      toast.success('Slave device deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['master-slaves', id] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete slave');
    }
  });

  if (masterLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 text-sm animate-pulse">Loading device details...</p>
      </div>
    );
  }

  if (!master) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 bg-white rounded-xl border border-dashed border-gray-200">
        <Monitor className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500 font-medium">Master device not found.</p>
        <button onClick={() => router.back()} className="text-blue-600 text-sm hover:underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-lg transition-all text-gray-500 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{master.masterName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{master.masterId}</span>
            <span className="text-gray-300">•</span>
            <span className={`flex items-center gap-1.5 text-xs font-semibold ${master.status === 'ONLINE' ? 'text-green-600' : 'text-red-500'}`}>
              <div className={`w-2 h-2 rounded-full ${master.status === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              {master.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Info Card */}
        <div className="flex flex-col gap-6">
           <div className="minimal-card p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                 <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">System Details</h2>
                 <Settings className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="flex flex-col gap-5">
                 <DetailItem label="Station ID" value={master.stationId} />
                 <DetailItem label="IP Address" value={master.ipAddress} />
                 <DetailItem label="Firmware" value={master.firmwareVersion} />
                 <DetailItem label="Last Seen" value={new Date(master.lastSeenAt).toLocaleString()} />
                 <DetailItem label="Registered On" value={new Date(master.createdAt).toLocaleDateString()} />
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                 <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold transition-colors border border-gray-100">
                    <Activity className="w-4 h-4" />
                    Diagnostics
                 </button>
              </div>
           </div>
        </div>

        {/* Slaves Management */}
        <div className="lg:col-span-2 flex flex-col gap-4">
           <div className="flex items-center justify-between bg-white/50 p-2 rounded-xl border border-transparent">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3 pl-2">
                 <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                    <Cpu className="w-5 h-5" />
                 </div>
                 Connected Slaves 
                 <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-1">{slaves.length}</span>
              </h2>
              <button
                onClick={() => setIsSlaveModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-blue-200 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Slave
              </button>
           </div>

           <div className="minimal-card overflow-hidden bg-white border border-gray-100 rounded-xl shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                    <th className="px-6 py-4 font-medium">Pole / ID</th>
                    <th className="px-6 py-4 font-medium text-center">Status</th>
                    <th className="px-6 py-4 font-medium">Firmware</th>
                    <th className="px-6 py-4 font-medium">Last Activity</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {slavesLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-6 py-5 h-16 bg-gray-50/50" />
                      </tr>
                    ))
                  ) : slaves.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3 grayscale opacity-60">
                           <Box className="w-10 h-10 text-gray-300" />
                           <p className="text-sm text-gray-500 font-medium">No slave devices connected to this master.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    slaves.map((slave: SlaveDevice) => (
                      <tr key={slave._id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900 font-mono tracking-tight">{slave.poleId}</span>
                              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">ID: {slave._id.slice(-8)}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                            slave.status === 'ONLINE' 
                              ? 'bg-green-50 text-green-700 border-green-100' 
                              : 'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {slave.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                           <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">
                             {slave.firmwareVersion}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                           <div className="flex items-center gap-1.5 font-medium">
                              <Clock className="w-3.5 h-3.5 text-gray-300" />
                              {new Date(slave.lastSeenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => {
                                  if(confirm('Permanently delete this slave device?')) deleteSlaveMutation.mutate(slave._id);
                                }}
                                className="p-2 text-gray-300 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
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

      {isSlaveModalOpen && (
        <RegisterSlaveModal 
          masterId={id as string} 
          onClose={() => setIsSlaveModalOpen(false)} 
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['master-slaves', id] });
            setIsSlaveModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
       <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}

function RegisterSlaveModal({ masterId, onClose, onSuccess }: { masterId: string, onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    slaveDeviceId: '',
    firmwareVersion: 'v1.0.0',
    stationId: '',
    poleId: ''
  });

  const mutation = useMutation({
    mutationFn: (data: any) => deviceService.registerSlaves(masterId, { slaves: data }),
    onSuccess: () => {
      toast.success('Slave device registered successfully');
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to register slave device');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[450px] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
             <Plus className="w-5 h-5 text-blue-600" />
             Register Slave Device
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
             <Plus className="w-5 h-5 rotate-45 transform" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
           <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Slave Device ID</label>
              <input 
                required 
                value={formData.slaveDeviceId}
                onChange={(e) => setFormData({...formData, slaveDeviceId: e.target.value})}
                className="px-4 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50" 
                placeholder="e.g. SLAVE_001" 
              />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Station ID</label>
                <input 
                  required 
                  value={formData.stationId}
                  onChange={(e) => setFormData({...formData, stationId: e.target.value})}
                  className="px-4 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50" 
                  placeholder="STATION_01" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Pole ID</label>
                <input 
                  required 
                  value={formData.poleId}
                  onChange={(e) => setFormData({...formData, poleId: e.target.value})}
                  className="px-4 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50" 
                  placeholder="POLE_A1" 
                />
              </div>
           </div>

           <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Firmware Version</label>
              <input 
                required 
                value={formData.firmwareVersion}
                onChange={(e) => setFormData({...formData, firmwareVersion: e.target.value})}
                className="px-4 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50 font-mono" 
              />
           </div>

           <div className="mt-4 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={mutation.isPending}
                className="px-8 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-70 disabled:scale-100"
              >
                {mutation.isPending ? 'Registering...' : 'Register Device'}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}
