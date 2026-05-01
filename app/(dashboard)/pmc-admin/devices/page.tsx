'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deviceService } from '../../../../lib/services/deviceService';
import { 
  Server, 
  Cpu, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Wifi, 
  WifiOff, 
  Settings, 
  Trash2, 
  ChevronRight,
  RefreshCw,
  Box
} from 'lucide-react';
import { toast } from 'sonner';
import { MasterDevice } from '../../../../types/device';
import Link from 'next/link';

export default function PmcDevicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['master-devices'],
    queryFn: () => deviceService.getAllMasters(),
  });

  const masters = response?.data || [];

  const filteredMasters = masters.filter((m) => 
    m.masterName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.masterId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.stationId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deviceService.deleteMaster(id),
    onSuccess: () => {
      toast.success('Master device deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['master-devices'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete device');
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this master device? This will also delete all associated slave devices.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Device Management</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor and manage master & slave devices across stations</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button
             onClick={() => refetch()}
             className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white border border-gray-200"
             title="Refresh"
           >
             <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Master Devices" 
          value={masters.length.toString()} 
          icon={<Server className="w-5 h-5 text-blue-600" />}
          trend="Registered" 
          trendUp={true} 
        />
        <StatCard 
          title="Online Devices" 
          value={masters.filter(m => m.status === 'ONLINE').length.toString()} 
          icon={<Wifi className="w-5 h-5 text-green-600" />}
          trend="Active Now" 
          trendUp={true} 
        />
        <StatCard 
          title="Offline Devices" 
          value={masters.filter(m => m.status === 'OFFLINE').length.toString()} 
          icon={<WifiOff className="w-5 h-5 text-red-600" />}
          trend="Require Attention" 
          trendUp={false} 
        />
        <StatCard 
          title="Total Slaves" 
          value={masters.reduce((acc, m) => acc + (m.slaveIds?.length || 0), 0).toString()} 
          icon={<Cpu className="w-5 h-5 text-purple-600" />}
          trend="Connected" 
          trendUp={true} 
        />
      </div>

      <div className="minimal-card overflow-hidden bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
           <h2 className="font-semibold text-gray-900 text-sm">Master Devices</h2>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name, ID or station..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-80"
              />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="px-6 py-3 font-medium">Master Name / ID</th>
                <th className="px-6 py-3 font-medium">Station ID</th>
                <th className="px-6 py-3 font-medium">IP Address</th>
                <th className="px-6 py-3 font-medium">Firmware</th>
                <th className="px-6 py-3 font-medium text-center">Slaves</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-4 h-14 bg-gray-50/50" />
                  </tr>
                ))
              ) : filteredMasters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    No master devices found.
                  </td>
                </tr>
              ) : (
                filteredMasters.map((master: MasterDevice) => (
                  <tr key={master._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center ${master.status === 'ONLINE' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                           <Server className="w-4 h-4" />
                         </div>
                         <div>
                            <p className="text-sm font-medium text-gray-900">{master.masterName}</p>
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-tight">{master.masterId}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                       {master.stationId}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 font-mono">
                       {master.ipAddress}
                    </td>
                    <td className="px-6 py-3">
                       <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">
                         {master.firmwareVersion}
                       </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                       <div className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                         <Cpu className="w-3 h-3" />
                         {master.slaveIds?.length || 0}
                       </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        master.status === 'ONLINE' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${master.status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {master.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/pmc-admin/devices/${master._id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Details & Slaves"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                        <button 
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                          title="Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(master._id)}
                          className="p-1.5 text-red-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                          title="Delete"
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
  );
}

function StatCard({ title, value, icon, trend, trendUp }: { title: string, value: string, icon: React.ReactNode, trend: string, trendUp: boolean }) {
  return (
    <div className="minimal-card p-5 flex flex-col gap-2 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
       <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {icon}
       </div>
       <div className="flex items-end justify-between">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className={`flex items-center gap-1 text-[11px] font-medium ${trendUp ? 'text-green-600' : 'text-gray-500'}`}>
             {trend}
          </div>
       </div>
    </div>
  );
}
