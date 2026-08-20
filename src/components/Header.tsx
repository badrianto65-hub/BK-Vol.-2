import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { LogoKonselor } from './LogoKonselor';
import {
  LayoutDashboard,
  Users,
  FileText,
  Archive,
  Mail,
  Award,
  FileCheck2,
  Download,
  Upload,
  RefreshCw,
  School,
  Menu,
  X,
  UserCheck,
  ShieldCheck,
  Database,
  Sparkles,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'master'
  | 'input-konseling'
  | 'arsip'
  | 'surat-panggilan'
  | 'surat-tugas'
  | 'surat-pernyataan';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { profilSekolah, guruBkList, exportDatabaseJson, importDatabaseJson, resetToDefaultData } = useDb();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const [selectedGuruId, setSelectedGuruId] = useState<string>('');

  const primaryGuru =
    guruBkList.find((g) => g.id === selectedGuruId) ||
    guruBkList[0] || {
      id: 'default',
      nama: 'Guru BK Utama',
      jabatan: 'Koordinator Konseling',
    };

  const handleExport = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Database_BK_Vol2_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const success = importDatabaseJson(importText);
    if (success) {
      setImportStatus('Database berhasil diimpor!');
      setTimeout(() => {
        setImportStatus(null);
        setShowSettingsModal(false);
        setImportText('');
      }, 1500);
    } else {
      setImportStatus('Gagal mengimpor JSON. Periksa format file.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setImportText(text);
      };
      reader.readAsText(file);
    }
  };

  const menuItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'Statistik',
    },
    {
      id: 'master' as TabType,
      label: 'Data Master',
      icon: Users,
      badge: 'Siswa & Guru',
    },
    {
      id: 'input-konseling' as TabType,
      label: 'Input Konseling',
      icon: FileText,
      badge: 'Baru',
    },
    {
      id: 'arsip' as TabType,
      label: 'Arsip Data',
      icon: Archive,
    },
    {
      id: 'surat-panggilan' as TabType,
      label: 'Surat Panggilan',
      icon: Mail,
      badge: 'PDF',
    },
    {
      id: 'surat-tugas' as TabType,
      label: 'Surat Tugas',
      icon: Award,
      badge: 'PDF',
    },
    {
      id: 'surat-pernyataan' as TabType,
      label: 'Surat Pernyataan',
      icon: FileCheck2,
      badge: 'PDF',
    },
  ];

  const handleTabClick = (id: TabType) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* DESKTOP SIDEBAR NAVIGATION (BENTO STYLE) */}
      <aside className="hidden lg:flex w-64 bg-slate-900 flex-col p-6 text-white shrink-0 min-h-screen border-r border-slate-800 sticky top-0 h-screen overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8 cursor-pointer group" onClick={() => handleTabClick('dashboard')}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 drop-shadow-md group-hover:scale-105 transition-transform duration-200">
            <LogoKonselor className="w-10 h-10" />
          </div>
          <div className="leading-tight overflow-hidden">
            <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>BK Vol. 2</span>
              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded-md border border-indigo-500/30">
                PRO
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-widest mt-0.5">
              {profilSekolah.namaSekolah || 'Counseling System'}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 flex-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1">
            Menu Utama
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center justify-between p-3 rounded-xl font-semibold text-xs transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-indigo-700/60 text-indigo-100'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Database Tools */}
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mt-6 mb-1">
            Administrasi Data
          </p>
          <button
            onClick={handleExport}
            className="flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Backup Database JSON</span>
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 text-xs font-semibold transition"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Kelola & Impor DB</span>
          </button>
        </nav>

        {/* User Profile Bento Box */}
        <div className="mt-auto pt-4">
          <div className="p-3.5 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-indigo-400 uppercase font-extrabold tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Konselor Bertugas
              </span>
              {guruBkList.length > 1 && (
                <span className="text-[9px] bg-indigo-900/60 text-indigo-300 font-bold px-1.5 py-0.5 rounded-md border border-indigo-700/50">
                  {guruBkList.length} Guru
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-indigo-600/30">
                <UserCheck className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="overflow-hidden leading-tight flex-1">
                {guruBkList.length > 1 ? (
                  <select
                    value={primaryGuru.id || ''}
                    onChange={(e) => setSelectedGuruId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-lg py-1 px-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer truncate"
                  >
                    {guruBkList.map((g) => (
                      <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                        {g.nama} ({g.jabatan})
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    <p className="text-xs font-bold text-white truncate">{primaryGuru.nama}</p>
                    <p className="text-[10px] text-slate-400 truncate">{primaryGuru.jabatan}</p>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => handleTabClick('master')}
              className="w-full text-center py-1 bg-slate-900/60 hover:bg-slate-700/80 text-slate-400 hover:text-indigo-300 rounded-lg text-[10px] font-semibold transition border border-slate-700/50 flex items-center justify-center gap-1"
            >
              <Users className="w-3 h-3 text-indigo-400" />
              <span>Ganti / Kelola Guru BK</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE TOP NAVIGATION BAR */}
      <header className="lg:hidden bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabClick('dashboard')}>
            <div className="w-9 h-9 flex items-center justify-center shrink-0 drop-shadow-sm">
              <LogoKonselor className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white leading-none">BK Vol. 2</h1>
              <p className="text-[10px] text-slate-400 truncate max-w-[180px] mt-0.5">
                {profilSekolah.namaSekolah}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              title="Backup DB"
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              <Download className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              title="Kelola DB"
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              <Database className="w-4 h-4 text-indigo-400" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Tab Scrollbar */}
        <div className="bg-slate-950/90 border-t border-slate-800/80 px-3 py-2 overflow-x-auto scrollbar-none flex gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="bg-slate-900 border-t border-slate-800 p-4 space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Menu Utama
            </p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl font-semibold text-xs ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 bg-slate-800/50 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-200">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Database Management Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <School className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-lg text-white">Integrasi & Pengelolaan DB</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Impor Backup Database (.JSON)
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Atau Tempel Teks JSON Database
                </label>
                <textarea
                  rows={4}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='{"profilSekolah": {...}, "muridList": [...]}'
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {importStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    importStatus.includes('berhasil')
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                  }`}
                >
                  {importStatus}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        'Apakah Anda yakin ingin mereset seluruh data ke data sampel bawaan?'
                      )
                    ) {
                      resetToDefaultData();
                      setShowSettingsModal(false);
                    }
                  }}
                  className="inline-flex items-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Sampel Data</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleImport}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30"
                  >
                    Proses Impor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

