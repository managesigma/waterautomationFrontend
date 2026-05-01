'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Package, Clock, ArrowLeft, Filter, ChevronDown, Droplets, MapPin } from 'lucide-react';
import Link from 'next/link';

interface Order {
  _id: string;
  contractorId: string;
  truckId?: { truckName: string; truckNumber: string; capacity: number } | string;
  driverName?: string;
  driverMobile?: string;
  liters: number;
  ratePerLiter: number;
  amountReserved: number;
  finalAmount?: number;
  status: string;
  poleId?: string;
  executionToken: string;
  expiresAt: string;
  completedAt?: string;
  createdAt: string;
}

const ALL_STATUSES = [
  'ALL', 'PENDING', 'WALLET_RESERVED', 'TOKEN_SENT', 'READY_FOR_EXECUTION',
  'DISPENSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED',
];

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  WALLET_RESERVED: 'bg-blue-50 text-blue-700 border-blue-200',
  TOKEN_SENT: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  READY_FOR_EXECUTION: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  DISPENSING: 'bg-purple-50 text-purple-700 border-purple-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  FAILED: 'bg-red-50 text-red-700 border-red-200',
  CANCELLED: 'bg-gray-50 text-gray-600 border-gray-200',
  EXPIRED: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: ordersRes, isLoading } = useQuery({
    queryKey: ['all-orders', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const res = await api.get<any>(`/orders${params}`);
      return res;
    },
  });

  const orders: Order[] = ordersRes?.data || [];

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/contractor" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">All Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="minimal-card overflow-hidden">
        <div className="overflow-x-auto bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Driver</th>
                <th className="px-6 py-3 font-medium">Truck</th>
                <th className="px-6 py-3 font-medium">Volume</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-4 h-14 bg-gray-50/50" />
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-10 h-10 text-gray-300" />
                      <p className="text-sm text-gray-500">No orders found{statusFilter !== 'ALL' ? ` with status "${statusFilter.replace(/_/g, ' ')}"` : ''}.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <span className="font-semibold text-gray-900 text-sm">#{order._id.slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-sm font-medium text-gray-900">{order.driverName || '—'}</div>
                      <div className="text-xs text-gray-400">{order.driverMobile || ''}</div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {typeof order.truckId === 'object' && order.truckId ? order.truckId.truckNumber : '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs border border-blue-100">
                        {order.liters.toLocaleString()} L
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div className="font-medium text-gray-900">₹{(order.finalAmount ?? order.amountReserved).toLocaleString()}</div>
                      <div className="text-[10px] text-gray-400">@ ₹{order.ratePerLiter}/L</div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusColors[order.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
