'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Users, Plus, IndianRupee, Search, MoreHorizontal, Briefcase, Server } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Contractor {
  _id: string;
  name: string;
  mobile: string;
  activeTrucks: number;
  walletBalance: number;
  walletReserved: number;
  status: string;
}

export default function PmcAdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: requestRes, isLoading } = useQuery({
    queryKey: ['contractors'],
    queryFn: async () => {
      const res = await api.get<any>('/pmc/contractor');
      return res;
    },
  });

  const contractors = requestRes?.data || [];

  const filteredContractors = contractors.filter((c: Contractor) => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.mobile.includes(searchQuery)
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Contractor Management</h1>
          <p className="text-sm text-gray-500 mt-1">Add and manage fleet contractors for this municipality</p>
        </div>
        
        <div className="flex items-center gap-3">
           <Link
             href="/pmc-admin/devices"
             className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
           >
             <Server className="w-4 h-4 text-blue-600" />
             Manage Devices
           </Link>
           <button
             onClick={() => setIsModalOpen(true)}
             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
           >
             <Plus className="w-4 h-4" />
             Add Contractor
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Contractors" value={contractors.length.toString()} trend="Registered" trendUp={true} />
        <StatCard 
          title="Total Funds Dispersed" 
          value={`₹${contractors.reduce((acc: number, cur: Contractor) => acc + (cur.walletBalance || 0), 0).toLocaleString()}`} 
          trend="Total in Wallets" trendUp={true} 
        />
        <StatCard title="Active Networks" value="Online" trend="Status" trendUp={true} />
        <StatCard title="System Alerts" value="0" trend="All clear" trendUp={false} />
      </div>

      <div className="minimal-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
           <h2 className="font-semibold text-gray-900 text-sm">Registered Contractors</h2>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64"
              />
           </div>
        </div>
        
        <div className="overflow-x-auto bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="px-6 py-3 font-medium">Contractor Name</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Wallet Limit</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4 h-14 bg-gray-50/50" />
                  </tr>
                ))
              ) : filteredContractors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    No contractors found.
                  </td>
                </tr>
              ) : (
                filteredContractors.map((contractor: Contractor) => (
                  <tr key={contractor._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                           <Briefcase className="w-4 h-4" />
                         </div>
                         <p className="text-sm font-medium text-gray-900">{contractor.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                       {contractor.mobile}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        contractor.status === 'ACTIVE' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${contractor.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {contractor.status === 'ACTIVE' ? 'Active' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                       <span className="text-sm font-semibold text-gray-900 flex items-center justify-end">
                         <IndianRupee className="w-3.5 h-3.5" />
                         {(contractor.walletBalance || 0).toLocaleString()}
                       </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CreateContractorModal onClose={() => setIsModalOpen(false)} onRefresh={() => queryClient.invalidateQueries({ queryKey: ['contractors'] })} />
      )}
    </div>
  );
}

function StatCard({ title, value, trend, trendUp }: { title: string, value: string, trend: string, trendUp: boolean }) {
  return (
    <div className="minimal-card p-5 flex flex-col gap-2">
       <p className="text-sm font-medium text-gray-500">{title}</p>
       <div className="flex items-end justify-between">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-green-600' : 'text-gray-500'}`}>
             {trendUp && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
             {trend}
          </div>
       </div>
    </div>
  );
}

function CreateContractorModal({ onClose, onRefresh }: { onClose: () => void, onRefresh: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/pmc/contractor', {
        name: data.name,
        mobile: data.mobile,
        password: data.password,
      });
    },
    onSuccess: () => {
      toast.success('Contractor successfully registered');
      onRefresh();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to add contractor');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[500px] rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Register Contractor</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
             <MoreHorizontal className="w-5 h-5 rotate-45 transform" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="create-contractor-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase">Agency / Contractor Name</label>
              <input 
                required 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full" 
                placeholder="Ramesh Transporters" 
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase">Registered Mobile Number</label>
              <input 
                required 
                type="tel" 
                value={formData.mobile}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                className="px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="+91"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase">Initial Login Password</label>
              <input 
                required 
                type="text" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
          </form>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            form="create-contractor-form" 
            type="submit" 
            disabled={mutation.isPending} 
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-70"
          >
            {mutation.isPending ? 'Saving...' : 'Add Contractor'}
          </button>
        </div>
      </div>
    </div>
  );
}
