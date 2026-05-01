'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Droplets, 
  Send, 
  RefreshCw, 
  CreditCard, 
  Plus, 
  Clock, 
  ArrowRight, 
  Truck, 
  Package,
  ExternalLink,
  Search,
  Filter,
  X,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import clsx from 'clsx';

interface Order {
  _id: string;
  amountReserved: number;
  liters: number;
  ratePerLiter: number;
  status: string;
  executionToken: string;
  driverName?: string;
  driverMobile?: string;
  truckId?: { truckName: string; truckNumber: string; capacity: number } | string;
  createdAt: string;
}

interface TruckOption {
  _id: string;
  truckName: string;
  truckNumber: string;
  capacity: number;
  status: string;
}

interface WalletData {
  walletBalance: number;
  walletReserved: number;
  availableBalance: number;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-600 border-amber-200/50',
  WALLET_RESERVED: 'bg-blue-50 text-blue-600 border-blue-200/50',
  TOKEN_SENT: 'bg-indigo-50 text-indigo-600 border-indigo-200/50',
  READY_FOR_EXECUTION: 'bg-cyan-50 text-cyan-600 border-cyan-200/50',
  DISPENSING: 'bg-purple-50 text-purple-600 border-purple-200/50',
  COMPLETED: 'bg-success-subtle text-success border-success/20',
  FAILED: 'bg-danger-subtle text-danger border-danger/20',
  CANCELLED: 'bg-gray-50 text-ink-disabled border-edge-light',
  EXPIRED: 'bg-orange-50 text-orange-600 border-orange-200/50',
};

export default function ContractorDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: walletRes } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async () => {
      const res = await api.get<any>('/wallet/balance');
      return res.data as WalletData;
    },
  });

  const { data: ordersRes, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const res = await api.get<any>('/orders');
      return res;
    },
  });

  const recentOrders: Order[] = (ordersRes?.data || []).slice(0, 5);
  const wallet = walletRes;

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto animate-in fade-in duration-500 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Fleet Operations</h1>
          <p className="text-sm text-ink-muted mt-0.5">Real-time tanker dispatch and financial oversight</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button
             onClick={() => setIsModalOpen(true)}
             className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand/20 active:scale-[0.98]"
           >
             <Plus className="w-4 h-4" />
             Issue Filling Token
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Wallet Summary Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-8 border border-edge-light shadow-sm relative overflow-hidden group">
             {/* Decorative Background Icon */}
             <CreditCard className="absolute -right-4 -bottom-4 w-32 h-32 text-brand/5 rotate-12 group-hover:scale-110 transition-transform duration-500" />
             
             <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-brand-subtle text-brand rounded-2xl flex items-center justify-center shadow-inner">
                   <CreditCard className="w-6 h-6" />
                </div>
                <Link href="/contractor/wallet" className="p-2 hover:bg-surface rounded-xl transition-all">
                   <ExternalLink className="w-4 h-4 text-ink-disabled" />
                </Link>
             </div>

             <p className="text-xs font-bold text-ink-muted uppercase tracking-[0.2em] mb-2">Total Balance</p>
             <h2 className="text-4xl font-bold text-ink mb-8 tracking-tight">₹{(wallet?.walletBalance || 0).toLocaleString()}</h2>

             <div className="grid grid-cols-2 gap-4 pt-6 border-t border-edge-light">
                <div>
                   <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-widest mb-1">Available</p>
                   <p className="text-lg font-bold text-success leading-none">₹{(wallet?.availableBalance || 0).toLocaleString()}</p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-widest mb-1">Reserved</p>
                   <p className="text-lg font-bold text-danger leading-none">₹{(wallet?.walletReserved || 0).toLocaleString()}</p>
                </div>
             </div>
             
             <Link 
               href="/contractor/wallet" 
               className="mt-8 w-full py-3.5 bg-surface hover:bg-white border border-edge-light rounded-2xl text-sm font-bold text-ink transition-all flex justify-center items-center gap-2 hover:border-brand/30 shadow-sm active:scale-[0.99]"
             >
               <RefreshCw className="w-4 h-4 text-brand" />
               Recharge Wallet
             </Link>
          </div>
        </div>
        
        {/* Recent Orders Table (Ref image 2) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-edge-light shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-edge-light bg-surface/30 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                   <Clock className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-ink tracking-tight">Recent Dispatches</h2>
             </div>
             <Link href="/contractor/orders" className="text-xs font-bold text-brand hover:bg-brand-subtle px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 uppercase tracking-widest">
               All History <ArrowRight className="w-3.5 h-3.5" />
             </Link>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-700 to-blue-600 text-white text-[11px] font-bold uppercase tracking-[0.1em]">
                  <th className="px-6 py-4">Ref ID</th>
                  <th className="px-6 py-4">Driver / Tanker</th>
                  <th className="px-6 py-4">Volume</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge-light">
                {isOrdersLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-5 h-16 bg-white" />
                    </tr>
                  ))
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-sm font-bold text-ink-muted">
                      No recent dispatches found. Start by issuing a token.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-ink-secondary text-xs uppercase tracking-tight">#{order._id.slice(-6)}</span>
                        <div className="text-[10px] text-ink-disabled font-bold mt-1 flex items-center gap-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="font-semibold text-ink text-sm">{order.driverName || order.driverMobile || 'Unknown'}</div>
                         <div className="text-xs text-ink-muted">
                           {typeof order.truckId === 'object' && order.truckId ? order.truckId.truckNumber : 'No Truck'}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            <span className="font-bold text-brand text-sm">
                               {order.liters.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-ink-disabled uppercase">Liters</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={clsx(
                           "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tight",
                           statusColors[order.status] || 'bg-gray-50 text-ink-disabled border-edge-light'
                        )}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-surface/30 border-t border-edge-light text-center">
             <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-[0.2em]">Live Synchronization Enabled</p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <CreateOrderModal onClose={() => setIsModalOpen(false)} onRefresh={() => queryClient.invalidateQueries({ queryKey: ['recent-orders', 'wallet-balance'] })} />
      )}
    </div>
  );
}

function CreateOrderModal({ onClose, onRefresh }: { onClose: () => void, onRefresh: () => void }) {
  const [formData, setFormData] = useState({
    truckId: '',
    driverName: '',
    driverMobile: '',
    liters: 5000,
  });

  // Fetch trucks for selection
  const { data: trucksRes } = useQuery({
    queryKey: ['contractor-trucks'],
    queryFn: async () => {
      const res = await api.get<any>('/truck');
      return res;
    },
  });

  const trucks: TruckOption[] = (trucksRes?.data || []).filter((t: TruckOption) => t.status === 'ACTIVE');

  const selectedTruck = trucks.find(t => t._id === formData.truckId);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return api.post('/orders/create', data);
    },
    onSuccess: () => {
      toast.success('Order dispatched successfully! SMS sent to driver.');
      onRefresh();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to dispatch order');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.truckId) {
      toast.error('Please select a truck');
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[500px] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        <div className="px-10 py-6 border-b border-edge-light flex justify-between items-center bg-surface/30">
          <h2 className="text-2xl font-bold text-ink flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-500/20">
               <Droplets className="w-5 h-5" />
            </div>
            Issue Token
          </h2>
          <button onClick={onClose} className="p-2 text-ink-muted hover:text-ink hover:bg-surface rounded-full transition-all">
             <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="px-10 py-8 overflow-y-auto">
          <form id="create-order-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Truck Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-[0.1em] ml-1">Select Tanker</label>
              <select 
                required
                value={formData.truckId}
                onChange={(e) => setFormData({...formData, truckId: e.target.value})}
                className="w-full px-4 py-4 bg-surface/50 border border-edge-light rounded-2xl text-ink text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Choose available truck --</option>
                {trucks.map(truck => (
                  <option key={truck._id} value={truck._id}>
                    {truck.truckNumber} — {truck.truckName} ({truck.capacity.toLocaleString()}L)
                  </option>
                ))}
              </select>
              {trucks.length === 0 && (
                <p className="text-[10px] text-amber-600 font-bold ml-1 uppercase tracking-wider">No active tankers found</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-5">
               <div className="space-y-2">
                 <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-[0.1em] ml-1">Driver Name</label>
                 <input 
                   required 
                   type="text" 
                   value={formData.driverName}
                   onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                   className="w-full px-4 py-4 bg-surface/50 border border-edge-light rounded-2xl text-ink text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all" 
                   placeholder="Ramesh Kumar" 
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-[0.1em] ml-1">Driver Mobile</label>
                 <input 
                   required 
                   type="tel" 
                   value={formData.driverMobile}
                   onChange={(e) => setFormData({...formData, driverMobile: e.target.value})}
                   className="w-full px-4 py-4 bg-surface/50 border border-edge-light rounded-2xl text-ink text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all font-mono" 
                   placeholder="9876543210" 
                 />
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-[0.1em] ml-1">
                Volume (Liters)
                {selectedTruck && <span className="text-ink-disabled normal-case ml-2 font-medium">Cap: {selectedTruck.capacity.toLocaleString()}L</span>}
              </label>
              <div className="relative">
                 <input 
                   required 
                   type="number" 
                   min="100"
                   max={selectedTruck?.capacity}
                   value={formData.liters}
                   onChange={(e) => setFormData({...formData, liters: Number(e.target.value)})}
                   className="w-full px-4 py-4 bg-surface/50 border border-edge-light rounded-2xl text-ink text-xl font-extrabold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all" 
                 />
                 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-disabled uppercase tracking-widest">Liters</span>
              </div>
            </div>
            
            <div className="bg-blue-50/50 border border-blue-100/50 p-5 rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                 <AlertTriangle className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-blue-800/80 font-bold leading-relaxed uppercase tracking-tight">
                FUNDS WILL BE AUTOMATICALLY RESERVED UPON TOKEN ISSUANCE. DRIVER WILL RECEIVE AN EXECUTION LINK VIA SMS.
              </p>
            </div>
          </form>
        </div>
        
        <div className="px-10 py-8 bg-surface/30 border-t border-edge-light flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-3 text-sm font-bold text-ink-secondary hover:bg-white rounded-xl transition-all"
          >
            Discard
          </button>
          <button 
            form="create-order-form" 
            type="submit" 
            disabled={mutation.isPending} 
            className="flex items-center gap-2 px-8 py-3 text-sm font-bold bg-brand hover:bg-brand-hover text-white rounded-xl transition-all shadow-xl shadow-brand/20 active:scale-[0.98] disabled:opacity-70"
          >
            {mutation.isPending ? 'Processing...' : 'Authorize Dispatch'}
            {!mutation.isPending && <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
