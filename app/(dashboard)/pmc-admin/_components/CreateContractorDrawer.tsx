'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import Drawer, { FormLabel, inputCls, FormSection } from '@/components/ui/Drawer';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';

const EMPTY_FORM = {
  name: '',
  mobile: '',
  password: '',
};

type FormData = typeof EMPTY_FORM;

function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function CreateContractorDrawer({
  open,
  onClose,
  onRefresh,
}: {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      api.post('/pmc/contractor', {
        name: data.name.trim(),
        mobile: data.mobile.trim(),
        password: data.password,
      }),
    onSuccess: () => {
      toast.success('Contractor successfully registered');
      onRefresh();
      setFormData(EMPTY_FORM);
      onClose();
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || 'Failed to add contractor');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleClose = () => {
    if (mutation.isPending) return;
    setFormData(EMPTY_FORM);
    setShowPassword(false);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      size="md"
      icon={<EngineeringOutlinedIcon sx={{ fontSize: 20 }} />}
      title="Register Contractor"
      subtitle="Onboard a fleet contractor and create their login credentials."
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={mutation.isPending}
            className="h-9 px-4 text-xs font-semibold text-ink-secondary hover:bg-base border border-edge-light rounded-md transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            form="create-contractor-form"
            type="submit"
            disabled={mutation.isPending}
            className="h-9 px-4 text-xs font-semibold bg-brand hover:bg-brand-hover text-white rounded-md transition-all active:scale-[0.98] disabled:opacity-70 inline-flex items-center gap-1.5"
          >
            {mutation.isPending ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <PersonAddAltRoundedIcon sx={{ fontSize: 14 }} />
                Register Contractor
              </>
            )}
          </button>
        </>
      }
    >
      <div className="px-5 py-5">
        <form id="create-contractor-form" onSubmit={handleSubmit} className="flex flex-col gap-7">
          <FormSection title="Contractor Details" subtitle="Identity of the agency operating the fleet.">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col gap-1.5">
                <FormLabel required>Agency / Contractor Name</FormLabel>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputCls}
                  placeholder="Ramesh Transporters"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <FormLabel required>Registered Mobile Number</FormLabel>
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className={`${inputCls} font-mono tracking-wide`}
                  placeholder="+91 98765 43210"
                />
                <p className="text-[10px] text-ink-muted leading-snug">
                  This number is used by the contractor to log in to their dashboard.
                </p>
              </div>
            </div>
          </FormSection>

          <FormSection title="Login Credentials" subtitle="Initial password — share securely with the contractor.">
            <div className="flex flex-col gap-1.5">
              <FormLabel required>Initial Password</FormLabel>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`${inputCls} font-mono pr-20`}
                  placeholder="Strong password"
                  autoComplete="new-password"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="p-1.5 text-ink-muted hover:text-ink rounded transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, password: generatePassword() });
                      setShowPassword(true);
                    }}
                    className="p-1.5 text-ink-muted hover:text-brand rounded transition-colors"
                    title="Generate password"
                  >
                    <LockResetRoundedIcon sx={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-ink-muted leading-snug">
                Contractor will be prompted to change this on first login.
              </p>
            </div>
          </FormSection>
        </form>
      </div>
    </Drawer>
  );
}
