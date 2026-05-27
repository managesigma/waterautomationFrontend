'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { SvgIconProps } from '@mui/material/SvgIcon';

export default function TrucksManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterContractorId, setFilterContractorId] = useState('');
  const [sortByCap, setSortByCap] = useState<'asc'|'desc'|''>('');

  const { data: trucksResponse, isLoading } = useQuery({
    queryKey: ['admin-trucks', filterState, filterCity, filterContractorId, sortByCap],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterState) params.append('state', filterState);
      if (filterCity) params.append('city', filterCity);
      if (filterContractorId) params.append('contractorId', filterContractorId);
      if (sortByCap) params.append('sortByCap', sortByCap);
      return api.get<any>(`/admin/trucks?${params.toString()}`);
    },
  });

  const { data: contractorsResponse } = useQuery({
    queryKey: ['admin-contractors-count'],
    queryFn: async () => api.get<any>('/admin/contractors'),
  });

  const trucks = trucksResponse?.data || [];
  const contractorsCount = contractorsResponse?.data?.length || 0;

  const filteredTrucks = trucks.filter((truck: any) =>
    truck.truckNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (truck.driverId?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    if (filteredTrucks.length === 0) return;
    const headers = ['Truck Number', 'Capacity', 'Driver Name', 'Driver Phone', 'State', 'City', 'Corporation', 'Contractor'];
    const rows = filteredTrucks.map((t: any) => [
      t.truckNumber,
      t.capacity,
      t.driverId?.name || 'N/A',
      t.driverId?.mobile || 'N/A',
      t.contractorId?.pmcId?.state || 'N/A',
      t.contractorId?.pmcId?.city || 'N/A',
      t.contractorId?.pmcId?.name || 'N/A',
      t.contractorId?.name || 'N/A',
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trucks_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-up">
      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat label="Total Trucks" value={trucks.length} Icon={LocalShippingOutlinedIcon} />
        <MiniStat label="Total Contractors" value={contractorsCount} Icon={BusinessRoundedIcon} accent="success" />
      </div>

      {/* Table */}
      <div className="minimal-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-edge-light">
          <div>
            <h2 className="text-sm font-semibold text-ink">Registered Trucks</h2>
            <p className="text-[10px] text-ink-muted">
              {isLoading ? 'Loading…' : `${filteredTrucks.length} trucks found`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <SearchRoundedIcon sx={{ fontSize: 16 }} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-disabled" />
              <input
                type="text"
                placeholder="Search truck or driver…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 h-8 border border-edge-light rounded-md text-xs text-ink bg-surface placeholder:text-ink-disabled focus:outline-none focus:border-brand focus:ring-2 focus:ring-blue-600/10 transition-all w-full sm:w-48"
              />
            </div>
            
            <input
              type="text"
              placeholder="State Filter"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="px-3 h-8 border border-edge-light rounded-md text-xs text-ink bg-surface placeholder:text-ink-disabled focus:outline-none focus:border-brand transition-all w-28"
            />
            
            <input
              type="text"
              placeholder="City Filter"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="px-3 h-8 border border-edge-light rounded-md text-xs text-ink bg-surface placeholder:text-ink-disabled focus:outline-none focus:border-brand transition-all w-28"
            />
            
            <select
              value={sortByCap}
              onChange={(e) => setSortByCap(e.target.value as any)}
              className="px-2 h-8 border border-edge-light rounded-md text-xs text-ink bg-surface focus:outline-none focus:border-brand transition-all"
            >
              <option value="">Sort Capacity</option>
              <option value="desc">Highest First</option>
              <option value="asc">Lowest First</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 h-8 px-3 bg-base border border-edge-light hover:bg-surface text-ink rounded-md text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
            >
              <FileDownloadOutlinedIcon sx={{ fontSize: 14 }} />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider border-b border-edge-light">
                <th className="px-5 py-2.5">Truck Info</th>
                <th className="px-5 py-2.5">Driver</th>
                <th className="px-5 py-2.5">Location</th>
                <th className="px-5 py-2.5">Corporation</th>
                <th className="px-5 py-2.5">Contractor</th>
                <th className="px-5 py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge-light">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-5 py-3 h-12 bg-base/40" />
                  </tr>
                ))
              ) : filteredTrucks.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      Icon={LocalShippingOutlinedIcon}
                      title="No trucks found"
                      hint="Adjust your filters or search query"
                    />
                  </td>
                </tr>
              ) : (
                filteredTrucks.map((truck: any) => (
                  <tr key={truck._id} className="hover:bg-base/60 transition-colors group">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-base border border-edge-light flex items-center justify-center text-ink-secondary">
                          <LocalShippingOutlinedIcon sx={{ fontSize: 16 }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink">{truck.truckNumber}</p>
                          <p className="text-[10px] text-ink-muted">Cap: {truck.capacity}L</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-2.5">
                      <p className="text-xs text-ink">{truck.driverId?.name || 'Unassigned'}</p>
                      <p className="text-[10px] text-ink-muted">{truck.driverId?.mobile}</p>
                    </td>
                    <td className="px-5 py-2.5">
                      <p className="text-xs text-ink">{truck.contractorId?.pmcId?.city || 'N/A'}</p>
                      <p className="text-[10px] text-ink-muted">{truck.contractorId?.pmcId?.state}</p>
                    </td>
                    <td className="px-5 py-2.5 text-xs text-ink-secondary">
                      {truck.contractorId?.pmcId?.name}
                    </td>
                    <td className="px-5 py-2.5 text-xs text-ink-secondary">
                      {truck.contractorId?.name}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <StatusPill status={truck.status} />
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

function MiniStat({
  label,
  value,
  Icon,
  accent = 'default',
}: {
  label: string;
  value: number;
  Icon: React.ComponentType<SvgIconProps>;
  accent?: 'default' | 'success';
}) {
  return (
    <div className="minimal-card p-3 flex items-center justify-between hover:border-blue-200 transition-colors">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-0.5">{label}</p>
        <p className="text-lg font-bold text-ink tabular-nums tracking-tight leading-none">{value}</p>
      </div>
      <div
        className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
          accent === 'success' ? 'bg-success-subtle text-success' : 'bg-base text-ink-secondary border border-edge-light'
        }`}
      >
        <Icon sx={{ fontSize: 14 }} />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const isActive = status === 'ACTIVE';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${
        isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success' : 'bg-danger'}`} />
      {status}
    </span>
  );
}

function EmptyState({
  Icon,
  title,
  hint,
}: {
  Icon: React.ComponentType<SvgIconProps>;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-14">
      <div className="w-10 h-10 rounded bg-base border border-edge-light flex items-center justify-center text-ink-disabled">
        <Icon sx={{ fontSize: 20 }} />
      </div>
      <p className="text-sm font-medium text-ink-secondary">{title}</p>
      <p className="text-[11px] text-ink-muted">{hint}</p>
    </div>
  );
}
