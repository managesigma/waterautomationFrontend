'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { deviceService } from '@/lib/services/deviceService';
import Drawer, { FormLabel, FormSection, inputCls } from '@/components/ui/Drawer';

const EMPTY_FORM = {
  slaveDeviceId: '',
  firmwareVersion: 'v1.0.0',
  stationId: '',
  poleId: '',
};

export default function RegisterSlaveDrawer({
  open,
  masterId,
  pmcId,
  masterName,
  onClose,
  onRefresh,
}: {
  open: boolean;
  masterId: string | null;
  pmcId: string | null;
  masterName?: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  const mutation = useMutation({
    mutationFn: (data: typeof EMPTY_FORM) => {
      if (!masterId) throw new Error('No master selected');
      return deviceService.registerSlaves(masterId, {
        ...(pmcId ? { pmcId } : {}),
        slaves: data,
      });
    },
    onSuccess: () => {
      toast.success('Slave device registered');
      onRefresh();
      setFormData(EMPTY_FORM);
      onClose();
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || 'Failed to register slave');
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
      title="Register Slave Sensor"
      subtitle={
        masterName ? `Linked to ${masterName}.` : 'Add a sensor under the selected master.'
      }
      icon={<SensorsOutlinedIcon sx={{ fontSize: 20 }} />}
      size="md"
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
            form="register-slave-form"
            type="submit"
            disabled={mutation.isPending || !masterId}
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
                Register Slave
              </>
            )}
          </button>
        </>
      }
    >
      <form id="register-slave-form" onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-7">
        <FormSection title="Identification" subtitle="Identifiers reported by the slave firmware.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <FormLabel required>Slave Device ID</FormLabel>
              <input
                required
                type="text"
                value={formData.slaveDeviceId}
                onChange={(e) =>
                  setFormData({ ...formData, slaveDeviceId: e.target.value.toUpperCase() })
                }
                className={`${inputCls} font-mono uppercase tracking-wider`}
                placeholder="SLAVE_001"
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
                placeholder="STATION_SLAVE_01"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FormLabel required>Pole ID</FormLabel>
              <input
                required
                type="text"
                value={formData.poleId}
                onChange={(e) =>
                  setFormData({ ...formData, poleId: e.target.value.toUpperCase() })
                }
                className={`${inputCls} font-mono uppercase tracking-wider`}
                placeholder="POLE_A1"
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Firmware">
          <div className="flex flex-col gap-1.5">
            <FormLabel required>Firmware Version</FormLabel>
            <input
              required
              type="text"
              value={formData.firmwareVersion}
              onChange={(e) => setFormData({ ...formData, firmwareVersion: e.target.value })}
              className={`${inputCls} font-mono`}
              placeholder="v1.5.2"
            />
          </div>
        </FormSection>
      </form>
    </Drawer>
  );
}
