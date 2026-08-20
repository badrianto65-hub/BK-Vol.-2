import React, { useState } from 'react';
import { DbProvider } from './context/DbContext';
import { Header, TabType } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { MasterData } from './components/MasterData';
import { FormKonseling } from './components/FormKonseling';
import { ArsipKonseling } from './components/ArsipKonseling';
import { SuratPanggilanView } from './components/SuratPanggilan';
import { SuratTugasView } from './components/SuratTugas';
import { SuratPernyataanView } from './components/SuratPernyataan';
import { LogoKonselor } from './components/LogoKonselor';
import { AppTopBar } from './components/AppTopBar';
import { AppStandbyScreen } from './components/AppStandbyScreen';
import { BookOpen, ShieldCheck, Maximize2, X, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isAppMinimized, setIsAppMinimized] = useState(false);
  const [isAppStandby, setIsAppStandby] = useState(false);
  const [isAppMaximized, setIsAppMaximized] = useState(false);

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard Statistik BK';
      case 'master':
        return 'Data Master Siswa & Guru';
      case 'input-konseling':
        return 'Input Layanan Konseling';
      case 'arsip':
        return 'Arsip Konseling';
      case 'surat-panggilan':
        return 'Surat Panggilan Orang Tua';
      case 'surat-tugas':
        return 'Surat Tugas';
      case 'surat-pernyataan':
        return 'Surat Pernyataan';
      default:
        return 'Sistem BK Vol. 2';
    }
  };

  return (
    <DbProvider>
      {/* 1. STANDBY / LOCK SCREEN */}
      {isAppStandby && (
        <AppStandbyScreen
          onRestore={() => setIsAppStandby(false)}
          activeTabTitle={getTabLabel(activeTab)}
        />
      )}

      {/* 2. MAIN APPLICATION CONTAINER */}
      <div
        className={`min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col lg:flex-row selection:bg-indigo-500 selection:text-white transition-all ${
          isAppMaximized ? 'w-full' : ''
        }`}
      >
        {/* Navigation Sidebar / Header */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar with Screen Info & Pojok Kanan Atas Window Controls (Minimize, Maximize, Close) */}
          <AppTopBar
            activeTab={activeTab}
            isAppMinimized={isAppMinimized}
            setIsAppMinimized={setIsAppMinimized}
            isAppStandby={isAppStandby}
            setIsAppStandby={setIsAppStandby}
            isAppMaximized={isAppMaximized}
            setIsAppMaximized={setIsAppMaximized}
          />

          {/* If App is Minimized, show placeholder card + floating dock */}
          {isAppMinimized ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-xs">
                  <LogoKonselor className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Jendela Aplikasi Sedang Diminimize
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Anda sedang berada pada halaman{' '}
                    <strong className="text-indigo-600">{getTabLabel(activeTab)}</strong>.
                  </p>
                </div>
                <button
                  onClick={() => setIsAppMinimized(false)}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Pulihkan / Buka Tampilan Penuh</span>
                </button>
              </div>
            </div>
          ) : (
            /* Standard Main Content */
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
              {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
              {activeTab === 'master' && <MasterData />}
              {activeTab === 'input-konseling' && <FormKonseling setActiveTab={setActiveTab} />}
              {activeTab === 'arsip' && <ArsipKonseling setActiveTab={setActiveTab} />}
              {activeTab === 'surat-panggilan' && <SuratPanggilanView />}
              {activeTab === 'surat-tugas' && <SuratTugasView />}
              {activeTab === 'surat-pernyataan' && <SuratPernyataanView />}
            </main>
          )}

          {/* Footer */}
          <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 px-4 sm:px-6 lg:px-8 text-xs mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <LogoKonselor className="w-5 h-5" />
                <span className="font-bold italic text-slate-200">BK Vol. 2</span>
                <span className="italic">— Sistem Bimbingan Konseling Sekolah Terpadu</span>
              </div>

              <div className="flex items-center space-x-4 text-[11px] text-slate-500">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Terintegrasi Local Database</span>
                </span>
                <span>•</span>
                <span>Cetak PDF Resmi Kop Sekolah</span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* 3. PERSISTENT FLOATING DOCKED PILL WHEN APP IS MINIMIZED */}
      {isAppMinimized && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3.5 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center p-1 shrink-0">
              <LogoKonselor className="w-full h-full" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="font-bold text-xs text-white">BK Vol. 2</p>
              </div>
              <p className="text-[10px] text-slate-300 max-w-[140px] truncate mt-0.5">
                {getTabLabel(activeTab)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
            <button
              onClick={() => setIsAppMinimized(false)}
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              title="Buka / Restore Aplikasi"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Buka</span>
            </button>
            <button
              onClick={() => setIsAppStandby(true)}
              className="p-1.5 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 rounded-lg transition cursor-pointer"
              title="Kunci / Standby"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </DbProvider>
  );
}


