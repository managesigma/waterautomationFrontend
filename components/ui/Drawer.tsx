'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses: Record<Size, string> = {
  sm: 'sm:max-w-sm md:max-w-md',
  md: 'sm:max-w-md md:max-w-lg',
  lg: 'sm:max-w-lg md:max-w-xl lg:max-w-2xl',
  xl: 'sm:max-w-xl md:max-w-2xl lg:max-w-3xl',
};

export default function Drawer({
  open,
  onClose,
  title,
  subtitle,
  icon,
  footer,
  size = 'md',
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  size?: Size;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  return createPortal(
    <div
      className={clsx('fixed inset-0 z-60 overflow-hidden', !open && 'pointer-events-none')}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={clsx(
          'absolute inset-0 bg-slate-900/30 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      <div
        className={clsx(
          'absolute inset-y-0 right-0 w-full bg-surface shadow-2xl shadow-slate-900/20 border-l border-edge-light flex flex-col transition-transform duration-300 ease-out',
          sizeClasses[size],
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="px-5 py-4 border-b border-edge-light flex justify-between items-start gap-3 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            {icon && (
              <div className="w-10 h-10 rounded-md bg-brand-subtle flex items-center justify-center text-brand shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-ink leading-tight">{title}</h2>
              {subtitle && (
                <p className="text-[11px] text-ink-muted mt-0.5 leading-snug">{subtitle}</p>
              )}
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

        <div className="flex-1 overflow-y-auto">{children}</div>

        {footer && (
          <div className="px-5 py-3 border-t border-edge-light bg-base/60 flex justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function FormLabel({
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
      {required && (
        <span className="text-danger" aria-label="required">
          *
        </span>
      )}
      {optional && <span className="text-[10px] font-normal text-ink-disabled">(optional)</span>}
    </label>
  );
}

export const inputCls =
  'h-10 px-3 text-sm rounded-md border border-edge-light bg-surface text-ink placeholder:text-ink-disabled focus:outline-none focus:border-brand focus:ring-2 focus:ring-blue-600/10 transition-all w-full';

export function FormSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3">
        <h3 className="text-xs font-semibold text-ink">{title}</h3>
        {subtitle && <p className="text-[10px] text-ink-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
