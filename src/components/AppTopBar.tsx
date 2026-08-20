import React from 'react';
import { TabType } from './Header';
import { AppWindowControls } from './AppWindowControls';
import { useDb } from '../context/DbContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  Archive,
  Mail,
  Award,
  FileCheck2,
  Calendar,
  School,
  Sparkles,
} from 'lucide-react';

interface AppTopBarProps {
  activeTab: TabType;
  isAppMinimized: boolean;
  setIsAppMinimized: (val: boolean) => void;
  isAppStandby: boolean;
  setIsAppStandby: (val: boolean) => void;
  isAppMaximized: boolean;
  setIsAppMaximized: (val: boolean) => void;
}

export const AppTopBar: React.FC<AppTopBarProps> = ({
  activeTab,
  isAppMinimized,
  setIsAppMinimized,
  isAppStandby,
  setIsAppStandby,
  isAppMaximized,
  setIsAppMaximized,
}) => {
  const { profilSekolah } = useDb();

  const getTabInfo = (tab: TabType) => {
    switch (tab) {
      case 'dashboard':
        return {
          title: 'Dashboard Statistik BK',
          subtitle: 'Ringkasan & Visualisasi Data Konseling',
          icon: LayoutDashboard,
          badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'master':
        return {
          title: 'Data Master Terpadu',
          subtitle: 'Kelola Profil Sekolah, Murid, dan Guru BK',
          icon: Users,
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'input-konseling':
        return {
          title: 'Input Layanan Konseling',
          subtitle: 'Formulir Pencatatan Bimbingan Siswa Baru',
          icon: FileText,
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'arsip':
        return {
          title: 'Arsip Data Konseling',
          subtitle: 'Riwayat, Filter, & Ekspor Data Kasus',
          icon: Archive,
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'surat-panggilan':
        return {
          title: 'Surat Panggilan Orang Tua',
          subtitle: 'Terbitkan & Cetak Surat Panggilan Resmi (PDF)',
          icon: Mail,
          badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'surat-tugas':
        return {
          title: 'Surat Tugas Bimbingan & Konseling',
          subtitle: 'Dokumentasi Tugas Resmi Guru BK (PDF)',
          icon: Award,
          badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
        };
      case 'surat-pernyataan':
        return {
          title: 'Surat Pernyataan Siswa & Ortu',
          subtitle: 'Komitmen, Tata Tertib, & Format Cetak PDF',
          icon: FileCheck2,
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      default:
        return {
          title: 'Sistem BK Vol. 2',
          subtitle: 'Bimbingan Konseling Sekolah Terpadu',
          icon: LayoutDashboard,
          badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
    }
  };

  const tabInfo = getTabInfo(activeTab);
  const Icon = tabInfo.icon;

  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header
      id="app-top-header-bar"
      className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-2xs backdrop-blur-md bg-white/95"
    >
      {/* Left: Active Screen Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
          <Icon className="w-5 h-5" />
        </div>
        <div className="leading-tight truncate">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 truncate">
            <span>{tabInfo.title}</span>
          </h2>
          <p className="text-[11px] text-slate-500 truncate hidden sm:block">
            {tabInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Date Badge & Top-Right Window Controls */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-600 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{todayStr}</span>
        </div>

        {/* Pojok Kanan Atas Window Controls (Minimize, Maximize, Close) */}
        <AppWindowControls
          isAppMinimized={isAppMinimized}
          setIsAppMinimized={setIsAppMinimized}
          isAppStandby={isAppStandby}
          setIsAppStandby={setIsAppStandby}
          isAppMaximized={isAppMaximized}
          setIsAppMaximized={setIsAppMaximized}
          activeTabTitle={tabInfo.title}
          theme="light"
        />
      </div>
    </header>
  );
};
