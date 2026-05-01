'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Droplets, CheckCircle2, XCircle, Loader2, Truck, Gauge } from 'lucide-react';
import axios from 'axios';

const CENTRAL_API = process.env.NEXT_PUBLIC_CENTRAL_API_URL || 'http://localhost:3000/api/v1';

interface OrderDetails {
  _id: string;
  driverName?: string;
  driverMobile?: string;
  liters: number;
  truckId?: { truckName: string; truckNumber: string; capacity: number };
  status: string;
}

function ExecuteForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [poleId, setPoleId] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'LOADING_ORDER' | 'READY' | 'VALIDATING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');
  const [order, setOrder] = useState<OrderDetails | null>(null);

  // Fetch order details when token is present
  useEffect(() => {
    if (!token) return;
    setStatus('LOADING_ORDER');
    
    axios.get(`${CENTRAL_API}/order/driver/${token}`)
      .then((res) => {
        setOrder(res.data?.data);
        setStatus('READY');
      })
      .catch((err) => {
        setErrorMessage(err.response?.data?.message || 'Order not found or has expired.');
        setStatus('ERROR');
      });
  }, [token]);

  const handleValidate = async () => {
    if (!poleId || !token) return;
    setStatus('VALIDATING');
    
    try {
      await axios.post(`${CENTRAL_API}/order/driver/validate`, { token, poleId });
      setStatus('SUCCESS');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Validation failed. Please try again.');
      setStatus('ERROR');
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <XCircle className="w-20 h-20 text-red-500 mb-6" />
        <h1 className="text-3xl font-black text-gray-800 mb-2">Invalid Link</h1>
        <p className="text-gray-500 text-lg">Please use the exact link provided in your SMS.</p>
      </div>
    );
  }

  if (status === 'LOADING_ORDER') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in fade-in zoom-in duration-300">
        <Loader2 className="w-24 h-24 text-[var(--color-interactive)] animate-spin mb-8 drop-shadow-md" />
        <h2 className="text-3xl font-black text-[var(--color-text-main)] mb-3">Loading Order...</h2>
        <p className="text-lg text-gray-500">Fetching your assignment details</p>
      </div>
    );
  }

  if (status === 'VALIDATING') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in fade-in zoom-in duration-300">
        <Loader2 className="w-24 h-24 text-[var(--color-interactive)] animate-spin mb-8 drop-shadow-md" />
        <h2 className="text-4xl font-black text-[var(--color-text-main)] mb-3">Connecting...</h2>
        <p className="text-xl text-gray-500">Communicating with Machine {poleId}</p>
      </div>
    );
  }

  if (status === 'SUCCESS') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-green-50 animate-in fade-in zoom-in duration-500">
        <CheckCircle2 className="w-32 h-32 text-green-500 mb-8 drop-shadow-lg" />
        <h1 className="text-5xl font-black text-green-700 mb-4 tracking-tight">READY</h1>
        <p className="text-2xl text-green-800/80 mb-8 font-medium">Machine {poleId} is active.</p>
        <p className="text-lg bg-green-100 text-green-900 p-4 rounded-2xl w-full font-bold border border-green-200">
          You may now begin water dispensation.
        </p>
      </div>
    );
  }

  if (status === 'ERROR') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-red-50 animate-in slide-in-from-bottom-4 duration-300">
        <XCircle className="w-24 h-24 text-red-500 mb-6 drop-shadow-md" />
        <h1 className="text-4xl font-black text-red-700 mb-3 tracking-tight">Error</h1>
        <p className="text-xl text-red-800/80 mb-10 font-medium px-2">{errorMessage}</p>
        <button 
          onClick={() => { setStatus('READY'); setErrorMessage(''); }}
          className="w-full py-5 text-2xl font-bold bg-white text-red-600 border-2 border-red-200 rounded-2xl shadow-sm active:scale-95 transition-transform"
        >
          Try Again
        </button>
      </div>
    );
  }

  // READY state — show order details + pole ID input
  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-300">
      <div className="bg-[var(--color-text-main)] text-white p-6 pt-10 rounded-b-[2.5rem] shadow-md flex flex-col items-center justify-center min-h-[28vh]">
        <div className="bg-white/10 p-4 rounded-full mb-4">
          <Droplets className="w-12 h-12 text-[var(--color-interactive)]" />
        </div>
        <h1 className="text-3xl font-black tracking-widest text-center">SIGMATRONICS</h1>
        <p className="text-[#d9faff] opacity-80 mt-2 text-lg font-medium">Water Fill Authorization</p>
      </div>

      {/* Order Info */}
      {order && (
        <div className="mx-6 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck className="w-4 h-4 text-gray-400" />
              <span className="font-medium">
                {typeof order.truckId === 'object' && order.truckId ? order.truckId.truckNumber : 'Truck'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
              <Gauge className="w-4 h-4" />
              {order.liters.toLocaleString()} L
            </div>
          </div>
          {order.driverName && (
            <p className="text-xs text-gray-500">Driver: {order.driverName}</p>
          )}
        </div>
      )}

      <div className="flex-1 flex flex-col p-6 mt-2 gap-8">
        <div className="flex flex-col gap-3">
          <label className="text-2xl font-bold text-gray-800 text-center">
            Enter Machine ID
          </label>
          <p className="text-center text-gray-500 text-sm mb-2">Check the sticker on the physical control board.</p>
          <input 
            type="number"
            value={poleId}
            onChange={(e) => setPoleId(e.target.value)}
            className="w-full text-center text-5xl font-black tracking-widest py-6 border-b-4 border-[var(--color-interactive)] focus:outline-none text-[var(--color-text-main)] bg-gray-50 rounded-t-2xl focus:bg-blue-50/50 transition-colors placeholder:opacity-20"
            placeholder="000"
            autoFocus
          />
        </div>

        <button 
          onClick={handleValidate}
          disabled={!poleId}
          className="mt-auto mb-8 w-full py-6 text-2xl font-black tracking-wide text-white bg-[var(--color-interactive)] hover:bg-[var(--color-interactive-hover)] rounded-3xl shadow-xl shadow-[#00bbf0]/30 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
        >
          VALIDATE & DISPENSE
        </button>
      </div>
    </div>
  );
}

export default function ExecutePage() {
  return (
    <div className="h-screen w-full bg-gray-100 flex items-center justify-center">
      {/* Mobile constraint wrapper for desktop viewing */}
      <div className="w-full h-full max-w-md bg-white shadow-2xl relative overflow-hidden sm:h-[90vh] sm:rounded-[3rem] sm:border-[8px] sm:border-gray-800">
        <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-[var(--color-interactive)]" /></div>}>
          <ExecuteForm />
        </Suspense>
      </div>
    </div>
  );
}
