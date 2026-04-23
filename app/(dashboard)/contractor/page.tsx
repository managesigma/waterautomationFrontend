'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Droplets, Send, RefreshCw, CreditCard, Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  _id: string;
  amountReserved: number;
  liters: number;
  status: string;
  executionToken: string;
  driverMobile?: string;
  driverId?: { name: string; mobile: string };
  truckId?: { registrationNumber: string };
  createdAt: string;
}

export default function ContractorDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: wallet } = useQuery({
    queryKey: ['contractor-wallet'],
    queryFn: async () => {
      // Replaced mock data with an actual API call expectation.
      // Expected backend to return { data: { balance: number, reserved: number } }
      const res = await api.get<any>('/contractor/wallet');
      return res.data;
    },
  });

  const { data: response, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const res = await api.get<any>('/contractor/orders');
      return res;
    },
  });

  const recentOrders = response?.data || [];

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Fleet Operations</h1>
          <p className="text-sm text-gray-500 mt-1">Manage active orders and dispatch trucks securely</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button
             onClick={() => setIsModalOpen(true)}
             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
           >
             <Plus className="w-4 h-4" />
             Issue Filling Token
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Component */}
        <div className="minimal-card p-5 md:col-span-1 flex flex-col gap-4">
           <p className="text-sm font-medium text-gray-500 flex items-center justify-between">
              Wallet Balance
              <CreditCard className="w-4 h-4 text-gray-400" />
           </p>
           <div>
              <p className="text-3xl font-bold text-gray-900">₹{(wallet?.balance || 0).toLocaleString()}</p>
              <p className="text-xs font-medium text-gray-500 mt-2 flex items-center justify-between">
                 Reserved for Orders: 
                 <span className="text-red-500">-₹{(wallet?.reserved || 0).toLocaleString()}</span>
              </p>
           </div>
           <button className="mt-auto w-full py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex justify-center items-center gap-1.5">
             <RefreshCw className="w-3.5 h-3.5" />
             Recharge
           </button>
        </div>
        
        <div className="minimal-card md:col-span-2 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
             <h2 className="font-semibold text-gray-900 text-sm">Recent Dispatches</h2>
          </div>
          
          <div className="overflow-x-auto bg-white flex-1 p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                  <th className="px-6 py-3 font-medium">Order ID</th>
                  <th className="px-6 py-3 font-medium">Driver / Truck</th>
                  <th className="px-6 py-3 font-medium">Volume Limit</th>
                  <th className="px-6 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isOrdersLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-4 h-14 bg-gray-50/50" />
                    </tr>
                  ))
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                      No recent dispatches found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order: Order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <span className="font-semibold text-gray-900 text-sm">#{order._id.slice(-6).toUpperCase()}</span>
                        <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                         <div className="font-medium text-gray-900">{order.driverMobile || order.driverId?.name || 'Unknown'}</div>
                         <div className="text-xs text-gray-400">{order.truckId?.registrationNumber || 'No Truck Assigned'}</div>
                      </td>
                      <td className="px-6 py-3">
                         <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs border border-blue-100">
                            {order.liters.toLocaleString()} L
                         </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          order.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border border-green-200' : 
                          order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                          'bg-gray-50 text-gray-700 border border-gray-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <CreateOrderModal onClose={() => setIsModalOpen(false)} onRefresh={() => queryClient.invalidateQueries({ queryKey: ['recent-orders'] })} />
      )}
    </div>
  );
}

function CreateOrderModal({ onClose, onRefresh }: { onClose: () => void, onRefresh: () => void }) {
  const [formData, setFormData] = useState({
    driverMobile: '',
    truckRegistration: '',
    liters: 5000,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/contractor/orders', data);
    },
    onSuccess: () => {
      toast.success('Order Dispatched successfully');
      onRefresh();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to dispatch order');
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
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <div className="bg-blue-100 text-blue-600 p-1.5 rounded-md">
               <Droplets className="w-4 h-4" />
            </div>
            Issue Token
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
             <Plus className="w-5 h-5 rotate-45 transform" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="create-order-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase">Driver Mobile</label>
              <input 
                required 
                type="tel" 
                value={formData.driverMobile}
                onChange={(e) => setFormData({...formData, driverMobile: e.target.value})}
                className="px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full" 
                placeholder="+91" 
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase">Truck Registration</label>
              <input 
                required 
                type="text" 
                value={formData.truckRegistration}
                onChange={(e) => setFormData({...formData, truckRegistration: e.target.value})}
                className="px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 uppercase" 
                placeholder="MH12 AB 1234"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase">Sanctioned Volume (Liters)</label>
              <input 
                required 
                type="number" 
                min="100"
                value={formData.liters}
                onChange={(e) => setFormData({...formData, liters: Number(e.target.value)})}
                className="px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-md flex items-start gap-2 mt-2">
              <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
                Issuing this token will automatically reserve an estimated equivalent sum from your wallet balance until the driver completes fulfillment. 
              </p>
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
            form="create-order-form" 
            type="submit" 
            disabled={mutation.isPending} 
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-70"
          >
            {mutation.isPending ? 'Sending...' : 'Authorize & Dispatch'}
            {!mutation.isPending && <Send className="w-4 h-4 ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
