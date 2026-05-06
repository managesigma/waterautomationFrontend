'use client';

import { SvgIconProps } from '@mui/material/SvgIcon';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';

export default function BalanceCard({
  label,
  value,
  Icon,
  accent = 'default',
  loading = false,
}: {
  label: string;
  value: number;
  Icon: React.ComponentType<SvgIconProps>;
  accent?: 'default' | 'success' | 'amber';
  loading?: boolean;
}) {
  const tile =
    accent === 'success'
      ? 'bg-success-subtle text-success'
      : accent === 'amber'
        ? 'bg-amber-50 text-amber-600'
        : 'bg-base text-ink-secondary border border-edge-light';

  const valueColor =
    accent === 'success' ? 'text-success' : accent === 'amber' ? 'text-amber-600' : 'text-ink';

  return (
    <div className="minimal-card p-5 flex items-start justify-between gap-3 hover:border-blue-200 transition-colors">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-2">{label}</p>
        {loading ? (
          <div className="h-8 w-32 bg-base rounded animate-pulse" />
        ) : (
          <p
            className={`text-3xl font-bold ${valueColor} tabular-nums tracking-tight leading-none flex items-center`}
          >
            <CurrencyRupeeRoundedIcon sx={{ fontSize: 22 }} />
            {value.toLocaleString()}
          </p>
        )}
      </div>
      <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${tile}`}>
        <Icon sx={{ fontSize: 18 }} />
      </div>
    </div>
  );
}
