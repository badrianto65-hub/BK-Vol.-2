import React, { useState, useMemo } from 'react';
import { useDb } from '../context/DbContext';
import { SuratPanggilan as ISuratPanggilan, Murid } from '../types';
import {
  Mail,
  Plus,
  Printer,
  Trash2,
  FileText,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  CheckCircle2,
  Download,
  Minus,
  Maximize2,
  Minimize2,
  X,
  Users,
  User,
  Search,
  CheckSquare,
  Square,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';
import { KopSuratHeader } from './KopSuratHeader';
import { exportElementToPdf, triggerPrintModal } from '../utils/pdfExport';

export const SuratPanggilanView: React.FC = () => {
  const {
    suratPanggilanList,
    addSuratPanggilan,
    updateSuratPanggilan,
    deleteSuratPanggilan,
    muridList,
    guruBkList,
    profilSekolah,
  } = useDb();

  const [showForm, setShowForm] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<ISuratPanggilan | null>(null);
  const [isPreviewMinimized, setIsPreviewMinimized] = useState(false);
  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false);
  const [deletingLetterId, setDeletingLetterId] = useState<string | null>(null);
  const [tableFilterType, setTableFilterType] = useState<'All' | 'Individu' | 'Kolektif'>('All');

  // Preview Mode for Collective letters (Tabular summary or Batch per-student sheets)
  const [previewFormatKolektif, setPreviewFormatKolektif] = useState<'Tabel Kolektif' | 'Lembar Per Siswa'>('Tabel Kolektif');

  // Form State
  const [tipePanggilan, setTipePanggilan] = useState<'Individu' | 'Kolektif'>('Individu');
  const [formatCetakKolektif, setFormatCetakKolektif] = useState<'Tabel Kolektif' | 'Lembar Per Siswa'>('Tabel Kolektif');

  const [nomorSurat, setNomorSurat] = useState(
    `0${Math.floor(Math.random() * 90) + 10}/BK-${profilSekolah.npsn || 'SEKOLAH'}/${new Date().toLocaleDateString('id-ID', { month: '2-digit' })}/${new Date().getFullYear()}`
  );
  const [tanggalSurat, setTanggalSurat] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // For Individu
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    muridList[0]?.id || ''
  );

  // For Kolektif
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    muridList.slice(0, 2).map((m) => m.id)
  );
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('Semua');

  const [hariTanggalPanggilan, setHariTanggalPanggilan] = useState('Kamis, 14 Agustus 2026');
  const [waktuPanggilan, setWaktuPanggilan] = useState('09:00 WIB - Selesai');
  const [tempatPanggilan, setTempatPanggilan] = useState(
    `Ruang Bimbingan & Konseling (BK) ${profilSekolah.namaSekolah || ''}`
  );
  const [menemuiGuruBkId, setMenemuiGuruBkId] = useState<string>(
    guruBkList[0]?.id || ''
  );
  const [alasanPanggilan, setAlasanPanggilan] = useState(
    'Koordinasi dan Pembahasan Perkembangan Adaptasi Belajar Serta Kesejahteraan Emosional Peserta Didik di Sekolah.'
  );
  const [sifat, setSifat] = useState<'Biasa' | 'Penting' | 'Sangat Rahasia'>('Penting');

  // Unique list of classes for collective filter
  const classList = useMemo(() => {
    const classes = Array.from(new Set(muridList.map((m) => m.kelas))).filter(Boolean);
    return classes.sort();
  }, [muridList]);

  // Filtered students for collective selector
  const filteredStudents = useMemo(() => {
    return muridList.filter((m) => {
      const matchClass = studentClassFilter === 'Semua' || m.kelas === studentClassFilter;
      const query = studentSearchQuery.toLowerCase();
      const matchQuery =
        m.nama.toLowerCase().includes(query) ||
        m.nis.toLowerCase().includes(query) ||
        (m.namaOrangTua && m.namaOrangTua.toLowerCase().includes(query));
      return matchClass && matchQuery;
    });
  }, [muridList, studentClassFilter, studentSearchQuery]);

  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter((id) => id !== studentId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    }
  };

  const handleSelectAllFiltered = () => {
    const idsToAdd = filteredStudents.map((m) => m.id);
    const combined = Array.from(new Set([...selectedStudentIds, ...idsToAdd]));
    setSelectedStudentIds(combined);
  };

  const handleClearSelected = () => {
    setSelectedStudentIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (tipePanggilan === 'Individu') {
      if (!selectedStudentId) {
        alert('Silakan pilih salah satu siswa!');
        return;
      }
    } else {
      if (selectedStudentIds.length === 0) {
        alert('Silakan pilih minimal 1 siswa untuk panggilan kolektif!');
        return;
      }
    }

    const primaryStudentId =
      tipePanggilan === 'Individu'
        ? selectedStudentId
        : selectedStudentIds[0] || '';

    const newSurat: Omit<ISuratPanggilan, 'id' | 'createdAt'> = {
      nomorSurat,
      tanggalSurat,
      tipePanggilan,
      studentId: primaryStudentId,
      studentIds:
        tipePanggilan === 'Kolektif' ? selectedStudentIds : [primaryStudentId],
      formatCetakKolektif:
        tipePanggilan === 'Kolektif' ? formatCetakKolektif : undefined,
      hariTanggalPanggilan,
      waktuPanggilan,
      tempatPanggilan,
      menemuiGuruBkId,
      alasanPanggilan,
      sifat,
      statusHadir: 'Belum Hadir',
    };

    addSuratPanggilan(newSurat);
    setShowForm(false);
    alert(
      `Surat Panggilan ${
        tipePanggilan === 'Kolektif'
          ? `Kolektif (${selectedStudentIds.length} Siswa)`
          : 'Individu'
      } berhasil diterbitkan!`
    );
  };

  // Filtered Archive Table Letters
  const filteredLetters = useMemo(() => {
    return suratPanggilanList.filter((sp) => {
      if (tableFilterType === 'Individu') {
        return !sp.tipePanggilan || sp.tipePanggilan === 'Individu';
      }
      if (tableFilterType === 'Kolektif') {
        return sp.tipePanggilan === 'Kolektif';
      }
      return true;
    });
  }, [suratPanggilanList, tableFilterType]);

  const countIndividu = suratPanggilanList.filter(
    (sp) => !sp.tipePanggilan || sp.tipePanggilan === 'Individu'
  ).length;
  const countKolektif = suratPanggilanList.filter(
    (sp) => sp.tipePanggilan === 'Kolektif'
  ).length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
              PDF Generator & Print
            </span>
            <span className="text-xs text-slate-400">• Mode Individu & Kolektif Terpadu</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Surat Panggilan Orang Tua / Wali Murid
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Terbitkan surat dinas resmi pemanggilan orang tua secara perorangan (Individu) maupun rombongan (Kolektif/Kelompok).
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Tutup Formulir' : '+ Buat Surat Panggilan Baru'}</span>
        </button>
      </div>

      {/* FORM INPUT SURAT PANGGILAN */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-6 text-xs animate-in fade-in duration-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Formulir Penerbitan Surat Panggilan
              </h3>
              <p className="text-xs text-slate-500">
                Pilih metode pemanggilan siswa (Individu atau Kolektif).
              </p>
            </div>

            {/* TOGGLE TIPE PANGGILAN */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setTipePanggilan('Individu')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  tipePanggilan === 'Individu'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Panggilan Individu (1 Siswa)</span>
              </button>
              <button
                type="button"
                onClick={() => setTipePanggilan('Kolektif')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  tipePanggilan === 'Kolektif'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Panggilan Kolektif (Banyak Siswa)</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: METADATA SURAT */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Surat Dinas *</label>
              <input
                type="text"
                required
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Terbit Surat *</label>
              <input
                type="date"
                required
                value={tanggalSurat}
                onChange={(e) => setTanggalSurat(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Sifat Surat Dinas</label>
              <select
                value={sifat}
                onChange={(e) =>
                  setSifat(e.target.value as 'Biasa' | 'Penting' | 'Sangat Rahasia')
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none font-bold"
              >
                <option value="Penting">Penting</option>
                <option value="Biasa">Biasa</option>
                <option value="Sangat Rahasia">Sangat Rahasia</option>
              </select>
            </div>
          </div>

          {/* SECTION 2: PEMILIHAN SISWA (INDIVIDU VS KOLEKTIF) */}
          {tipePanggilan === 'Individu' ? (
            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Pilih Siswa yang Dipanggil Orang Tuanya</span>
              </div>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full p-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-xs text-slate-800"
              >
                {muridList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama} — Kelas {m.kelas} (NIS: {m.nis}) | Wali/Ortu: {m.namaOrangTua || 'Belum diisi'}
                  </option>
                ))}
              </select>

              {(() => {
                const std = muridList.find((m) => m.id === selectedStudentId);
                if (!std) return null;
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                    <div className="bg-white p-2.5 rounded-xl border border-indigo-100/80">
                      <span className="text-slate-400 block text-[10px]">Nama Lengkap</span>
                      <span className="font-bold text-slate-800">{std.nama}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-indigo-100/80">
                      <span className="text-slate-400 block text-[10px]">Kelas & NIS</span>
                      <span className="font-bold text-slate-800">
                        {std.kelas} / {std.nis}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-indigo-100/80">
                      <span className="text-slate-400 block text-[10px]">Nama Orang Tua/Wali</span>
                      <span className="font-bold text-slate-800">{std.namaOrangTua || '-'}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-indigo-100/80">
                      <span className="text-slate-400 block text-[10px]">No. Telepon Ortu</span>
                      <span className="font-bold text-slate-800">{std.noHpOrangTua || '-'}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* KOLEKTIF MULTI-STUDENT SELECTOR */
            <div className="p-4 bg-purple-50/50 border border-purple-200/70 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-purple-950 font-bold text-xs">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Pilih Siswa Panggilan Kolektif ({selectedStudentIds.length} Siswa Terpilih)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <CheckSquare className="w-3 h-3" />
                    <span>Pilih Semua di Filter</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSelected}
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                  >
                    <span>Hapus Pilihan</span>
                  </button>
                </div>
              </div>

              {/* Format Cetak Kolektif Option */}
              <div className="bg-white p-3 rounded-xl border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span>Format Hasil Cetak / PDF:</span>
                </span>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="formatCetak"
                      value="Tabel Kolektif"
                      checked={formatCetakKolektif === 'Tabel Kolektif'}
                      onChange={() => setFormatCetakKolektif('Tabel Kolektif')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span>1 Surat Berisi Tabel Daftar Siswa</span>
                  </label>
                  <span className="text-slate-300">|</span>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="formatCetak"
                      value="Lembar Per Siswa"
                      checked={formatCetakKolektif === 'Lembar Per Siswa'}
                      onChange={() => setFormatCetakKolektif('Lembar Per Siswa')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span>Cetak Massal (Lembar Per Siswa)</span>
                  </label>
                </div>
              </div>

              {/* Filters for students list */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder="Cari nama siswa, NIS, atau orang tua..."
                    className="w-full pl-8 pr-3 py-2 bg-white border border-purple-200 rounded-xl focus:ring-1 focus:ring-purple-500 focus:outline-none text-xs"
                  />
                </div>
                <div className="sm:w-48">
                  <select
                    value={studentClassFilter}
                    onChange={(e) => setStudentClassFilter(e.target.value)}
                    className="w-full p-2 bg-white border border-purple-200 rounded-xl focus:ring-1 focus:ring-purple-500 focus:outline-none text-xs font-bold"
                  >
                    <option value="Semua">Semua Kelas ({muridList.length})</option>
                    {classList.map((cls) => (
                      <option key={cls} value={cls}>
                        Kelas {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checkbox Grid List */}
              <div className="max-h-48 overflow-y-auto border border-purple-200/80 rounded-xl bg-white divide-y divide-slate-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((m) => {
                    const isChecked = selectedStudentIds.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center justify-between p-2.5 hover:bg-purple-50/60 cursor-pointer transition ${
                          isChecked ? 'bg-purple-50/80 font-bold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleStudentSelection(m.id)}
                            className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                          />
                          <div className="truncate">
                            <span className="text-slate-900 text-xs font-bold">{m.nama}</span>
                            <span className="text-[11px] text-slate-500 ml-2">
                              Kelas {m.kelas} (NIS: {m.nis})
                            </span>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400 shrink-0 text-right">
                          Ortu: {m.namaOrangTua || '-'}
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    Tidak ada siswa ditemukan dengan filter ini.
                  </div>
                )}
              </div>

              {/* Selected Badges */}
              {selectedStudentIds.length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Daftar Siswa Terpilih ({selectedStudentIds.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {selectedStudentIds.map((id) => {
                      const st = muridList.find((m) => m.id === id);
                      if (!st) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 font-bold text-[11px] border border-purple-200"
                        >
                          <span>
                            {st.nama} ({st.kelas})
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleStudentSelection(id)}
                            className="text-purple-500 hover:text-rose-600 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: WAKTU, TEMPAT & GURU BK */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Hari / Tanggal Panggilan *
              </label>
              <input
                type="text"
                required
                value={hariTanggalPanggilan}
                onChange={(e) => setHariTanggalPanggilan(e.target.value)}
                placeholder="e.g. Kamis, 14 Agustus 2026"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Waktu Panggilan *</label>
              <input
                type="text"
                required
                value={waktuPanggilan}
                onChange={(e) => setWaktuPanggilan(e.target.value)}
                placeholder="e.g. 09:00 WIB - Selesai"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tempat Pertemuan *</label>
              <input
                type="text"
                required
                value={tempatPanggilan}
                onChange={(e) => setTempatPanggilan(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Guru BK yang Ditemui *
              </label>
              <select
                value={menemuiGuruBkId}
                onChange={(e) => setMenemuiGuruBkId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none font-bold"
              >
                {guruBkList.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nama} ({g.jabatan})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Alasan / Maksud Pemanggilan *
              </label>
              <input
                type="text"
                required
                value={alasanPanggilan}
                onChange={(e) => setAlasanPanggilan(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              Terbitkan Surat Panggilan
            </button>
          </div>
        </form>
      )}

      {/* TABLE ARCHIVE SURAT PANGGILAN */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              Arsip Surat Panggilan Orang Tua ({suratPanggilanList.length})
            </h3>
          </div>

          {/* FILTER TAB BUTTONS: ALL, INDIVIDU, KOLEKTIF */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setTableFilterType('All')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                tableFilterType === 'All'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({suratPanggilanList.length})
            </button>
            <button
              onClick={() => setTableFilterType('Individu')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                tableFilterType === 'Individu'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Individu ({countIndividu})</span>
            </button>
            <button
              onClick={() => setTableFilterType('Kolektif')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                tableFilterType === 'Kolektif'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Kolektif ({countKolektif})</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Tipe</th>
                <th className="py-3.5 px-4">Nomor & Tanggal</th>
                <th className="py-3.5 px-4">Siswa / Peserta</th>
                <th className="py-3.5 px-4">Jadwal Panggilan</th>
                <th className="py-3.5 px-4">Guru BK</th>
                <th className="py-3.5 px-4">Maksud Panggilan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi / Cetak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredLetters.length > 0 ? (
                filteredLetters.map((sp) => {
                  const isKolektif = sp.tipePanggilan === 'Kolektif';
                  const studentIds = sp.studentIds && sp.studentIds.length > 0 ? sp.studentIds : [sp.studentId];
                  const primaryStudent = muridList.find((m) => m.id === sp.studentId);
                  const guru = guruBkList.find((g) => g.id === sp.menemuiGuruBkId);

                  return (
                    <tr key={sp.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        {isKolektif ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-extrabold text-[10px] border border-purple-200">
                            <Users className="w-3 h-3" />
                            <span>Kolektif ({studentIds.length})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-extrabold text-[10px] border border-indigo-200">
                            <User className="w-3 h-3" />
                            <span>Individu</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-slate-900">{sp.nomorSurat}</div>
                        <div className="text-[10px] text-slate-500">Tgl: {sp.tanggalSurat}</div>
                      </td>

                      <td className="py-3 px-4">
                        {isKolektif ? (
                          <div>
                            <div className="font-bold text-slate-900">
                              {studentIds.length} Siswa Terdaftar
                            </div>
                            <div className="text-[10px] text-slate-500 line-clamp-1">
                              {studentIds
                                .map((id) => muridList.find((m) => m.id === id)?.nama)
                                .filter(Boolean)
                                .join(', ')}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-slate-900">
                              {primaryStudent?.nama || 'N/A'}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Kelas {primaryStudent?.kelas} | Ortu: {primaryStudent?.namaOrangTua || '-'}
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{sp.hariTanggalPanggilan}</div>
                        <div className="text-[10px] text-slate-500">{sp.waktuPanggilan}</div>
                      </td>

                      <td className="py-3 px-4 font-medium">{guru?.nama || 'N/A'}</td>

                      <td className="py-3 px-4 max-w-xs line-clamp-2">{sp.alasanPanggilan}</td>

                      <td className="py-3 px-4">
                        <select
                          value={sp.statusHadir || 'Belum Hadir'}
                          onChange={(e) =>
                            updateSuratPanggilan(sp.id, {
                              statusHadir: e.target.value as any,
                            })
                          }
                          className={`text-[10px] font-bold px-2 py-1 rounded border ${
                            sp.statusHadir === 'Hadir'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : sp.statusHadir === 'Dijadwalkan Ulang'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="Belum Hadir">Belum Hadir</option>
                          <option value="Hadir">Hadir</option>
                          <option value="Dijadwalkan Ulang">Dijadwalkan Ulang</option>
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => {
                              setIsPreviewMinimized(false);
                              setIsPreviewMaximized(false);
                              setPreviewFormatKolektif(sp.formatCetakKolektif || 'Tabel Kolektif');
                              setSelectedLetter(sp);
                            }}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] shadow-sm cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Pratinjau / PDF</span>
                          </button>
                          <button
                            onClick={() => setDeletingLetterId(sp.id)}
                            className="p-1.5 rounded hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Belum ada surat panggilan pada kategori ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINTABLE SURAT PANGGILAN PDF MODAL */}
      {selectedLetter && !isPreviewMinimized && (
        <div
          className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center overflow-y-auto ${
            isPreviewMaximized ? 'p-0' : 'p-2 sm:p-4'
          }`}
        >
          <div
            className={`bg-white text-slate-900 shadow-2xl flex flex-col transition-all duration-200 ${
              isPreviewMaximized
                ? 'w-full h-full rounded-none max-h-none'
                : 'rounded-2xl sm:rounded-3xl max-w-3xl w-full p-3 sm:p-6 my-2 sm:my-8 max-h-[95vh]'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-slate-200 no-print gap-2 sm:gap-3 ${
                isPreviewMaximized ? 'p-3 sm:p-4 bg-slate-900 text-white rounded-none' : ''
              }`}
            >
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <h3 className="font-extrabold text-xs sm:text-base truncate">
                  Hasil Cetak Surat Panggilan {selectedLetter.tipePanggilan === 'Kolektif' ? 'Kolektif' : 'Individu'}
                </h3>
                {selectedLetter.tipePanggilan === 'Kolektif' && (
                  <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold shrink-0">
                    {(selectedLetter.studentIds || [selectedLetter.studentId]).length} Siswa
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-1.5 sm:space-x-2 flex-wrap gap-y-1.5">
                {/* Switcher for collective print format */}
                {selectedLetter.tipePanggilan === 'Kolektif' && (
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-300 text-[10px] sm:text-[11px] font-bold text-slate-700">
                    <button
                      onClick={() => setPreviewFormatKolektif('Tabel Kolektif')}
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md transition cursor-pointer ${
                        previewFormatKolektif === 'Tabel Kolektif'
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Tabel Bersama
                    </button>
                    <button
                      onClick={() => setPreviewFormatKolektif('Lembar Per Siswa')}
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md transition cursor-pointer ${
                        previewFormatKolektif === 'Lembar Per Siswa'
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Lembar Per Siswa
                    </button>
                  </div>
                )}

                <button
                  onClick={() =>
                    exportElementToPdf(
                      'printable-surat-panggilan',
                      `Surat_Panggilan_${selectedLetter.tipePanggilan || 'Individu'}_${selectedLetter.nomorSurat.replace(/[\/\\]/g, '_')}.pdf`
                    )
                  }
                  className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] sm:text-xs font-bold inline-flex items-center space-x-1 shadow transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>

                <button
                  onClick={() => triggerPrintModal('printable-surat-panggilan')}
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] sm:text-xs font-bold inline-flex items-center space-x-1 shadow transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>

                {/* Window Control Buttons: Minimize, Maximize/Restore, Close */}
                <div
                  className={`flex items-center gap-0.5 sm:gap-1 pl-1.5 sm:pl-2 border-l ${
                    isPreviewMaximized ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <button
                    onClick={() => setIsPreviewMinimized(true)}
                    className="p-1 sm:p-1.5 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition cursor-pointer"
                    title="Minimize (Kecilkan ke Dock)"
                    aria-label="Minimize"
                  >
                    <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => setIsPreviewMaximized(!isPreviewMaximized)}
                    className="p-1 sm:p-1.5 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition cursor-pointer"
                    title={isPreviewMaximized ? 'Restore / Normal' : 'Maximize'}
                    aria-label="Maximize"
                  >
                    {isPreviewMaximized ? (
                      <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedLetter(null)}
                    className="p-1 sm:p-1.5 hover:bg-rose-100 hover:text-rose-600 rounded-lg transition cursor-pointer"
                    title="Tutup (Close)"
                    aria-label="Close"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Printable Document Body Container */}
            <div
              id="printable-surat-panggilan"
              className="p-3 sm:p-6 md:p-8 bg-white font-serif text-slate-900 text-[10px] sm:text-xs leading-normal sm:leading-relaxed overflow-y-auto"
            >
              {(() => {
                const isKolektif = selectedLetter.tipePanggilan === 'Kolektif';
                const studentIds = selectedLetter.studentIds && selectedLetter.studentIds.length > 0
                  ? selectedLetter.studentIds
                  : [selectedLetter.studentId];
                const guru = guruBkList.find((g) => g.id === selectedLetter.menemuiGuruBkId);

                // 1. KOLEKTIF - FORMAT 1: TABEL KOLEKTIF BERSAMA DALAM 1 SURAT
                if (isKolektif && previewFormatKolektif === 'Tabel Kolektif') {
                  const targetStudents = studentIds
                    .map((id) => muridList.find((m) => m.id === id))
                    .filter(Boolean) as Murid[];

                  return (
                    <div className="space-y-3 sm:space-y-4 my-1 sm:my-2">
                      <KopSuratHeader />

                      {/* Header Table Details */}
                      <div className="flex justify-between items-start font-sans text-[9px] sm:text-xs pt-2 sm:pt-4 gap-2">
                        <table className="w-auto">
                          <tbody>
                            <tr>
                              <td className="pr-2 sm:pr-4 py-0.5 font-bold">Nomor</td>
                              <td>: {selectedLetter.nomorSurat}</td>
                            </tr>
                            <tr>
                              <td className="pr-2 sm:pr-4 py-0.5 font-bold">Sifat</td>
                              <td>: {selectedLetter.sifat}</td>
                            </tr>
                            <tr>
                              <td className="pr-2 sm:pr-4 py-0.5 font-bold">Lampiran</td>
                              <td>: 1 Berkas Daftar Peserta Didik</td>
                            </tr>
                            <tr>
                              <td className="pr-2 sm:pr-4 py-0.5 font-bold">Hal</td>
                              <td className="font-bold uppercase underline">
                                : Panggilan Orang Tua / Wali Murid (Kolektif)
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <div className="text-right shrink-0">
                          <p>
                            {profilSekolah.kotaSekolah},{' '}
                            {new Date(selectedLetter.tanggalSurat).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Addressed To */}
                      <div className="mt-2 sm:mt-4 font-sans leading-snug">
                        <p>Kepada Yth.</p>
                        <p className="font-bold">
                          Bapak / Ibu Orang Tua / Wali Murid dari Peserta Didik Terlampir
                        </p>
                        <p>di Tempat</p>
                      </div>

                      {/* Body Content */}
                      <div className="my-2 sm:my-4 space-y-2 sm:space-y-3 text-justify font-sans">
                        <p>Dengan hormat,</p>
                        <p>
                          Sehubungan dengan pelaksanaan program layanan Bimbingan dan Konseling serta upaya pembinaan, pendampingan belajar, dan pemantauan perkembangan peserta didik, bersama ini kami mengundang kehadiran Bapak/Ibu Orang Tua/Wali Murid pada:
                        </p>

                        <table className="w-full text-left my-2 sm:my-3 sm:ml-4 border-collapse font-sans text-[9px] sm:text-xs">
                          <tbody>
                            <tr>
                              <td className="py-0.5 sm:py-1 font-bold w-24 sm:w-36">Hari / Tanggal</td>
                              <td className="py-0.5 sm:py-1">: {selectedLetter.hariTanggalPanggilan}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5 sm:py-1 font-bold">Waktu</td>
                              <td className="py-0.5 sm:py-1">: {selectedLetter.waktuPanggilan}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5 sm:py-1 font-bold">Tempat</td>
                              <td className="py-0.5 sm:py-1">: {selectedLetter.tempatPanggilan}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5 sm:py-1 font-bold">Menemui</td>
                              <td className="py-0.5 sm:py-1">: {guru?.nama || 'Guru Bimbingan Konseling'}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5 sm:py-1 font-bold">Acara / Maksud</td>
                              <td className="py-0.5 sm:py-1 font-semibold text-slate-900">: {selectedLetter.alasanPanggilan}</td>
                            </tr>
                          </tbody>
                        </table>

                        <p className="font-bold pt-1 sm:pt-2">
                          Adapun daftar peserta didik yang diundang adalah sebagai berikut:
                        </p>

                        {/* TABEL DAFTAR SISWA KOLEKTIF */}
                        <div className="overflow-x-auto -mx-1 sm:mx-0">
                          <table className="w-full border-collapse border border-slate-400 text-center font-sans text-[8px] sm:text-xs my-1 sm:my-2 min-w-[340px]">
                            <thead className="bg-slate-100 font-bold">
                              <tr>
                                <th className="border border-slate-400 py-1 px-1 sm:py-1.5 sm:px-2 w-8 sm:w-10">No</th>
                                <th className="border border-slate-400 py-1 px-2 sm:py-1.5 sm:px-3 text-left">Nama Peserta Didik</th>
                                <th className="border border-slate-400 py-1 px-1 sm:py-1.5 sm:px-2">NIS / NISN</th>
                                <th className="border border-slate-400 py-1 px-1 sm:py-1.5 sm:px-2">Kelas</th>
                                <th className="border border-slate-400 py-1 px-2 sm:py-1.5 sm:px-3 text-left">Nama Orang Tua / Wali</th>
                              </tr>
                            </thead>
                            <tbody>
                              {targetStudents.map((st, idx) => (
                                <tr key={st.id} className="border-b border-slate-300">
                                  <td className="border border-slate-400 py-1 px-1 sm:py-1.5 sm:px-2 font-mono">{idx + 1}</td>
                                  <td className="border border-slate-400 py-1 px-2 sm:py-1.5 sm:px-3 text-left font-bold text-slate-900">{st.nama}</td>
                                  <td className="border border-slate-400 py-1 px-1 sm:py-1.5 sm:px-2 font-mono">{st.nis || st.nisn || '-'}</td>
                                  <td className="border border-slate-400 py-1 px-1 sm:py-1.5 sm:px-2 font-bold">{st.kelas}</td>
                                  <td className="border border-slate-400 py-1 px-2 sm:py-1.5 sm:px-3 text-left">{st.namaOrangTua || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <p className="pt-1 sm:pt-2">
                          Mengingat pentingnya koordinasi tersebut demi kebaikan dan perkembangan putra/putri Bapak/Ibu, kami sangat mengharapkan kehadiran Bapak/Ibu tepat pada waktu yang telah ditentukan.
                        </p>
                        <p>Demikian surat panggilan ini kami sampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.</p>
                      </div>

                      {/* Signatures */}
                      <div className="pt-6 sm:pt-8 flex justify-between text-center font-sans text-[9px] sm:text-xs gap-4">
                        <div className="flex-1">
                          <p className="mb-10 sm:mb-14">Guru Bimbingan Konseling,</p>
                          <p className="font-bold underline">{guru?.nama || '......................'}</p>
                          <p className="text-[8px] sm:text-[10px]">NIP. {guru?.nip || '......................'}</p>
                        </div>

                        <div className="flex-1">
                          <p className="mb-10 sm:mb-14">
                            Mengetahui,<br />Kepala Sekolah
                          </p>
                          <p className="font-bold underline">{profilSekolah.namaKepalaSekolah}</p>
                          <p className="text-[8px] sm:text-[10px]">NIP. {profilSekolah.nipKepalaSekolah}</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                // 2. KOLEKTIF - FORMAT 2: LEMBAR PER SISWA (BATCH MULTI-SHEET PRINT)
                if (isKolektif && previewFormatKolektif === 'Lembar Per Siswa') {
                  const targetStudents = studentIds
                    .map((id) => muridList.find((m) => m.id === id))
                    .filter(Boolean) as Murid[];

                  return (
                    <div className="space-y-8 sm:space-y-12">
                      {targetStudents.map((st, idx) => (
                        <div
                          key={st.id}
                          style={{ pageBreakAfter: idx < targetStudents.length - 1 ? 'always' : 'auto', breakAfter: idx < targetStudents.length - 1 ? 'page' : 'auto' }}
                          className="space-y-3 sm:space-y-4 pt-1 sm:pt-2"
                        >
                          <KopSuratHeader />

                          {/* Letter Header Details */}
                          <div className="flex justify-between items-start font-sans text-[9px] sm:text-xs pt-2 sm:pt-4 gap-2">
                            <table className="w-auto">
                              <tbody>
                                <tr>
                                  <td className="pr-2 sm:pr-4 py-0.5 font-bold">Nomor</td>
                                  <td>: {selectedLetter.nomorSurat}</td>
                                </tr>
                                <tr>
                                  <td className="pr-2 sm:pr-4 py-0.5 font-bold">Sifat</td>
                                  <td>: {selectedLetter.sifat}</td>
                                </tr>
                                <tr>
                                  <td className="pr-2 sm:pr-4 py-0.5 font-bold">Lampiran</td>
                                  <td>: -</td>
                                </tr>
                                <tr>
                                  <td className="pr-2 sm:pr-4 py-0.5 font-bold">Hal</td>
                                  <td className="font-bold uppercase underline">: Panggilan Orang Tua / Wali Murid</td>
                                </tr>
                              </tbody>
                            </table>

                            <div className="text-right shrink-0">
                              <p>
                                {profilSekolah.kotaSekolah},{' '}
                                {new Date(selectedLetter.tanggalSurat).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="mt-2 sm:mt-4 font-sans leading-snug">
                            <p>Kepada Yth.</p>
                            <p className="font-bold">Bapak / Ibu Orang Tua / Wali murid dari:</p>
                            <div className="pl-3 sm:pl-4 border-l-2 border-slate-400 my-1 font-semibold">
                              <p>Nama Siswa: <span className="font-bold text-slate-900">{st.nama}</span></p>
                              <p>Kelas / NIS: {st.kelas} / {st.nis}</p>
                              {st.namaOrangTua && <p>Orang Tua/Wali: {st.namaOrangTua}</p>}
                            </div>
                            <p>di Tempat</p>
                          </div>

                          <div className="my-2 sm:my-4 space-y-2 sm:space-y-3 text-justify font-sans">
                            <p>Dengan hormat,</p>
                            <p>
                              Sehubungan dengan pelaksanaan program layanan Bimbingan dan Konseling serta upaya pembinaan dan pendampingan perkembangan peserta didik, bersama ini kami mengharapkan kehadiran Bapak/Ibu Orang Tua/Wali Murid pada:
                            </p>

                            <table className="w-full text-left my-2 sm:my-3 sm:ml-4 border-collapse font-sans text-[9px] sm:text-xs">
                              <tbody>
                                <tr>
                                  <td className="py-0.5 sm:py-1 font-bold w-24 sm:w-36">Hari / Tanggal</td>
                                  <td className="py-0.5 sm:py-1">: {selectedLetter.hariTanggalPanggilan}</td>
                                </tr>
                                <tr>
                                  <td className="py-0.5 sm:py-1 font-bold">Waktu</td>
                                  <td className="py-0.5 sm:py-1">: {selectedLetter.waktuPanggilan}</td>
                                </tr>
                                <tr>
                                  <td className="py-0.5 sm:py-1 font-bold">Tempat</td>
                                  <td className="py-0.5 sm:py-1">: {selectedLetter.tempatPanggilan}</td>
                                </tr>
                                <tr>
                                  <td className="py-0.5 sm:py-1 font-bold">Menemui</td>
                                  <td className="py-0.5 sm:py-1">: {guru?.nama || 'Guru Bimbingan Konseling'}</td>
                                </tr>
                                <tr>
                                  <td className="py-0.5 sm:py-1 font-bold">Acara / Maksud</td>
                                  <td className="py-0.5 sm:py-1 font-semibold text-slate-900">: {selectedLetter.alasanPanggilan}</td>
                                </tr>
                              </tbody>
                            </table>

                            <p>
                              Mengingat pentingnya hal tersebut demi kebaikan dan perkembangan putra/putri Bapak/Ibu, kami sangat mengharapkan kehadiran Bapak/Ibu tepat pada waktu yang telah ditentukan.
                            </p>
                            <p>Demikian surat panggilan ini kami sampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.</p>
                          </div>

                          {/* Signatures */}
                          <div className="pt-6 sm:pt-8 flex justify-between text-center font-sans text-[9px] sm:text-xs gap-4">
                            <div className="flex-1">
                              <p className="mb-10 sm:mb-14">Guru Bimbingan Konseling,</p>
                              <p className="font-bold underline">{guru?.nama || '......................'}</p>
                              <p className="text-[8px] sm:text-[10px]">NIP. {guru?.nip || '......................'}</p>
                            </div>

                            <div className="flex-1">
                              <p className="mb-10 sm:mb-14">
                                Mengetahui,<br />Kepala Sekolah
                              </p>
                              <p className="font-bold underline">{profilSekolah.namaKepalaSekolah}</p>
                              <p className="text-[8px] sm:text-[10px]">NIP. {profilSekolah.nipKepalaSekolah}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }

                // 3. INDIVIDU - 1 LEMBAR SURAT STANDAR
                const student = muridList.find((m) => m.id === selectedLetter.studentId);

                return (
                  <div className="space-y-3 sm:space-y-4 my-1 sm:my-2">
                    <KopSuratHeader />

                    {/* Letter Header Details */}
                    <div className="flex justify-between items-start font-sans text-[9px] sm:text-xs pt-2 sm:pt-4 gap-2">
                      <table className="w-auto">
                        <tbody>
                          <tr>
                            <td className="pr-2 sm:pr-4 py-0.5 font-bold">Nomor</td>
                            <td>: {selectedLetter.nomorSurat}</td>
                          </tr>
                          <tr>
                            <td className="pr-2 sm:pr-4 py-0.5 font-bold">Sifat</td>
                            <td>: {selectedLetter.sifat}</td>
                          </tr>
                          <tr>
                            <td className="pr-2 sm:pr-4 py-0.5 font-bold">Lampiran</td>
                            <td>: -</td>
                          </tr>
                          <tr>
                            <td className="pr-2 sm:pr-4 py-0.5 font-bold">Hal</td>
                            <td className="font-bold uppercase underline">: Panggilan Orang Tua / Wali Murid</td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="text-right shrink-0">
                        <p>
                          {profilSekolah.kotaSekolah},{' '}
                          {new Date(selectedLetter.tanggalSurat).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 sm:mt-4 font-sans leading-snug">
                      <p>Kepada Yth.</p>
                      <p className="font-bold">Bapak / Ibu Orang Tua / Wali murid dari:</p>
                      <div className="pl-3 sm:pl-4 border-l-2 border-slate-400 my-1 font-semibold">
                        <p>Nama Siswa: <span className="font-bold text-slate-900">{student?.nama}</span></p>
                        <p>Kelas / NIS: {student?.kelas} / {student?.nis}</p>
                        {student?.namaOrangTua && <p>Orang Tua/Wali: {student?.namaOrangTua}</p>}
                      </div>
                      <p>di Tempat</p>
                    </div>

                    <div className="my-2 sm:my-4 space-y-2 sm:space-y-3 text-justify font-sans">
                      <p>Dengan hormat,</p>
                      <p>
                        Sehubungan dengan pelaksanaan program layanan Bimbingan dan Konseling serta upaya pembinaan dan pendampingan perkembangan peserta didik, bersama ini kami mengharapkan kehadiran Bapak/Ibu Orang Tua/Wali Murid pada:
                      </p>

                      <table className="w-full text-left my-2 sm:my-3 sm:ml-4 border-collapse font-sans text-[9px] sm:text-xs">
                        <tbody>
                          <tr>
                            <td className="py-0.5 sm:py-1 font-bold w-24 sm:w-36">Hari / Tanggal</td>
                            <td className="py-0.5 sm:py-1">: {selectedLetter.hariTanggalPanggilan}</td>
                          </tr>
                          <tr>
                            <td className="py-0.5 sm:py-1 font-bold">Waktu</td>
                            <td className="py-0.5 sm:py-1">: {selectedLetter.waktuPanggilan}</td>
                          </tr>
                          <tr>
                            <td className="py-0.5 sm:py-1 font-bold">Tempat</td>
                            <td className="py-0.5 sm:py-1">: {selectedLetter.tempatPanggilan}</td>
                          </tr>
                          <tr>
                            <td className="py-0.5 sm:py-1 font-bold">Menemui</td>
                            <td className="py-0.5 sm:py-1">: {guru?.nama || 'Guru Bimbingan Konseling'}</td>
                          </tr>
                          <tr>
                            <td className="py-0.5 sm:py-1 font-bold">Acara / Maksud</td>
                            <td className="py-0.5 sm:py-1 font-semibold text-slate-900">: {selectedLetter.alasanPanggilan}</td>
                          </tr>
                        </tbody>
                      </table>

                      <p>
                        Mengingat pentingnya hal tersebut demi kebaikan dan perkembangan putra/putri Bapak/Ibu, kami sangat mengharapkan kehadiran Bapak/Ibu tepat pada waktu yang telah ditentukan.
                      </p>
                      <p>Demikian surat panggilan ini kami sampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.</p>
                    </div>

                    {/* Signatures */}
                    <div className="pt-6 sm:pt-8 flex justify-between text-center font-sans text-[9px] sm:text-xs gap-4">
                      <div className="flex-1">
                        <p className="mb-10 sm:mb-14">Guru Bimbingan Konseling,</p>
                        <p className="font-bold underline">{guru?.nama || '......................'}</p>
                        <p className="text-[8px] sm:text-[10px]">NIP. {guru?.nip || '......................'}</p>
                      </div>

                      <div className="flex-1">
                        <p className="mb-10 sm:mb-14">
                          Mengetahui,<br />Kepala Sekolah
                        </p>
                        <p className="font-bold underline">{profilSekolah.namaKepalaSekolah}</p>
                        <p className="text-[8px] sm:text-[10px]">NIP. {profilSekolah.nipKepalaSekolah}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal - Delete Surat Panggilan */}
      {deletingLetterId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hapus Surat Panggilan</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Apakah Anda yakin ingin menghapus surat panggilan ini dari database?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingLetterId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSuratPanggilan(deletingLetterId);
                  setDeletingLetterId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING DOCKED PILL FOR MINIMIZED PREVIEW */}
      {selectedLetter && isPreviewMinimized && (
        <div className="fixed bottom-4 left-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <p className="font-bold">
                {selectedLetter.tipePanggilan === 'Kolektif' ? 'Surat Panggilan Kolektif' : 'Surat Panggilan Orang Tua'}
              </p>
              <p className="text-[10px] text-slate-300 max-w-[130px] truncate">
                {selectedLetter.tipePanggilan === 'Kolektif'
                  ? `${(selectedLetter.studentIds || []).length} Siswa Terdaftar`
                  : muridList.find((m) => m.id === selectedLetter.studentId)?.nama || 'Siswa'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
            <button
              onClick={() => setIsPreviewMinimized(false)}
              className="p-1.5 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Buka / Pulihkan"
            >
              <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Buka</span>
            </button>
            <button
              onClick={() => {
                setIsPreviewMinimized(false);
                setSelectedLetter(null);
              }}
              className="p-1.5 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 rounded-lg cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
