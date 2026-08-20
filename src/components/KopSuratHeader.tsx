import React from 'react';
import { useDb } from '../context/DbContext';
import { Building2 } from 'lucide-react';
import { LogoKonselor } from './LogoKonselor';

interface KopSuratProps {
  customTitle?: string;
}

export const KopSuratHeader: React.FC<KopSuratProps> = ({ customTitle }) => {
  const { profilSekolah } = useDb();

  const logoKiri = profilSekolah.logoKabupatenUrl;
  const logoKanan = profilSekolah.logoSekolahUrl || profilSekolah.logoUrl;

  return (
    <div className="text-center font-serif text-slate-900 mb-4 sm:mb-6 w-full">
      <div className="flex items-center justify-between pb-2 sm:pb-3 px-1 sm:px-4 border-b-2 sm:border-b-4 border-double border-slate-900 gap-1.5 sm:gap-3">
        {/* Left Logo (Logo Kabupaten / Pemda) */}
        <div className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center shrink-0">
          {logoKiri ? (
            <img
              src={logoKiri}
              alt="Logo Kabupaten / Pemda"
              className="max-h-10 max-w-10 sm:max-h-16 sm:max-w-16 md:max-h-20 md:max-w-20 object-contain"
            />
          ) : (
            <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl bg-slate-50 text-slate-700 flex flex-col items-center justify-center font-bold text-[6px] sm:text-[8px] border border-slate-300 text-center p-0.5 sm:p-1 leading-tight shadow-2xs">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-slate-600 mb-0.5" />
              <span className="hidden sm:inline">LOGO KABUPATEN</span>
              <span className="sm:hidden">PEMDA</span>
            </div>
          )}
        </div>

        {/* Center Header Details */}
        <div className="flex-1 text-center px-1 sm:px-2 min-w-0">
          <p className="text-[8px] sm:text-[11px] md:text-xs font-sans tracking-wider sm:tracking-widest uppercase font-semibold text-slate-800 leading-tight">
            PEMERINTAH {profilSekolah.kotaSekolah ? profilSekolah.kotaSekolah.toUpperCase() : 'KABUPATEN / KOTA'}
          </p>
          <p className="text-[8px] sm:text-[11px] md:text-xs font-sans tracking-normal sm:tracking-wider uppercase font-semibold text-slate-800 leading-tight">
            DINAS PENDIDIKAN DAN KEBUDAYAAN
          </p>
          <h1 className="text-[11px] sm:text-lg md:text-2xl font-extrabold tracking-tight sm:tracking-wide uppercase text-slate-950 my-0.5 sm:my-1 leading-snug">
            {profilSekolah.namaSekolah}
          </h1>
          <p className="text-[7px] sm:text-[11px] md:text-xs text-slate-800 leading-tight sm:leading-snug line-clamp-2 sm:line-clamp-none">
            {profilSekolah.alamatSekolah}, {profilSekolah.kotaSekolah}, {profilSekolah.provinsi}{' '}
            {profilSekolah.kodePos}
          </p>
          <p className="text-[7px] sm:text-[9px] md:text-[11px] text-slate-700 font-sans mt-0.5 leading-tight">
            NPSN: {profilSekolah.npsn || '-'} | Telp: {profilSekolah.teleponSekolah || '-'} | Email:{' '}
            {profilSekolah.emailSekolah || '-'}
          </p>
        </div>

        {/* Right Logo (Logo Sekolah) */}
        <div className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center shrink-0">
          {logoKanan ? (
            <img
              src={logoKanan}
              alt="Logo Sekolah"
              className="max-h-10 max-w-10 sm:max-h-16 sm:max-w-16 md:max-h-20 md:max-w-20 object-contain"
            />
          ) : (
            <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center">
              <LogoKonselor className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16" />
            </div>
          )}
        </div>
      </div>

      {customTitle && (
        <div className="mt-2 sm:mt-4 mb-2">
          <h2 className="text-xs sm:text-base md:text-lg font-bold uppercase underline tracking-wider text-slate-900">
            {customTitle}
          </h2>
        </div>
      )}
    </div>
  );
};
