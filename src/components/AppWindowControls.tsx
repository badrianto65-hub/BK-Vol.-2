import React, { useState, useEffect } from 'react';
import {
  Minus,
  Maximize2,
  Minimize2,
  X,
  Power,
  RefreshCw,
  EyeOff,
  Lock,
  Sparkles,
  Laptop,
} from 'lucide-react';
import { LogoKonselor } from './LogoKonselor';
import { useDb } from '../context/DbContext';

interface AppWindowControlsProps {
  isAppMinimized: boolean;
  setIsAppMinimized: (val: boolean) => void;
  isAppStandby: boolean;
  setIsAppStandby: (val: boolean) => void;
  isAppMaximized: boolean;
  setIsAppMaximized: (val: boolean) => void;
  activeTabTitle?: string;
  theme?: 'dark' | 'light';
}

export const AppWindowControls: React.FC<AppWindowControlsProps> = ({
  isAppMinimized,
  setIsAppMinimized,
  isAppStandby,
  setIsAppStandby,
  isAppMaximized,
  setIsAppMaximized,
  activeTabTitle = 'Dashboard BK',
  theme = 'light',
}) => {
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Monitor browser fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      setIsAppMaximized(isFull);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [setIsAppMaximized]);

  const toggleMaximizeFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
          setIsAppMaximized(true);
        } else {
          setIsAppMaximized(!isAppMaximized);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
          setIsAppMaximized(false);
        } else {
          setIsAppMaximized(false);
        }
      }
    } catch {
      // Fallback if iframe prevents requestFullscreen
      setIsAppMaximized(!isAppMaximized);
    }
  };

  const handleMinimize = () => {
    setIsAppMinimized(true);
  };

  const handleCloseClick = () => {
    setShowCloseModal(true);
  };

  const handleConfirmStandby = () => {
    setShowCloseModal(false);
    setIsAppStandby(true);
  };

  const handleReload = () => {
    window.location.reload();
  };

  const isDark = theme === 'dark';

  return (
    <>
      {/* WINDOW BUTTONS CONTAINER IN TOP RIGHT CORNER */}
      <div
        className={`flex items-center gap-1.5 p-1 rounded-xl border transition-all ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 shadow-sm'
            : 'bg-white/90 border-slate-200/90 shadow-xs backdrop-blur-xs'
        }`}
        id="app-window-control-bar"
      >
        {/* Minimize Button */}
        <button
          type="button"
          onClick={handleMinimize}
          className={`p-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center cursor-pointer group ${
            isDark
              ? 'hover:bg-slate-800 text-slate-400 hover:text-amber-400'
              : 'hover:bg-amber-50 text-slate-500 hover:text-amber-600'
          }`}
          title="Minimize Aplikasi (Kecilkan ke Dock)"
          aria-label="Minimize Application"
          id="btn-app-minimize"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <Minus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </div>
        </button>

        {/* Maximize / Restore Button */}
        <button
          type="button"
          onClick={toggleMaximizeFullscreen}
          className={`p-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center cursor-pointer group ${
            isDark
              ? 'hover:bg-slate-800 text-slate-400 hover:text-emerald-400'
              : 'hover:bg-emerald-50 text-slate-500 hover:text-emerald-600'
          }`}
          title={
            isAppMaximized || isFullscreen
              ? 'Restore (Kembalikan Ukuran Normal)'
              : 'Maximize (Perbesar Layar Penuh)'
          }
          aria-label="Maximize Application"
          id="btn-app-maximize"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            {isAppMaximized || isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-emerald-600" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            )}
          </div>
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleCloseClick}
          className={`p-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center cursor-pointer group ${
            isDark
              ? 'hover:bg-rose-900/50 text-slate-400 hover:text-rose-400'
              : 'hover:bg-rose-50 text-slate-500 hover:text-rose-600'
          }`}
          title="Tutup / Kunci Aplikasi (Close)"
          aria-label="Close Application"
          id="btn-app-close"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <X className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-rose-500" />
          </div>
        </button>
      </div>

      {/* CLOSE / EXIT CONFIRMATION DIALOG MODAL */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                    Tutup Aplikasi BK Vol. 2?
                  </h3>
                  <p className="text-xs text-slate-500">Pilih opsi tindakan yang diinginkan</p>
                </div>
              </div>

              <button
                onClick={() => setShowCloseModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Options List */}
            <div className="space-y-2.5">
              {/* Option 1: Standby / Kunci */}
              <button
                onClick={handleConfirmStandby}
                className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 text-left transition flex items-start gap-3.5 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs group-hover:bg-indigo-600 group-hover:text-white transition">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <div className="leading-tight">
                  <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-950">
                    Kunci & Masuk Mode Siaga (Standby)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sembunyikan data di layar. Anda dapat membuka kembali aplikasi kapan saja dengan 1 klik.
                  </p>
                </div>
              </button>

              {/* Option 2: Minimize */}
              <button
                onClick={() => {
                  setShowCloseModal(false);
                  setIsAppMinimized(true);
                }}
                className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/80 hover:border-amber-200 text-left transition flex items-start gap-3.5 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-600 shrink-0 shadow-xs group-hover:bg-amber-500 group-hover:text-white transition">
                  <EyeOff className="w-4.5 h-4.5" />
                </div>
                <div className="leading-tight">
                  <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-950">
                    Minimize ke Bilah Dock Bawah
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Kecilkan jendela aplikasi menjadi widget mengambang di pojok kanan bawah.
                  </p>
                </div>
              </button>

              {/* Option 3: Refresh Application */}
              <button
                onClick={handleReload}
                className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-200 text-left transition flex items-start gap-3.5 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs group-hover:bg-emerald-600 group-hover:text-white transition">
                  <RefreshCw className="w-4.5 h-4.5" />
                </div>
                <div className="leading-tight">
                  <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-950">
                    Muat Ulang / Refresh Halaman
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Memuat ulang seluruh aplikasi. Data tersimpan di local storage tetap aman.
                  </p>
                </div>
              </button>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
