import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { SuratTugas as ISuratTugas } from '../types';
import {
  Award,
  Plus,
  Printer,
  Trash2,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  FileText,
  Download,
  Minus,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import { KopSuratHeader } from './KopSuratHeader';
import { exportElementToPdf, triggerPrintModal } from '../utils/pdfExport';

export const SuratTugasView: React.FC = () => {
  const {
    suratTugasList,
    addSuratTugas,
    deleteSuratTugas,
    guruBkList,
    muridList,
    profilSekolah,
  } = useDb();

  const [showForm, setShowForm] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<ISuratTugas | null>(null);
  const [isPreviewMinimized, setIsPreviewMinimized] = useState(false);
  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false);
  const [deletingTaskLetterId, setDeletingTaskLetterId] = useState<string | null>(null);

  // Activity type category for preset
  const [jenisKategori, setJenisKategori] = useState<string>('Home Visit');
  const [selectedMuridId, setSelectedMuridId] = useState<string>('');

  // Form states
  const [nomorSurat, setNomorSurat] = useState(
    `0${Math.floor(Math.random() * 90) + 10}/ST-BK/${new Date().toLocaleDateString('id-ID', { month: '2-digit' })}/${new Date().getFullYear()}`
  );
  const [tanggalSurat, setTanggalSurat] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [menimbang, setMenimbang] = useState(
    'Bahwa dalam rangka efektivitas pelaksanaan layanan Bimbingan dan Konseling, penanganan masalah perkembangan peserta didik, serta pendampingan langsung keluarga.'
  );
  const [mengingat, setMengingat] = useState(
    '1. Undang-Undang No. 20 Tahun 2003 tentang Sistem Pendidikan Nasional.\n2. Permendikbud No. 111 Tahun 2014 tentang Bimbingan dan Konseling pada Pendidikan Dasar dan Pendidikan Menengah.\n3. Program Kerja Tahunan Bimbingan dan Konseling Sekolah.'
  );

  const [selectedGuruIds, setSelectedGuruIds] = useState<string[]>([
    guruBkList[0]?.id || '',
  ]);
  const [maksudTujuan, setMaksudTujuan] = useState(
    'Melaksanakan Kunjungan Rumah (Home Visit) untuk koordinasi dengan orang tua/wali serta tindak lanjut pendampingan konseling peserta didik.'
  );
  const [tempatPelaksanaan, setTempatPelaksanaan] = useState(
    'Kediaman Orang Tua / Wali Murid'
  );
  const [tanggalPelaksanaan, setTanggalPelaksanaan] = useState(
    new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  );
  const [dikeluarkanDi, setDikeluarkanDi] = useState(
    profilSekolah.kotaSekolah || 'Jakarta'
  );

  // Preset Applicator
  const applyPreset = (presetType: string, muridId?: string) => {
    setJenisKategori(presetType);

    const m = muridList.find((student) => student.id === (muridId || selectedMuridId));
    const namaSiswaStr = m ? `a.n. ${m.nama} (Kelas ${m.kelas}, NIS: ${m.nis})` : 'peserta didik yang bersangkutan';
    const alamatStr = m && m.alamat && m.alamat !== '-' ? m.alamat : 'Kediaman Orang Tua / Wali Murid';

    if (presetType === 'Home Visit') {
      setMenimbang('Bahwa dalam rangka penanganan masalah belajar/perilaku dan pendampingan intensif peserta didik, dipandang perlu melaksanakan kunjungan rumah (Home Visit) oleh Guru BK.');
      setMaksudTujuan(`Melaksanakan kegiatan Kunjungan Rumah (Home Visit) dalam proses bimbingan dan konseling untuk koordinasi dengan orang tua/wali murid ${namaSiswaStr}.`);
      setTempatPelaksanaan(alamatStr);
    } else if (presetType === 'Referral') {
      setMenimbang('Bahwa demi penanganan kesehatan mental/psikologis peserta didik secara komprehensif, dipandang perlu mendampingi rujukan konseling spesialis (Referral).');
      setMaksudTujuan(`Pendampingan rujukan layanan konseling psikologis / medis spesialis bagi peserta didik ${namaSiswaStr}.`);
      setTempatPelaksanaan('Layanan Psikologi / Pusat Kesehatan / Dinas Terkait');
    } else if (presetType === 'Case Conference') {
      setMenimbang('Bahwa untuk menyelesaikan permasalahan kompleks peserta didik secara kolaboratif, dipandang perlu mengadakan Konferensi Kasus (Case Conference) BK.');
      setMaksudTujuan(`Menghadiri & memimpin Konferensi Kasus (Case Conference) Bimbingan Konseling membahas perkembangan belajar dan solusi masalah ${namaSiswaStr}.`);
      setTempatPelaksanaan('Ruang Konseling / Ruang Rapat Sekolah');
    } else if (presetType === 'MGBK') {
      setMenimbang('Bahwa dalam rangka peningkatan kompetensi dan profesionalisme Guru Bimbingan dan Konseling, dipandang perlu menugaskan Guru BK mengikuti kegiatan dinas MGBK / Workshop.');
      setMaksudTujuan('Mengikuti Kegiatan Musyawarah Guru Bimbingan Konseling (MGBK) / Workshop Pengembangan Media & Strategi Layanan BK.');
      setTempatPelaksanaan('Gedung Pertemuan / LPMP / Sekolah Host MGBK');
    }
  };

  const handleToggleGuru = (guruId: string) => {
    if (selectedGuruIds.includes(guruId)) {
      if (selectedGuruIds.length > 1) {
        setSelectedGuruIds(selectedGuruIds.filter((id) => id !== guruId));
      }
    } else {
      setSelectedGuruIds([...selectedGuruIds, guruId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGuruIds.length === 0) {
      alert('Pilih setidaknya 1 Guru BK!');
      return;
    }

    const newSurat: Omit<ISuratTugas, 'id' | 'createdAt'> = {
      nomorSurat,
      tanggalSurat,
      menimbang,
      mengingat,
      ditugaskanGuruBkIds: selectedGuruIds,
      maksudTujuan,
      tempatPelaksanaan,
      tanggalPelaksanaan,
      dikeluarkanDi,
    };

    addSuratTugas(newSurat);
    setShowForm(false);
    alert('Surat Tugas Guru BK berhasil diterbitkan!');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
              PDF Generator & Print
            </span>
            <span className="text-xs text-slate-400">• Dinas / Kepegawaian BK</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Cetak Surat Tugas Guru Bimbingan Konseling
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Penerbitan surat tugas resmi dari Kepala Sekolah untuk kegiatan dinas, homevisit, atau pelatihan Guru BK.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Tutup Form' : '+ Buat Surat Tugas Baru'}</span>
        </button>
      </div>

      {/* FORM SURAT TUGAS */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <h3 className="font-bold text-sm text-slate-900">
              Form Penerbitan Surat Tugas Kegiatan BK
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Pilih preset kegiatan untuk mengisi otomatis
            </span>
          </div>

          {/* Quick Preset Activity Selector */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2.5">
            <p className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
              <span>🎯 Preset Jenis Kegiatan BK:</span>
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('Home Visit')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                  jenisKategori === 'Home Visit'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                    : 'bg-white border-indigo-200 text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                🏡 Kunjungan Rumah (Home Visit BK)
              </button>

              <button
                type="button"
                onClick={() => applyPreset('Referral')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                  jenisKategori === 'Referral'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                    : 'bg-white border-indigo-200 text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                🏥 Rujukan Spesialis (Referral Konseling)
              </button>

              <button
                type="button"
                onClick={() => applyPreset('Case Conference')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                  jenisKategori === 'Case Conference'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                    : 'bg-white border-indigo-200 text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                👥 Konferensi Kasus (Case Conference)
              </button>

              <button
                type="button"
                onClick={() => applyPreset('MGBK')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                  jenisKategori === 'MGBK'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                    : 'bg-white border-indigo-200 text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                🎓 Dinas MGBK / Workshop BK
              </button>
            </div>

            {/* Optional Student Picker for Home Visit / Referral / Case Conference */}
            {(jenisKategori === 'Home Visit' || jenisKategori === 'Referral' || jenisKategori === 'Case Conference') && (
              <div className="pt-2 border-t border-indigo-100 flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="font-semibold text-indigo-900 shrink-0">
                  Pilih Siswa Terkait:
                </label>
                <select
                  value={selectedMuridId}
                  onChange={(e) => {
                    setSelectedMuridId(e.target.value);
                    applyPreset(jenisKategori, e.target.value);
                  }}
                  className="p-2 bg-white border border-indigo-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 flex-1"
                >
                  <option value="">-- Pilih Siswa (Opsional / Otomatis ke Teks) --</option>
                  {muridList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama} - Kelas {m.kelas} ({m.alamat || 'Alamat Belum Terisi'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Surat Tugas *</label>
              <input
                type="text"
                required
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Terbit *</label>
              <input
                type="date"
                required
                value={tanggalSurat}
                onChange={(e) => setTanggalSurat(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kota Penerbitan</label>
              <input
                type="text"
                value={dikeluarkanDi}
                onChange={(e) => setDikeluarkanDi(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Pilih Guru BK yang Ditugaskan *
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              {guruBkList.map((g) => {
                const isSelected = selectedGuruIds.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleToggleGuru(g.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{g.nama}</span>
                    {isSelected && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Menimbang (Pertimbangan)</label>
            <textarea
              rows={2}
              value={menimbang}
              onChange={(e) => setMenimbang(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mengingat (Landasan Hukum)</label>
            <textarea
              rows={3}
              value={mengingat}
              onChange={(e) => setMengingat(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Maksud / Uraian Tugas Kegiatan *
            </label>
            <textarea
              rows={2}
              required
              value={maksudTujuan}
              onChange={(e) => setMaksudTujuan(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tempat / Lokasi *</label>
              <input
                type="text"
                required
                value={tempatPelaksanaan}
                onChange={(e) => setTempatPelaksanaan(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Pelaksanaan *</label>
              <input
                type="text"
                required
                value={tanggalPelaksanaan}
                onChange={(e) => setTanggalPelaksanaan(e.target.value)}
                placeholder="e.g. 10 - 12 Agustus 2026"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md shadow-emerald-600/20"
            >
              Terbitkan Surat Tugas
            </button>
          </div>
        </form>
      )}

      {/* HISTORY TABLE SURAT TUGAS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Arsip Surat Tugas Guru BK ({suratTugasList.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Nomor & Tanggal</th>
                <th className="py-3.5 px-4">Guru BK Ditugaskan</th>
                <th className="py-3.5 px-4">Maksud / Uraian Tugas</th>
                <th className="py-3.5 px-4">Lokasi & Pelaksanaan</th>
                <th className="py-3.5 px-4 text-center">Cetak PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {suratTugasList.length > 0 ? (
                suratTugasList.map((st) => {
                  const assignedGurus = guruBkList.filter((g) =>
                    st.ditugaskanGuruBkIds.includes(g.id)
                  );

                  return (
                    <tr key={st.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-slate-900">{st.nomorSurat}</div>
                        <div className="text-[10px] text-slate-500">Tgl: {st.tanggalSurat}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {assignedGurus.map((g) => g.nama).join(', ')}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs line-clamp-2">{st.maksudTujuan}</td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{st.tempatPelaksanaan}</div>
                        <div className="text-[10px] text-slate-500">{st.tanggalPelaksanaan}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => {
                              setIsPreviewMinimized(false);
                              setIsPreviewMaximized(false);
                              setSelectedLetter(st);
                            }}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] shadow-sm cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Pratinjau / PDF</span>
                          </button>
                          <button
                            onClick={() => setDeletingTaskLetterId(st.id)}
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
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    Belum ada surat tugas diterbitkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINTABLE SURAT TUGAS PDF MODAL */}
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
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-slate-200 no-print gap-2 sm:gap-3 ${
                isPreviewMaximized ? 'p-3 sm:p-4 bg-slate-900 text-white rounded-none' : ''
              }`}
            >
              <h3 className="font-extrabold text-xs sm:text-base text-slate-900 truncate">
                Hasil Cetak Surat Tugas Resmi
              </h3>
              <div className="flex items-center justify-between sm:justify-end space-x-1.5 sm:space-x-2 flex-wrap gap-y-1.5">
                <button
                  onClick={() =>
                    exportElementToPdf(
                      'printable-surat-tugas',
                      `Surat_Tugas_${selectedLetter.jenisTugas.replace(/\s+/g, '_')}.pdf`
                    )
                  }
                  className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] sm:text-xs font-bold inline-flex items-center space-x-1 shadow transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
                <button
                  onClick={() => triggerPrintModal('printable-surat-tugas')}
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
                    title={isPreviewMaximized ? 'Restore / Normal (Kembalikan Ukuran)' : 'Maximize (Perbesar Layar Penuh)'}
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

            {/* Printable Document Body */}
            <div
              id="printable-surat-tugas"
              className="p-3 sm:p-6 md:p-8 bg-white font-serif text-slate-900 text-[10px] sm:text-xs leading-normal sm:leading-relaxed overflow-y-auto"
            >
              <KopSuratHeader />

              <div className="text-center font-serif uppercase my-2 sm:my-4">
                <h2 className="text-sm sm:text-base font-bold underline tracking-widest text-slate-900">
                  SURAT TUGAS
                </h2>
                <p className="font-sans text-[10px] sm:text-xs mt-0.5 text-slate-800">
                  Nomor: {selectedLetter.nomorSurat}
                </p>
              </div>

              {(() => {
                const assignedGurus = guruBkList.filter((g) =>
                  selectedLetter.ditugaskanGuruBkIds.includes(g.id)
                );

                return (
                  <div className="space-y-3 sm:space-y-4 my-3 sm:my-6 font-sans text-[10px] sm:text-xs">
                    {/* Kepala Sekolah assigns */}
                    <p className="text-justify">
                      Kepala {profilSekolah.namaSekolah} dengan ini menugaskan kepada pegawai / Guru Bimbingan Konseling di bawah ini:
                    </p>

                    {/* Table of Assigned Counselors */}
                    <div className="overflow-x-auto -mx-1 sm:mx-0">
                      <table className="w-full border-collapse border border-slate-300 text-left my-2 sm:my-3 min-w-[300px]">
                        <thead className="bg-slate-100 font-bold">
                          <tr>
                            <th className="p-1.5 sm:p-2 border border-slate-300 w-8 sm:w-10 text-center">No</th>
                            <th className="p-1.5 sm:p-2 border border-slate-300">Nama / NIP</th>
                            <th className="p-1.5 sm:p-2 border border-slate-300">Jabatan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignedGurus.map((g, idx) => (
                            <tr key={g.id}>
                              <td className="p-1.5 sm:p-2 border border-slate-300 text-center font-bold">
                                {idx + 1}
                              </td>
                              <td className="p-1.5 sm:p-2 border border-slate-300">
                                <p className="font-bold">{g.nama}</p>
                                <p className="text-[9px] sm:text-[10px] text-slate-600">NIP. {g.nip}</p>
                              </td>
                              <td className="p-1.5 sm:p-2 border border-slate-300">{g.jabatan}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <p className="font-bold">Untuk melaksanakan tugas / kegiatan:</p>
                      <table className="w-full text-left sm:ml-2 text-[10px] sm:text-xs">
                        <tbody>
                          <tr>
                            <td className="py-0.5 sm:py-1 font-bold w-28 sm:w-36 align-top">Maksud & Tujuan</td>
                            <td className="py-0.5 sm:py-1 font-semibold align-top">: {selectedLetter.maksudTujuan}</td>
                          </tr>
                          <tr>
                            <td className="py-0.5 sm:py-1 font-bold align-top">Tempat / Lokasi</td>
                            <td className="py-0.5 sm:py-1 align-top">: {selectedLetter.tempatPelaksanaan}</td>
                          </tr>
                          <tr>
                            <td className="py-0.5 sm:py-1 font-bold align-top">Tanggal Pelaksanaan</td>
                            <td className="py-0.5 sm:py-1 align-top">: {selectedLetter.tanggalPelaksanaan}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p className="text-justify pt-1 sm:pt-2">
                      Demikian Surat Tugas ini diterbitkan untuk dilaksanakan dengan penuh rasa tanggung jawab, dan melaporkan hasilnya setelah pelaksanaan tugas selesai.
                    </p>

                    {/* Signature */}
                    <div className="pt-6 sm:pt-10 flex justify-end text-center font-sans text-[10px] sm:text-xs">
                      <div>
                        <p>
                          Dikeluarkan di: {selectedLetter.dikeluarkanDi}
                          <br />
                          Pada tanggal:{' '}
                          {new Date(selectedLetter.tanggalSurat).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="my-8 sm:my-10">
                          Kepala Sekolah,
                        </p>
                        <p className="font-bold underline">{profilSekolah.namaKepalaSekolah}</p>
                        <p className="text-[9px] sm:text-[10px]">NIP. {profilSekolah.nipKepalaSekolah}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal - Delete Surat Tugas */}
      {deletingTaskLetterId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hapus Surat Tugas</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Apakah Anda yakin ingin menghapus surat tugas ini dari database?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTaskLetterId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSuratTugas(deletingTaskLetterId);
                  setDeletingTaskLetterId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition"
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
            <Award className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <p className="font-bold">Pratinjau Surat Tugas</p>
              <p className="text-[10px] text-slate-300 max-w-[130px] truncate">
                {selectedLetter.jenisTugas}
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
