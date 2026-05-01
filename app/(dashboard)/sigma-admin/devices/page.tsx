'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { deviceService } from '../../../../lib/services/deviceService';
import { 
  Server, 
  Plus, 
  Search, 
  Building2, 
  Activity, 
  Settings, 
  Trash2,
  Cpu,
  Monitor,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { MasterDevice } from '../../../../types/device';

interface PMC {
  _id: string;
  name: string;
}

export default function SigmaDevicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['all-master-devices'],
    queryFn: () => deviceService.getAllMasters(),
  });

  const { data: pmcsRes } = useQuery({
    queryKey: ['pmcs-list'],
    queryFn: async () => {
      const res = await api.get<any>('/admin/pmc');
      return res;
    },
  });

  const masters = response?.data || [];
  const pmcs = pmcsRes?.data || [];

  const filteredMasters = masters.filter((m) => 
    m.masterName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.masterId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deviceService.deleteMaster(id),
    onSuccess: () => {
      toast.success('Master device deleted');
      queryClient.invalidateQueries({ queryKey: ['all-master-devices'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete device');
    }
  });

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
            <Zap className="w-32 h-32 text-blue-600" />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-3 border border-blue-100">
             <ShieldCheck className="w-3.5 h-3.5" />
             Infrastructure Control
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Global Device Inventory</h1>
          <p className="text-gray-500 mt-2 max-w-md font-medium">Provision and manage master control units across all municipal corporation networks.</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-blue-200 active:scale-95 group"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
             <Plus className="w-4 h-4" />
          </div>
          Register Master Unit
        </button>
      </div>

      <div className="minimal-card overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/30">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Deployment Status</h2>
           </div>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Filter by Unit ID or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-80 transition-all shadow-sm"
              />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] bg-gray-50/50">
                <th className="px-8 py-5 font-medium">Device Profile</th>
                <th className="px-8 py-5 font-medium">Municipality (PMC)</th>
                <th className="px-8 py-5 font-medium">Technical Topology</th>
                <th className="px-8 py-5 font-medium">System Health</th>
                <th className="px-8 py-5 font-medium text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6 h-20 bg-gray-50/50" />
                  </tr>
                ))
              ) : filteredMasters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center border border-gray-100 border-dashed">
                          <Monitor className="w-8 h-8 text-gray-200" />
                       </div>
                       <p className="text-gray-400 font-semibold uppercase tracking-widest text-xs">No active deployments found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMasters.map((master: MasterDevice) => (
                  <tr key={master._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm group-hover:scale-105 transition-transform">
                           <Server className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-gray-900 leading-tight">{master.masterName}</p>
                            <p className="text-[10px] text-gray-400 font-mono font-bold tracking-widest uppercase mt-1">UUID: {master.masterId}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700">
                          <Building2 className="w-3.5 h-3.5 text-blue-400" />
                          {pmcs.find((p: PMC) => p._id === master.pmcId)?.name || 'Central'}
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                             <span className="text-xs text-gray-800 font-bold font-mono">{master.ipAddress}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                             <span className="text-[10px] text-gray-500 font-bold tracking-tight uppercase">Firmware {master.firmwareVersion} • {master.stationId}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                        master.status === 'ONLINE' 
                          ? 'bg-green-50 text-green-700 border-green-100' 
                          : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${master.status === 'ONLINE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></span>
                        {master.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button className="p-2 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100">
                          <Settings className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => {
                            if(confirm('Warning: Deleting this unit will disconnect all field sensors and slaves. Proceed?')) deleteMutation.mutate(master._id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
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

      {isModalOpen && (
        <RegisterMasterModal 
          pmcs={pmcs} 
          onClose={() => setIsModalOpen(false)} 
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['all-master-devices'] })} 
        />
      )}
    </div>
  );
}

function RegisterMasterModal({ pmcs, onClose, onRefresh }: { pmcs: PMC[], onClose: () => void, onRefresh: () => void }) {
  const [formData, setFormData] = useState({
    pmcId: '',
    masterName: '',
    masterId: '',
    ipAddress: '',
    firmwareVersion: 'v1.0.0',
    stationId: ''
  });

  const mutation = useMutation({
    mutationFn: (data: any) => deviceService.registerMaster(data),
    onSuccess: () => {
      toast.success('Master device registered successfully');
      onRefresh();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to register master device');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[550px] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
             <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Provision Master Control</h2>
             <p className="text-xs text-gray-500 font-medium mt-1">Configure hardware parameters for new installation</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white hover:shadow-sm rounded-full transition-all border border-transparent hover:border-gray-100">
             <Plus className="w-6 h-6 rotate-45 transform" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 flex flex-col gap-6">
           <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assigned Municipality</label>
              <select 
                required
                value={formData.pmcId}
                onChange={(e) => setFormData({...formData, pmcId: e.target.value})}
                className="px-5 py-4 text-sm rounded-[1.25rem] border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white font-bold text-gray-800 transition-all"
              >
                 <option value="">Select Target PMC...</option>
                 {pmcs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Hardware ID</label>
                <input 
                  required 
                  value={formData.masterId}
                  onChange={(e) => setFormData({...formData, masterId: e.target.value})}
                  className="px-5 py-4 text-sm rounded-[1.25rem] border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-gray-50/50 font-mono font-bold transition-all" 
                  placeholder="MASTER_001" 
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Station ID</label>
                <input 
                  required 
                  value={formData.stationId}
                  onChange={(e) => setFormData({...formData, stationId: e.target.value})}
                  className="px-5 py-4 text-sm rounded-[1.25rem] border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-gray-50/50 font-bold transition-all" 
                  placeholder="MAIN_01" 
                />
              </div>
           </div>

           <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Device Label</label>
              <input 
                required 
                value={formData.masterName}
                onChange={(e) => setFormData({...formData, masterName: e.target.value})}
                className="px-5 py-4 text-sm rounded-[1.25rem] border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-gray-50/50 font-bold transition-all" 
                placeholder="e.g. Reservoir Control Unit 01" 
              />
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Network IP</label>
                <input 
                  required 
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({...formData, ipAddress: e.target.value})}
                  className="px-5 py-4 text-sm rounded-[1.25rem] border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-gray-50/50 font-mono font-bold transition-all" 
                  placeholder="192.168.1.1" 
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">FW Revision</label>
                <input 
                  required 
                  value={formData.firmwareVersion}
                  onChange={(e) => setFormData({...formData, firmwareVersion: e.target.value})}
                  className="px-5 py-4 text-sm rounded-[1.25rem] border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-gray-50/50 font-mono font-bold transition-all" 
                />
              </div>
           </div>

           <div className="mt-6 flex justify-end gap-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-8 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-[1.25rem] transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={mutation.isPending}
                className="px-10 py-3.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-[1.25rem] transition-all shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-70 disabled:scale-100"
              >
                {mutation.isPending ? 'Deploying...' : 'Confirm Provisioning'}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}
