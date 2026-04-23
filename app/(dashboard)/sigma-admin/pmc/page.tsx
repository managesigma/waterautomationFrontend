'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Building2, Server, Cloud, MoreHorizontal, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface PMC {
  _id: string;
  name: string;
  code: string;
  deploymentType: 'SAAS' | 'ON_PREM';
  status: string;
  createdAt: string;
}

export default function PmcManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch all PMCs
  const { data: response, isLoading } = useQuery({
    queryKey: ['pmcs'],
    queryFn: async () => {
      const res = await api.get<any>('/admin/pmc');
      return res;
    },
  });

  const pmcs = response?.data || [];

  // Filter based on search
  const filteredPMCs = pmcs.filter((pmc: PMC) => 
    pmc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    pmc.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto animate-in fade-in duration-300">
      
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">PMC Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all registered PMCs (Cities) and their admins</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="p-2 border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
           </button>
           <button
             onClick={() => setIsModalOpen(true)}
             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
           >
             <Plus className="w-4 h-4" />
             Add PMC
           </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="minimal-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
           <h2 className="font-semibold text-gray-900 text-sm">All PMCs</h2>
           
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search PMCs..."
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
                <th className="px-6 py-3 font-medium">PMC Name</th>
                <th className="px-6 py-3 font-medium">Code</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
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
              ) : filteredPMCs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    No PMCs found. Click "Add PMC" to create one.
                  </td>
                </tr>
              ) : (
                filteredPMCs.map((pmc: PMC) => (
                  <tr key={pmc._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                           <Building2 className="w-4 h-4" />
                         </div>
                         <div>
                            <p className="text-sm font-medium text-gray-900">{pmc.name}</p>
                            <p className="text-xs text-gray-500">Joined {new Date(pmc.createdAt).toLocaleDateString()}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                       {pmc.code}
                    </td>
                    <td className="px-6 py-3">
                        {pmc.deploymentType === 'SAAS' ? (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                             <Cloud className="w-3.5 h-3.5 text-gray-400" />
                             Cloud
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                             <Server className="w-3.5 h-3.5 text-gray-400" />
                             Local Setup
                          </div>
                        )}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        pmc.status === 'ACTIVE' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${pmc.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {pmc.status === 'ACTIVE' ? 'Active' : 'Inactive'}
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
        <CreatePmcModal onClose={() => setIsModalOpen(false)} onRefresh={() => queryClient.invalidateQueries({ queryKey: ['pmcs'] })} />
      )}
    </div>
  );
}

function CreatePmcModal({ onClose, onRefresh }: { onClose: () => void, onRefresh: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    deploymentType: 'SAAS',
    apiBaseUrl: '',
    adminName: '',
    adminMobile: '',
    adminPassword: '',
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/admin/pmc', {
        name: data.name,
        code: data.code,
        deploymentType: data.deploymentType,
        apiBaseUrl: data.apiBaseUrl || undefined,
        paymentConfig: {
          gateway: 'CASHFREE', // using a default since it's just basic CRUD context for now
          credentials: { appId: 'TEST', secretKey: 'TEST' }
        },
        admin: {
          name: data.adminName,
          mobile: data.adminMobile,
          password: data.adminPassword,
        }
      });
    },
    onSuccess: () => {
      toast.success('PMC successfully added');
      onRefresh();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to add PMC');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[600px] rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Add New PMC</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
             <MoreHorizontal className="w-5 h-5 rotate-45 transform" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="create-pmc-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-600 uppercase">PMC Name (City)</label>
                <input 
                  required 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full" 
                  placeholder="Pune Municipal Corporation" 
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase">PMC Code</label>
                <input 
                  required 
                  type="text" 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 uppercase" 
                  placeholder="PMC-PUNE" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase">Setup Type</label>
                <select 
                  value={formData.deploymentType}
                  onChange={(e) => setFormData({...formData, deploymentType: e.target.value})}
                  className="px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="SAAS">Cloud</option>
                  <option value="ON_PREM">Local Setup</option>
                </select>
              </div>

              {formData.deploymentType === 'ON_PREM' && (
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Local Server URL</label>
                  <input 
                    required={formData.deploymentType === 'ON_PREM'}
                    type="url" 
                    value={formData.apiBaseUrl}
                    onChange={(e) => setFormData({...formData, apiBaseUrl: e.target.value})}
                    className="px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full" 
                    placeholder="https://api.pmc.local/v1" 
                  />
                </div>
              )}
            </div>
            
            <hr className="border-gray-100 my-1" />
            
            <div>
               <h3 className="text-sm font-semibold text-gray-900 mb-4">PMC Admin Details</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Admin Name</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.adminName}
                      onChange={(e) => setFormData({...formData, adminName: e.target.value})}
                      className="px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Mobile Number</label>
                    <input 
                      required 
                      type="tel" 
                      value={formData.adminMobile}
                      onChange={(e) => setFormData({...formData, adminMobile: e.target.value})}
                      className="px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="+91"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Login Password</label>
                    <input 
                      required 
                      type="password" 
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
                      className="px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
               </div>
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
            form="create-pmc-form" 
            type="submit" 
            disabled={mutation.isPending} 
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-70"
          >
            {mutation.isPending ? 'Saving...' : 'Add PMC'}
          </button>
        </div>
      </div>
    </div>
  );
}
