'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import api from '@/lib/api';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { toast } from 'sonner';

const EMPTY_FORM = {
  name: '',
  code: '',
  deploymentType: 'SAAS',
  apiBaseUrl: '',
  ratePerLiter: '',
  paymentGateway: 'CASHFREE',
  paymentKeyId: '',
  paymentKeySecret: '',
  paymentWebhookSecret: '',
  paymentIsLive: false,
  adminName: '',
  adminEmail: '',
  adminMobile: '',
  adminPassword: '',
};

type FormData = typeof EMPTY_FORM;

export default function CreatePmcDrawer({
  open,
  onClose,
  onRefresh,
}: {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const hasPaymentCreds = data.paymentKeyId.trim() || data.paymentKeySecret.trim();
      const paymentConfig = hasPaymentCreds
        ? {
            gateway: data.paymentGateway,
            credentials: {
              keyId: data.paymentKeyId,
              keySecret: data.paymentKeySecret,
            },
            ...(data.paymentWebhookSecret ? { webhookSecret: data.paymentWebhookSecret } : {}),
            isLive: data.paymentIsLive,
          }
        : undefined;

      return api.post('/admin/pmc', {
        name: data.name,
        code: data.code,
        deploymentType: data.deploymentType,
        ...(data.apiBaseUrl ? { apiBaseUrl: data.apiBaseUrl } : {}),
        ...(data.ratePerLiter ? { ratePerLiter: Number(data.ratePerLiter) } : {}),
        ...(paymentConfig ? { paymentConfig } : {}),
        admin: {
          ...(data.adminName ? { name: data.adminName } : {}),
          email: data.adminEmail,
          mobile: data.adminMobile,
          password: data.adminPassword,
        },
      });
    },
    onSuccess: () => {
      toast.success('PMC successfully added');
      onRefresh();
      setFormData(EMPTY_FORM);
      onClose();
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || 'Failed to add PMC');
    },
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const inputCls =
    'h-10 px-3 text-sm rounded-md border border-edge-light bg-surface text-ink placeholder:text-ink-disabled focus:outline-none focus:border-brand focus:ring-2 focus:ring-blue-600/10 transition-all w-full';

  return createPortal(
    <div
      className={clsx('fixed inset-0 z-60 overflow-hidden', !open && 'pointer-events-none')}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-pmc-title"
    >
      {/* Backdrop */}
      <div
        className={clsx(
          'absolute inset-0 bg-slate-900/30 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={clsx(
          'absolute inset-y-0 right-0 w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-surface shadow-2xl shadow-slate-900/20 border-l border-edge-light flex flex-col transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-edge-light flex justify-between items-start gap-3 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-md bg-brand-subtle flex items-center justify-center text-brand shrink-0">
              <LocationCityOutlinedIcon sx={{ fontSize: 20 }} />
            </div>
            <div className="min-w-0">
              <h2 id="create-pmc-title" className="text-sm font-semibold text-ink leading-tight">
                Onboard New City
              </h2>
              <p className="text-[11px] text-ink-muted mt-0.5 leading-snug">
                Register a PMC and create its admin account.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink rounded hover:bg-base transition-colors shrink-0"
            aria-label="Close"
          >
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <form id="create-pmc-form" onSubmit={handleSubmit} className="flex flex-col gap-7">
            <Section title="City Details" subtitle="Basic information about the PMC.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label required>City Name</Label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputCls}
                    placeholder="Pune Municipal Corporation"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label required>City Code</Label>
                  <input
                    required
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className={`${inputCls} uppercase font-mono tracking-wider`}
                    placeholder="PMC-PUNE"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label required>Setup Type</Label>
                  <select
                    value={formData.deploymentType}
                    onChange={(e) => setFormData({ ...formData, deploymentType: e.target.value })}
                    className={inputCls}
                  >
                    <option value="SAAS">Cloud</option>
                    <option value="ON_PREM">On-Premise</option>
                  </select>
                </div>
                {formData.deploymentType === 'ON_PREM' && (
                  <div className="flex flex-col gap-1.5 sm:col-span-2 animate-fade-up">
                    <Label optional>Local Server URL</Label>
                    <input
                      type="url"
                      value={formData.apiBaseUrl}
                      onChange={(e) => setFormData({ ...formData, apiBaseUrl: e.target.value })}
                      className={inputCls}
                      placeholder="https://api.pmc.local/v1"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label optional>Rate per Litre (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-disabled pointer-events-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={formData.ratePerLiter}
                      onChange={(e) => setFormData({ ...formData, ratePerLiter: e.target.value })}
                      className={`${inputCls} pl-7 tabular-nums`}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Admin Account" subtitle="Login credentials for the city administrator.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label optional>Admin Name</Label>
                  <input
                    type="text"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    className={inputCls}
                    placeholder="Full name"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label required>Email</Label>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className={inputCls}
                    placeholder="admin@city.gov"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label required>Mobile Number</Label>
                  <input
                    required
                    type="tel"
                    value={formData.adminMobile}
                    onChange={(e) => setFormData({ ...formData, adminMobile: e.target.value })}
                    className={inputCls}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label required>Password</Label>
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    className={inputCls}
                    placeholder="Strong password"
                  />
                </div>
              </div>
            </Section>

            <Collapsible title="Payment Configuration" subtitle="Optional. Add later if you don't have credentials yet.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label optional>Gateway</Label>
                  <select
                    value={formData.paymentGateway}
                    onChange={(e) => setFormData({ ...formData, paymentGateway: e.target.value })}
                    className={inputCls}
                  >
                    <option value="CASHFREE">Cashfree</option>
                    <option value="RAZORPAY">Razorpay</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label optional>Mode</Label>
                  <label className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-edge-light bg-surface text-sm text-ink cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.paymentIsLive}
                      onChange={(e) => setFormData({ ...formData, paymentIsLive: e.target.checked })}
                      className="accent-brand"
                    />
                    <span>{formData.paymentIsLive ? 'Live' : 'Test'}</span>
                  </label>
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label optional>Key ID</Label>
                  <input
                    type="text"
                    value={formData.paymentKeyId}
                    onChange={(e) => setFormData({ ...formData, paymentKeyId: e.target.value })}
                    className={`${inputCls} font-mono`}
                    placeholder="rzp_test_xxx"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label optional>Key Secret</Label>
                  <input
                    type="password"
                    autoComplete="off"
                    value={formData.paymentKeySecret}
                    onChange={(e) => setFormData({ ...formData, paymentKeySecret: e.target.value })}
                    className={`${inputCls} font-mono`}
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label optional>Webhook Secret</Label>
                  <input
                    type="password"
                    autoComplete="off"
                    value={formData.paymentWebhookSecret}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentWebhookSecret: e.target.value })
                    }
                    className={`${inputCls} font-mono`}
                    placeholder="whsec_..."
                  />
                </div>
              </div>
            </Collapsible>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-edge-light bg-base/60 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold text-ink-secondary hover:bg-base border border-edge-light rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            form="create-pmc-form"
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
                <AddRoundedIcon sx={{ fontSize: 14 }} />
                Onboard City
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3">
        <h3 className="text-xs font-semibold text-ink">{title}</h3>
        <p className="text-[10px] text-ink-muted">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function Collapsible({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-md border border-edge-light bg-base/40">
      <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xs font-semibold text-ink">{title}</h3>
          <p className="text-[10px] text-ink-muted">{subtitle}</p>
        </div>
        <span className="text-ink-muted text-[11px] font-semibold flex items-center gap-1 shrink-0">
          <span className="group-open:hidden">Show</span>
          <span className="hidden group-open:inline">Hide</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 transition-transform group-open:rotate-180"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </summary>
      <div className="px-4 pb-4 pt-1 border-t border-edge-light">{children}</div>
    </details>
  );
}

function Label({
  children,
  required,
  optional,
}: {
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <label className="text-[11px] font-semibold text-ink-secondary tracking-wide flex items-center gap-1.5">
      <span>{children}</span>
      {required && <span className="text-danger" aria-label="required">*</span>}
      {optional && (
        <span className="text-[10px] font-normal text-ink-disabled">(optional)</span>
      )}
    </label>
  );
}
