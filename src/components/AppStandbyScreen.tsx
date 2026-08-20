import React, { useState, useEffect } from 'react';
import { LogoKonselor } from './LogoKonselor';
import { useDb } from '../context/DbContext';
import {
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock as ClockIcon,
  Maximize2,
  Minimize2,
  X,
  Minus,
} from 'lucide-react';

interface AppStandbyScreenProps {
  onRestore: () => void;
  activeTabTitle: string;
}

export const AppStandbyScreen: React.FC<AppStandbyScreenProps> = ({
  onRestore,
  activeTabTitle,
}) => {
  const { profilSekolah, guruBkList } = useDb();
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 select-none animate-in fade-in duration-300">
      {/* Top Bar with School Name & Window Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 shadow-sm">
            <LogoKonselor className="w-full h-full" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>BK Vol. 2</span>
              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-indigo-500/30">
                STANDBY
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              {profilSekolah.namaSekolah || 'Sistem Bimbingan Konseling'}
            </p>
          </div>
        </div>

        {/* Window controls on standby screen */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={onRestore}
            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Buka / Restore Aplikasi BK Vol. 2"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Clock & Standby Card */}
      <div className="max-w-md w-full mx-auto text-center space-y-6">
        <div className="inline-flex p-3.5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl shadow-indigo-950/20">
          <Lock className="w-8 h-8 text-indigo-400 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="text-5xl sm:text-6xl font-extrabold tracking-tight font-mono text-white">
            {timeStr || '00:00:00'}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">{dateStr}</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200">
              Aplikasi Sedang Dalam Mode Siaga
            </h3>
            <p className="text-xs text-slate-400">
              Sesi Anda aman. Klik tombol di bawah untuk melanjutkan pekerjaan Anda di{' '}
              <span className="text-indigo-400 font-semibold">{activeTabTitle}</span>.
            </p>
          </div>

          <button
            onClick={onRestore}
            className="w-full py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Buka / Lanjutkan Aplikasi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-900 pt-4">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Data Master & Arsip Tersimpan Aman</span>
        </div>
        <p>© BK Vol. 2 Professional</p>
      </div>
    </div>
  );
};
