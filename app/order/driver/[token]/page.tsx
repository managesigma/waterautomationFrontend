'use client';

import { use, useEffect, useState } from 'react';
import { Droplets, CheckCircle2, XCircle, Loader2, Truck, Gauge, User } from 'lucide-react';
import axios from 'axios';

const CENTRAL_API = process.env.NEXT_PUBLIC_CENTRAL_API_URL || 'http://34.204.174.3:3000/api/v1';

type DriverOrderStatus =
  | 'PENDING'
  | 'READY_FOR_EXECUTION'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

interface DriverOrder {
  _id: string;
  driverName?: string;
  driverMobile?: string;
  liters: number;
  truckId?: string | { truckName?: string; truckNumber?: string; capacity?: number };
  status: DriverOrderStatus | string;
}

type ScreenStatus =
  | 'LOADING_ORDER'
  | 'READY'
  | 'VALIDATING'
  | 'SUCCESS'
  | 'ERROR';

function truckLabel(truckId: DriverOrder['truckId']): string {
  if (!truckId) return 'Truck';
  if (typeof truckId === 'string') return 'Truck';
  return truckId.truckNumber || truckId.truckName || 'Truck';
}

function extractMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }
  return fallback;
}

export default function DriverOrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const [poleId, setPoleId] = useState('');
  const [status, setStatus] = useState<ScreenStatus>('LOADING_ORDER');
  const [errorMessage, setErrorMessage] = useState('');
  const [order, setOrder] = useState<DriverOrder | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get(`${CENTRAL_API}/order/driver/${token}`, { signal: controller.signal })
      .then((res) => {
        setOrder(res.data?.data ?? null);
        setStatus('READY');
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setErrorMessage(extractMessage(err, 'Order not found or has expired.'));
        setStatus('ERROR');
      });

    return () => controller.abort();
  }, [token, retryKey]);

  const handleValidate = async () => {
    if (!poleId) return;
    setStatus('VALIDATING');

    try {
      await axios.post(`${CENTRAL_API}/order/driver/validate`, { token, poleId });
      setStatus('SUCCESS');
    } catch (err) {
      setErrorMessage(extractMessage(err, 'Validation failed. Please try again.'));
      setStatus('ERROR');
    }
  };

  const handleRetry = () => {
    setErrorMessage('');
    if (order) {
      setStatus('READY');
    } else {
      setStatus('LOADING_ORDER');
      setRetryKey((k) => k + 1);
    }
  };

  return (
    <div className="min-h-screen w-full bg-base flex items-start sm:items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md bg-surface border border-edge-light rounded-xl shadow-sm overflow-hidden">
        {/* Header — solid brand band, always visible */}
        <header className="bg-blue-700 text-white px-6 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <h1 className="text-base font-bold tracking-wide">SIGMATRONICS</h1>
            <p className="text-xs text-blue-100/80">Water Fill Authorization</p>
          </div>
        </header>

        {/* Body */}
        <div className="p-6">
          {status === 'LOADING_ORDER' && <LoadingPanel label="Loading order details..." />}

          {status === 'VALIDATING' && (
            <LoadingPanel label={`Connecting to Machine ${poleId}...`} />
          )}

          {status === 'SUCCESS' && (
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-14 h-14 rounded-full bg-success-subtle flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-xl font-bold text-ink mb-1">Ready to Dispense</h2>
              <p className="text-sm text-ink-muted mb-6">
                Machine {poleId} is active. You may now begin water dispensation.
              </p>
            </div>
          )}

          {status === 'ERROR' && (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-14 h-14 rounded-full bg-danger-subtle flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-danger" />
              </div>
              <h2 className="text-xl font-bold text-ink mb-1">Something went wrong</h2>
              <p className="text-sm text-ink-muted mb-6 px-2">{errorMessage}</p>
              <button
                onClick={handleRetry}
                className="w-full py-3 text-sm font-semibold text-ink-secondary bg-base border border-edge-light rounded-lg hover:bg-slate-100 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {status === 'READY' && (
            <div className="flex flex-col gap-6">
              {order && (
                <div className="rounded-lg border border-edge-light bg-base/60 divide-y divide-slate-200">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-ink-secondary">
                      <Truck className="w-4 h-4 text-ink-muted" />
                      <span className="font-medium">{truckLabel(order.truckId)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-700">
                      <Gauge className="w-4 h-4" />
                      {order.liters.toLocaleString()} L
                    </div>
                  </div>
                  {order.driverName && (
                    <div className="flex items-center gap-2 px-4 py-3 text-xs text-ink-muted">
                      <User className="w-3.5 h-3.5" />
                      Driver: <span className="text-ink-secondary font-medium">{order.driverName}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label htmlFor="poleId" className="text-sm font-semibold text-ink">
                  Machine ID
                </label>
                <p className="text-xs text-ink-muted">
                  Check the sticker on the physical control board.
                </p>
                <input
                  id="poleId"
                  type="text"
                  value={poleId}
                  onChange={(e) => setPoleId(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={32}
                  className="mt-1 w-full text-center text-2xl font-bold tracking-widest py-4 border border-edge-light rounded-lg bg-surface text-ink focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-ink-disabled placeholder:font-normal placeholder:tracking-normal"
                  placeholder="e.g. POLE-01"
                  autoFocus
                />
              </div>

              <button
                onClick={handleValidate}
                disabled={!poleId}
                className="w-full py-3.5 text-sm font-semibold tracking-wide text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                Validate &amp; Dispense
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center text-center py-12">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-sm text-ink-secondary">{label}</p>
    </div>
  );
}
