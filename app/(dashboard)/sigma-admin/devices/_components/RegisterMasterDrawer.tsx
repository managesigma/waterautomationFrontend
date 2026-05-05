'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { deviceService } from '@/lib/services/deviceService';
import Drawer, { FormLabel, FormSection, inputCls } from '@/components/ui/Drawer';

interface PMC {
  _id: string;
  name: string;
}

const EMPTY_FORM = {
  pmcId: '',
  masterName: '',
  masterId: '',
  ipAddress: '',
  firmwareVersion: 'v1.0.0',
  stationId: '',
};

export default function RegisterMasterDrawer({
  open,
  pmcs,
  onClose,
  onRefresh,
}: {
  open: boolean;
  pmcs: PMC[];
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  const mutation = useMutation({
    mutationFn: (data: typeof EMPTY_FORM) => deviceService.registerMaster(data),
    onSuccess: () => {
      toast.success('Master device registered');
      onRefresh();
      setFormData(EMPTY_FORM);
      onClose();
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || 'Failed to register master');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Register Master Controller"
      subtitle="Provision a new master unit for a city's network."
      icon={<HubOutlinedIcon sx={{ fontSize: 20 }} />}
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold text-ink-secondary hover:bg-base border border-edge-light rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            form="register-master-form"
            type="submit"
            disabled={mutation.isPending}
            className="h-9 px-4 text-xs font-semibold bg-brand hover:bg-brand-hover text-white rounded-md transition-all active:scale-[0.98] disabled:opacity-70 inline-flex items-center gap-1.5"
          >
            {mutation.isPending ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Registering…
              </>
            ) : (
              <>
                <AddRoundedIcon sx={{ fontSize: 14 }} />
                Register Master
              </>
            )}
          </button>
        </>
      }
    >
      <form id="register-master-form" onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-7">
        <FormSection title="Assignment" subtitle="The PMC this master will operate under.">
          <div className="flex flex-col gap-1.5">
            <FormLabel required>PMC</FormLabel>
            <select
              required
              value={formData.pmcId}
              onChange={(e) => setFormData({ ...formData, pmcId: e.target.value })}
              className={inputCls}
            >
              <option value="">Select a PMC…</option>
              {pmcs.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </FormSection>

        <FormSection title="Hardware" subtitle="Identifiers reported by the device firmware.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <FormLabel required>Master Name</FormLabel>
              <input
                required
                type="text"
                value={formData.masterName}
                onChange={(e) => setFormData({ ...formData, masterName: e.target.value })}
                className={inputCls}
                placeholder="Reservoir Control Unit 01"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FormLabel required>Master ID</FormLabel>
              <input
                required
                type="text"
                value={formData.masterId}
                onChange={(e) =>
                  setFormData({ ...formData, masterId: e.target.value.toUpperCase() })
                }
                className={`${inputCls} font-mono uppercase tracking-wider`}
                placeholder="MASTER_001"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FormLabel required>Station ID</FormLabel>
              <input
                required
                type="text"
                value={formData.stationId}
                onChange={(e) =>
                  setFormData({ ...formData, stationId: e.target.value.toUpperCase() })
                }
                className={`${inputCls} font-mono uppercase tracking-wider`}
                placeholder="STATION_MAIN_01"
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Network" subtitle="Connectivity and firmware details.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FormLabel required>IP Address</FormLabel>
              <input
                required
                type="text"
                value={formData.ipAddress}
                onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                className={`${inputCls} font-mono`}
                placeholder="192.168.1.10"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FormLabel required>Firmware Version</FormLabel>
              <input
                required
                type="text"
                value={formData.firmwareVersion}
                onChange={(e) => setFormData({ ...formData, firmwareVersion: e.target.value })}
                className={`${inputCls} font-mono`}
                placeholder="v2.1.0"
              />
            </div>
          </div>
        </FormSection>
      </form>
    </Drawer>
  );
}
