'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';

interface TruckSearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function TruckSearchModal({ open, onClose }: TruckSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedNumber, setSearchedNumber] = useState('');

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['truck-search', searchedNumber],
    queryFn: async () => api.get<any>(`/admin/trucks/search/${searchedNumber}`),
    enabled: !!searchedNumber,
    retry: false,
  });

  const truck = response?.data;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchedNumber(searchQuery.trim());
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-surface border border-edge-light rounded-xl shadow-2xl z-50 animate-fade-up overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-edge-light bg-base/50">
          <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
            <SearchRoundedIcon sx={{ fontSize: 18 }} className="text-brand" />
            Global Truck Search
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-ink-muted hover:text-ink hover:bg-base rounded transition-colors"
          >
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        <div className="p-4 border-b border-edge-light bg-surface">
          <form onSubmit={handleSearch} className="relative">
            <SearchRoundedIcon sx={{ fontSize: 20 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-disabled" />
            <input
              type="text"
              autoFocus
              placeholder="Enter truck number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-24 border border-edge-light rounded-lg text-sm text-ink bg-base focus:outline-none focus:border-brand focus:ring-2 focus:ring-blue-600/10 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 bg-brand text-white text-xs font-semibold rounded-md hover:bg-brand-hover transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-base">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-ink-muted">
              <span className="w-5 h-5 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-danger">
              <LocalShippingOutlinedIcon sx={{ fontSize: 32 }} className="opacity-50" />
              <span className="text-sm font-medium">Truck not found.</span>
              <span className="text-xs opacity-70">Check the truck number and try again.</span>
            </div>
          )}

          {!isLoading && !isError && truck && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="flex items-center gap-4 p-4 bg-surface border border-edge-light rounded-lg">
                <div className="w-12 h-12 rounded-full bg-brand-subtle flex items-center justify-center text-brand">
                  <LocalShippingOutlinedIcon sx={{ fontSize: 24 }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">{truck.truckNumber}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium text-ink-secondary">{truck.truckName}</span>
                    <span className="w-1 h-1 rounded-full bg-edge-light" />
                    <span className="text-xs font-medium text-ink-secondary">{truck.capacity}L Capacity</span>
                    <span className="w-1 h-1 rounded-full bg-edge-light" />
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${truck.status === 'ACTIVE' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                      {truck.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface border border-edge-light rounded-lg flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-ink-muted mb-1">
                    <LocationCityOutlinedIcon sx={{ fontSize: 16 }} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Corporation</span>
                  </div>
                  <p className="text-sm font-bold text-ink">{truck.contractorId?.pmcId?.name}</p>
                  <p className="text-[11px] text-ink-secondary">{truck.contractorId?.pmcId?.city}, {truck.contractorId?.pmcId?.state}</p>
                </div>
                
                <div className="p-4 bg-surface border border-edge-light rounded-lg flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-ink-muted mb-1">
                    <BusinessRoundedIcon sx={{ fontSize: 16 }} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Contractor</span>
                  </div>
                  <p className="text-sm font-bold text-ink">{truck.contractorId?.name}</p>
                  <p className="text-[11px] text-ink-secondary">{truck.contractorId?.mobile}</p>
                </div>

                <div className="p-4 bg-surface border border-edge-light rounded-lg flex flex-col gap-1 col-span-2">
                  <div className="flex items-center gap-1.5 text-ink-muted mb-1">
                    <PersonOutlineRoundedIcon sx={{ fontSize: 16 }} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Assigned Driver</span>
                  </div>
                  {truck.driverId ? (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-ink">{truck.driverId.name}</p>
                        <p className="text-[11px] text-ink-secondary">{truck.driverId.mobile} • {truck.driverId.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-ink-secondary">No driver currently assigned.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!isLoading && !isError && !truck && searchedNumber && (
            <p>Error displaying truck details.</p>
          )}
        </div>
      </div>
    </>
  );
}
