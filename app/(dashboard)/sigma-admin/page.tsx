'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Building2, Cloud, Server, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PMC {
  _id: string;
  name: string;
  code: string;
  deploymentType: 'SAAS' | 'ON_PREM';
  status: string;
}

export default function SigmaDashboardPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['pmcs-dashboard'],
    queryFn: async () => {
      const res = await api.get<any>('/admin/pmc');
      return res;
    },
  });

  const pmcs = response?.data || [];
  const activeCount = pmcs.filter((p: PMC) => p.status === 'ACTIVE').length;
  // Just show top 5 on dashboard
  const recentPMCs = pmcs.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto animate-in fade-in duration-300">
      
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Platform overview and quick metrics</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Cities (PMCs)" value={pmcs.length.toString()} trend="Total Registered" trendUp={true} />
        <StatCard title="Active Cities" value={activeCount.toString()} trend="Currently Online" trendUp={true} />
        <StatCard title="Platform Issues" value="0" trend="All clear" trendUp={true} />
        <StatCard title="Pending Verifications" value="0" trend="Up to date" trendUp={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Recent PMCs Widget */}
         <div className="minimal-card col-span-2 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
               <h2 className="font-semibold text-gray-900 text-sm">Recently Added PMCs</h2>
               <Link href="/sigma-admin/pmc" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                  View All <ArrowRight className="w-3 h-3" />
               </Link>
            </div>
            
            <div className="overflow-x-auto bg-white flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                    <th className="px-6 py-3 font-medium">PMC Name</th>
                    <th className="px-6 py-3 font-medium">Code</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="px-6 py-4 h-14 bg-gray-50/50" />
                      </tr>
                    ))
                  ) : recentPMCs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                        No PMCs found.
                      </td>
                    </tr>
                  ) : (
                    recentPMCs.map((pmc: PMC) => (
                      <tr key={pmc._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                               <Building2 className="w-4 h-4" />
                             </div>
                             <p className="text-sm font-medium text-gray-900">{pmc.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">{pmc.code}</td>
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
         </div>

         {/* Quick Actions Panel */}
         <div className="minimal-card p-4 flex flex-col gap-4 bg-white">
            <h2 className="font-semibold text-gray-900 text-sm border-b border-gray-100 pb-2">Quick Actions</h2>
            <Link href="/sigma-admin/pmc" className="flex items-center p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group">
               <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                 <Building2 className="w-4 h-4" />
               </div>
               <div className="flex-1">
                 <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">Manage PMCs</p>
                 <p className="text-xs text-gray-500">Add or edit cities</p>
               </div>
               <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
            </Link>

            <Link href="/sigma-admin/devices" className="flex items-center p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
               <div className="w-8 h-8 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                 <Server className="w-4 h-4" />
               </div>
               <div className="flex-1">
                 <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">Manage Devices</p>
                 <p className="text-xs text-gray-500">Register master devices</p>
               </div>
               <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
            </Link>
         </div>
      </div>
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
