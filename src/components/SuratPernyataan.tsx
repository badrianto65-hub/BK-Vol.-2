import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { SuratPernyataan as ISuratPernyataan, TipeSuratPernyataan } from '../types';
import {
  FileCheck2,
  Plus,
  Printer,
  Trash2,
  Edit2,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Minus,
  Maximize2,
  Minimize2,
  FileText,
  User,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';
import { KopSuratHeader } from './KopSuratHeader';
import { exportElementToPdf, triggerPrintModal } from '../utils/pdfExport';

export const SuratPernyataanView: React.FC = () => {
  const {
    suratPernyataanList,
    addSuratPernyataan,
    updateSuratPernyataan,
    deleteSuratPernyataan,
    muridList,
    guruBkList,
    profilSekolah,
  } = useDb();

  const [showForm, setShowForm] = useState(false);
  const [formTab, setFormTab] = useState<'form' | 'preview'>('form');
  const [isFormMinimized, setIsFormMinimized] = useState(false);
  const [isFormMaximized, setIsFormMaximized] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<ISuratPernyataan | null>(null);
  const [isPreviewMinimized, setIsPreviewMinimized] = useState(false);
  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false);

  const [deletingLetterId, setDeletingLetterId] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipe, setFilterTipe] = useState<string>('Semua');

  // Form State
  const [studentId, setStudentId] = useState<string>(muridList[0]?.id || '');
  const [guruBkId, setGuruBkId] = useState<string>(guruBkList[0]?.id || '');
  const [nomorSurat, setNomorSurat] = useState(
    `0${Math.floor(Math.random() * 90) + 10}/SPNY-BK/${profilSekolah.npsn || 'SEKOLAH'}/${new Date().getFullYear()}`
  );
  const [tanggalSurat, setTanggalSurat] = useState(new Date().toISOString().slice(0, 10));
  const [tipePernyataan, setTipePernyataan] = useState<TipeSuratPernyataan>('Kedisiplinan & Tata Tertib');
  const [judulPernyataan, setJudulPernyataan] = useState('SURAT PERNYATAAN SISWA MENTAATI TATA TERTIB SEKOLAH');
  const [poinPernyataan, setPoinPernyataan] = useState<string[]>([
    'Mematuhi dan melaksanakan seluruh peraturan serta tata tertib yang berlaku di sekolah.',
    'Hadir tepat waktu sebelum bel masuk sekolah dan tidak meninggalkan lingkungan sekolah tanpa izin resmi.',
    'Menggunakan seragam sekolah lengkap beserta atribut sesuai ketentuan hari yang ditetapkan.',
    'Menjaga ketertiban, sopan santun, serta menghormati Bapak/Ibu Guru, Staf, dan sesama teman.',
    'Tidak melakukan perundungan (bullying), tindakan kekerasan, ataupun perbuatan merusak fasilitas sekolah.',
  ]);
  const [sanksiKonsekuensi, setSanksiKonsekuensi] = useState(
    'Apabila di kemudian hari saya terbukti melanggar butir-butir pernyataan di atas, saya bersedia menerima sanksi tegas dari pihak sekolah sesuai tingkatan aturan yang berlaku, sampai dengan dikembalikan kepada orang tua/wali murid.'
  );
  const [pembuatPernyataan, setPembuatPernyataan] = useState<'Siswa' | 'Orang Tua / Wali' | 'Siswa & Orang Tua'>(
    'Siswa & Orang Tua'
  );
  const [dikeluarkanDi, setDikeluarkanDi] = useState(profilSekolah.kotaSekolah || 'Kota Sekolah');
  const [butuhMaterai, setButuhMaterai] = useState(true);
  const [catatanTambahan, setCatatanTambahan] = useState(
    'Demikian surat pernyataan ini saya buat dengan penuh kesadaran tanpa paksaan dari pihak manapun.'
  );

  // Preset Template Loader
  const applyPresetTemplate = (type: TipeSuratPernyataan) => {
    setTipePernyataan(type);
    if (type === 'Kedisiplinan & Tata Tertib') {
      setJudulPernyataan('SURAT PERNYATAAN SISWA MENTAATI TATA TERTIB SEKOLAH');
      setPoinPernyataan([
        'Mematuhi dan melaksanakan seluruh peraturan serta tata tertib yang berlaku di sekolah.',
        'Hadir tepat waktu sebelum bel masuk sekolah dan tidak meninggalkan lingkungan sekolah tanpa izin.',
        'Menggunakan seragam sekolah lengkap beserta atribut resmi sesuai ketentuan hari.',
        'Menjaga ketertiban, sopan santun, serta menghormati Bapak/Ibu Guru, Staf, dan sesama teman.',
        'Tidak membawa atau merokok, membawa barang terlarang, serta merusak fasilitas sekolah.',
      ]);
    } else if (type === 'Perbaikan Kehadiran & Presensi') {
      setJudulPernyataan('SURAT PERNYATAAN KOMITMEN KEHADIRAN DAN PRESENSI BELAJAR');
      setPoinPernyataan([
        'Hadir secara konsisten setiap hari efektif sekolah tepat waktu pukul 07.00 WIB.',
        'Tidak akan membolos, alpha, atau meninggalkan jam pelajaran tanpa surat izin resmi dari pihak sekolah.',
        'Apabila berhalangan hadir karena sakit/izin, akan menyertakan surat keterangan medis atau surat orang tua.',
        'Mengikuti seluruh kegiatan pembelajaran dan ekstrakurikuler wajib sesuai jadwal.',
      ]);
    } else if (type === 'Komitmen Belajar & Akademik') {
      setJudulPernyataan('SURAT PERNYATAAN KOMITMEN PENINGKATAN PRESTASI BELAJAR');
      setPoinPernyataan([
        'Bersungguh-sungguh dalam mengikuti proses Bimbingan dan Pembelajaran di kelas.',
        'Mengerjakan dan mengumpulkan seluruh tugas serta penilaian harian tepat waktu.',
        'Bersedia mengikuti bimbingan remedial atau pengayaan yang dijadwalkan oleh guru.',
        'Proaktif berkoordinasi dengan Guru BK dan Wali Kelas terkait perkembangan belajar.',
      ]);
    } else if (type === 'Pernyataan Bebas Perundungan (Bullying)') {
      setJudulPernyataan('SURAT PERNYATAAN BEBAS PERUNDUNGAN (ANTI-BULLYING)');
      setPoinPernyataan([
        'Tidak akan melakukan tindakan perundungan (bullying) secara fisik, verbal, maupun siber (cyberbullying).',
        'Saling menghargai dan menciptakan suasana belajar yang aman, nyaman, dan damai bagi sesama siswa.',
        'Tidak menghimpun atau ikut serta dalam geng/kelompok negatif yang meresahkan lingkungan sekolah.',
        'Siap menjadi pelopor kebaikan dan melaporkan perbuatan perundungan kepada tim BK/Guru.',
      ]);
    } else if (type === 'Pernyataan Orang Tua / Wali') {
      setJudulPernyataan('SURAT PERNYATAAN DUKUNGAN DAN PENDAMPINGAN ORANG TUA/WALI');
      setPoinPernyataan([
        'Memberikan perhatian, pengawasan, dan bimbingan penuh kepada putra/putri kami di rumah.',
        'Memastikan putra/putri kami berangkat ke sekolah tepat waktu dengan atribut lengkap.',
        'Bersedia hadir dan berkoordinasi dengan Pihak Bimbingan Konseling (BK) apabila diperlukan.',
        'Mendukung seluruh program pendidikan dan pembinaan karakter yang diterapkan sekolah.',
      ]);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormTab('form');
    setIsFormMinimized(false);
    setIsFormMaximized(false);
    setStudentId(muridList[0]?.id || '');
    setGuruBkId(guruBkList[0]?.id || '');
    setNomorSurat(
      `0${Math.floor(Math.random() * 90) + 10}/SPNY-BK/${profilSekolah.npsn || 'SEKOLAH'}/${new Date().getFullYear()}`
    );
    setTanggalSurat(new Date().toISOString().slice(0, 10));
    applyPresetTemplate('Kedisiplinan & Tata Tertib');
    setDikeluarkanDi(profilSekolah.kotaSekolah || 'Kota Sekolah');
    setButuhMaterai(true);
    setShowForm(true);
  };

  const handleOpenEditModal = (letter: ISuratPernyataan) => {
    setEditingId(letter.id);
    setFormTab('form');
    setIsFormMinimized(false);
    setIsFormMaximized(false);
    setStudentId(letter.studentId);
    setGuruBkId(letter.guruBkId);
    setNomorSurat(letter.nomorSurat);
    setTanggalSurat(letter.tanggalSurat);
    setTipePernyataan(letter.tipePernyataan);
    setJudulPernyataan(letter.judulPernyataan);
    setPoinPernyataan(letter.poinPernyataan || []);
    setSanksiKonsekuensi(letter.sanksiKonsekuensi || '');
    setPembuatPernyataan(letter.pembuatPernyataan || 'Siswa & Orang Tua');
    setDikeluarkanDi(letter.dikeluarkanDi || profilSekolah.kotaSekolah || 'Kota Sekolah');
    setButuhMaterai(letter.butuhMaterai ?? true);
    setCatatanTambahan(letter.catatanTambahan || '');
    setShowForm(true);
  };

  const handleAddPoin = () => {
    setPoinPernyataan([...poinPernyataan, '']);
  };

  const handleUpdatePoin = (index: number, val: string) => {
    const updated = [...poinPernyataan];
    updated[index] = val;
    setPoinPernyataan(updated);
  };

  const handleRemovePoin = (index: number) => {
    setPoinPernyataan(poinPernyataan.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      alert('Pilih siswa terlebih dahulu!');
      return;
    }
    const cleanPoin = poinPernyataan.filter((p) => p.trim().length > 0);
    if (cleanPoin.length === 0) {
      alert('Masukkan minimal satu poin pernyataan!');
      return;
    }

    const payload: Omit<ISuratPernyataan, 'id' | 'createdAt'> = {
      nomorSurat,
      tanggalSurat,
      studentId,
      guruBkId,
      tipePernyataan,
      judulPernyataan,
      poinPernyataan: cleanPoin,
      sanksiKonsekuensi,
      pembuatPernyataan,
      dikeluarkanDi,
      butuhMaterai,
      catatanTambahan,
    };

    if (editingId) {
      updateSuratPernyataan(editingId, payload);
      alert('Surat Pernyataan berhasil diperbarui!');
    } else {
      addSuratPernyataan(payload);
      alert('Surat Pernyataan berhasil diterbitkan!');
    }

    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteSuratPernyataan(id);
    setDeletingLetterId(null);
  };

  // Filtered List
  const filteredList = suratPernyataanList.filter((s) => {
    const student = muridList.find((m) => m.id === s.studentId);
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      s.nomorSurat.toLowerCase().includes(searchLower) ||
      s.judulPernyataan.toLowerCase().includes(searchLower) ||
      (student &&
        (student.nama.toLowerCase().includes(searchLower) ||
          student.nis.toLowerCase().includes(searchLower) ||
          student.kelas.toLowerCase().includes(searchLower)));

    const matchFilter = filterTipe === 'Semua' || s.tipePernyataan === filterTipe;

    return matchSearch && matchFilter;
  });

  // Selected student & guru for modal print
  const printStudent = selectedLetter ? muridList.find((m) => m.id === selectedLetter.studentId) : null;
  const printGuru = selectedLetter ? guruBkList.find((g) => g.id === selectedLetter.guruBkId) : null;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              PDF Document Generator
            </span>
            <span className="text-xs text-slate-400">• Terintegrasi Master Data</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Manajemen & Cetak Surat Pernyataan Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Buat, kelola, dan cetak surat pernyataan resmi (Kedisiplinan, Kehadiran, Komitmen Belajar, Anti-Bullying) lengkap dengan Kop Surat resmi sekolah.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Surat Pernyataan</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari siswa, NIS, atau no. surat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Tipe Surat:</span>
          <select
            value={filterTipe}
            onChange={(e) => setFilterTipe(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="Semua">Semua Tipe Pernyataan</option>
            <option value="Kedisiplinan & Tata Tertib">Kedisiplinan & Tata Tertib</option>
            <option value="Perbaikan Kehadiran & Presensi">Perbaikan Kehadiran</option>
            <option value="Komitmen Belajar & Akademik">Komitmen Belajar</option>
            <option value="Pernyataan Bebas Perundungan (Bullying)">Bebas Bullying</option>
            <option value="Pernyataan Orang Tua / Wali">Pernyataan Orang Tua</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      {/* Surat List */}
      {filteredList.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <FileCheck2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Belum Ada Surat Pernyataan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Klik tombol "Buat Surat Pernyataan" di atas untuk menerbitkan dokumen pernyataan baru yang otomatis terintegrasi dengan Data Master.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((letter) => {
            const student = muridList.find((m) => m.id === letter.studentId);
            const guru = guruBkList.find((g) => g.id === letter.guruBkId);

            return (
              <div
                key={letter.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Badge & Date */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase border border-emerald-200">
                      {letter.tipePernyataan}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(letter.tanggalSurat).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Letter Title & Number */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {letter.judulPernyataan}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                      No: {letter.nomorSurat}
                    </p>
                  </div>

                  {/* Student Details Card */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{student?.nama || 'Siswa Terhapus'}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px]">
                        Kelas {student?.kelas || '-'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>NIS: {student?.nis || '-'}</span>
                      <span>Orang Tua: {student?.namaOrangTua || '-'}</span>
                    </div>
                  </div>

                  {/* Details Summary */}
                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Pembimbing: <strong>{guru?.nama || 'Guru BK'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Total {letter.poinPernyataan?.length || 0} Poin Komitmen Pernyataan</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(letter)}
                      className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      title="Edit Data"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingLetterId(letter.id)}
                      className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      title="Hapus Surat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Hapus</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setIsPreviewMinimized(false);
                      setIsPreviewMaximized(false);
                      setSelectedLetter(letter);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak / PDF</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT FORM MODAL */}
      {showForm && !isFormMinimized && (
        <div
          className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center overflow-y-auto ${
            isFormMaximized ? 'p-0' : 'p-3 sm:p-4'
          }`}
        >
          <div
            className={`bg-white shadow-2xl border border-slate-200 flex flex-col transition-all duration-200 ${
              isFormMaximized
                ? 'w-full h-full rounded-none max-h-none overflow-y-auto'
                : 'rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 bg-white z-20 ${
                isFormMaximized ? 'rounded-none' : 'rounded-t-3xl'
              }`}
            >
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-emerald-600" />
                  <span>{editingId ? 'Edit Surat Pernyataan' : 'Buat Surat Pernyataan Baru'}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Isi formulir pernyataan resmi. Data terintegrasi penuh dengan Data Master.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Form vs Preview Mode Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setFormTab('form')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      formTab === 'form'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Formulir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTab('preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      formTab === 'preview'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Pratinjau Live PDF</span>
                  </button>
                </div>

                {/* Window Control Buttons: Minimize, Maximize/Restore, Close */}
                <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsFormMinimized(true)}
                    className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition cursor-pointer"
                    title="Minimize (Kecilkan ke Dock)"
                    aria-label="Minimize"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFormMaximized(!isFormMaximized)}
                    className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition cursor-pointer"
                    title={isFormMaximized ? 'Restore / Normal (Kembalikan Ukuran)' : 'Maximize (Perbesar Layar Penuh)'}
                    aria-label="Maximize"
                  >
                    {isFormMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-rose-100 hover:text-rose-600 text-slate-500 rounded-lg transition cursor-pointer"
                    title="Tutup (Close)"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {formTab === 'preview' ? (
              /* LIVE FULL PREVIEW MODE IN MODAL */
              <div className="p-6 bg-slate-100 space-y-4">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Pratinjau Langsung (Real-time Preview):</strong> Dokumen ini diperbarui secara otomatis berdasarkan data yang Anda isi di tab Formulir.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormTab('form')}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shrink-0 cursor-pointer"
                  >
                    Kembali ke Formulir
                  </button>
                </div>

                {/* Render Full Live Paper Preview */}
                <div className="bg-white p-8 md:p-12 rounded-2xl shadow-md border border-slate-300 font-serif text-slate-900 leading-relaxed max-w-[210mm] mx-auto">
                  <KopSuratHeader />

                  <div className="text-center my-6">
                    <h2 className="text-base font-bold tracking-wide uppercase border-b-2 border-slate-900 inline-block pb-0.5 px-4 font-sans">
                      {judulPernyataan || 'SURAT PERNYATAAN'}
                    </h2>
                    <p className="text-xs font-mono text-slate-800 mt-1">
                      Nomor: {nomorSurat || '000/SPNY-BK/2026'}
                    </p>
                  </div>

                  {(() => {
                    const activeStudent = muridList.find((m) => m.id === studentId);
                    const activeGuru = guruBkList.find((g) => g.id === guruBkId);

                    return (
                      <div className="text-xs md:text-sm space-y-3 text-justify">
                        <p>Yang bertanda tangan di bawah ini:</p>

                        <div className="pl-4 md:pl-6 space-y-1 font-sans text-xs md:text-sm">
                          <div className="grid grid-cols-12 gap-2">
                            <span className="col-span-4 font-semibold">Nama Siswa</span>
                            <span className="col-span-8">: {activeStudent?.nama || '................................'}</span>
                          </div>
                          <div className="grid grid-cols-12 gap-2">
                            <span className="col-span-4 font-semibold">NIS / NISN</span>
                            <span className="col-span-8">: {activeStudent?.nis || '-'} / {activeStudent?.nisn || '-'}</span>
                          </div>
                          <div className="grid grid-cols-12 gap-2">
                            <span className="col-span-4 font-semibold">Kelas</span>
                            <span className="col-span-8">: {activeStudent?.kelas || '-'}</span>
                          </div>
                          <div className="grid grid-cols-12 gap-2">
                            <span className="col-span-4 font-semibold">Nama Orang Tua / Wali</span>
                            <span className="col-span-8">: {activeStudent?.namaOrangTua || '-'}</span>
                          </div>
                          <div className="grid grid-cols-12 gap-2">
                            <span className="col-span-4 font-semibold">Alamat Rumah</span>
                            <span className="col-span-8">: {activeStudent?.alamat || '-'}</span>
                          </div>
                        </div>

                        <p className="pt-2">
                          Dengan ini menyatakan dengan sesungguhnya, penuh kesadaran, dan rasa tanggung jawab bahwa saya berjanji dan berkomitmen untuk:
                        </p>

                        <ol className="list-decimal list-outside pl-8 space-y-2 pt-1 font-sans text-xs md:text-sm">
                          {poinPernyataan.filter((p) => p.trim().length > 0).map((poin, idx) => (
                            <li key={idx} className="leading-relaxed pl-1">
                              {poin}
                            </li>
                          ))}
                        </ol>

                        {sanksiKonsekuensi && (
                          <div className="pt-2 leading-relaxed">
                            <p className="font-semibold underline mb-0.5">Sanksi / Konsekuensi:</p>
                            <p className="text-slate-800">{sanksiKonsekuensi}</p>
                          </div>
                        )}

                        <p className="pt-2">
                          {catatanTambahan ||
                            'Demikian surat pernyataan ini saya buat dengan sebenarnya tanpa ada paksaan dari pihak manapun untuk dipergunakan sebagaimana mestinya.'}
                        </p>

                        <div className="mt-8 pt-4 font-sans text-xs text-slate-900">
                          <div className="text-right mb-6">
                            <p>
                              {dikeluarkanDi || profilSekolah.kotaSekolah || 'Kota'},{' '}
                              {new Date(tanggalSurat).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="font-bold mb-1">Mengetahui,</p>
                              <p className="font-semibold">Orang Tua / Wali Murid</p>
                              <div className="h-20 flex items-end justify-center">
                                <span className="border-b border-slate-900 font-bold px-2">
                                  ( {activeStudent?.namaOrangTua || '................................'} )
                                </span>
                              </div>
                            </div>

                            <div>
                              <p className="font-bold mb-1">Yang Membuat Pernyataan,</p>
                              <p className="font-semibold">Siswa / Siswi</p>
                              <div className="h-20 flex items-center justify-center my-1">
                                {butuhMaterai ? (
                                  <div className="w-20 h-12 border border-dashed border-slate-400 text-[9px] text-slate-400 flex items-center justify-center text-center p-1 leading-none rounded">
                                    Materai<br />Rp 10.000
                                  </div>
                                ) : null}
                              </div>
                              <div className="flex justify-center">
                                <span className="border-b border-slate-900 font-bold px-2">
                                  ( {activeStudent?.nama || '................................'} )
                                </span>
                              </div>
                            </div>

                            <div>
                              <p className="font-bold mb-1">Guru BK / Konselor,</p>
                              <p className="font-semibold">{activeGuru?.jabatan || 'Guru Pembimbing'}</p>
                              <div className="h-20 flex items-end justify-center">
                                <div className="text-center">
                                  <p className="border-b border-slate-900 font-bold px-2">
                                    {activeGuru?.nama || 'Guru BK'}
                                  </p>
                                  <p className="text-[10px] font-mono mt-0.5">
                                    NIP. {activeGuru?.nip || '-'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormTab('form')}
                    className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Edit Kembali
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-md"
                  >
                    {editingId ? 'Simpan Perubahan' : 'Terbitkan Surat Pernyataan'}
                  </button>
                </div>
              </div>
            ) : (
              /* FORM INPUT MODE */
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Preset Template Selector Buttons */}
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Pilih Templat Pernyataan Cepat (Preset):</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(
                      [
                        'Kedisiplinan & Tata Tertib',
                        'Perbaikan Kehadiran & Presensi',
                        'Komitmen Belajar & Akademik',
                        'Pernyataan Bebas Perundungan (Bullying)',
                        'Pernyataan Orang Tua / Wali',
                      ] as TipeSuratPernyataan[]
                    ).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => applyPresetTemplate(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          tipePernyataan === t
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data Master Integration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Siswa */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pilih Siswa (Data Master) *
                    </label>
                    <select
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="">-- Pilih Siswa --</option>
                      {muridList.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nama} (Kelas {m.kelas} - NIS {m.nis})
                        </option>
                      ))}
                    </select>

                    {/* Auto Preview Student Info */}
                    {studentId && (
                      <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-0.5">
                        {(() => {
                          const s = muridList.find((m) => m.id === studentId);
                          return s ? (
                            <>
                              <p><strong>Orang Tua:</strong> {s.namaOrangTua || '-'}</p>
                              <p><strong>No HP Ortu:</strong> {s.noHpOrangTua || '-'}</p>
                              <p><strong>Alamat:</strong> {s.alamat || '-'}</p>
                            </>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Guru BK */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Guru BK / Konselor Pembimbing *
                    </label>
                    <select
                      value={guruBkId}
                      onChange={(e) => setGuruBkId(e.target.value)}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {guruBkList.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.nama} ({g.jabatan})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Document Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor Surat *
                    </label>
                    <input
                      type="text"
                      required
                      value={nomorSurat}
                      onChange={(e) => setNomorSurat(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tanggal Surat *
                    </label>
                    <input
                      type="date"
                      required
                      value={tanggalSurat}
                      onChange={(e) => setTanggalSurat(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Dikeluarkan Di *
                    </label>
                    <input
                      type="text"
                      required
                      value={dikeluarkanDi}
                      onChange={(e) => setDikeluarkanDi(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Dokumen Surat Pernyataan *
                  </label>
                  <input
                    type="text"
                    required
                    value={judulPernyataan}
                    onChange={(e) => setJudulPernyataan(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Dynamic Points of Commitment */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Butir / Poin-Poin Pernyataan (Komitmen Siswa) *
                    </label>
                    <button
                      type="button"
                      onClick={handleAddPoin}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Poin</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {poinPernyataan.map((poin, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          required
                          value={poin}
                          onChange={(e) => handleUpdatePoin(index, e.target.value)}
                          placeholder={`Poin pernyataan ke-${index + 1}...`}
                          className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        {poinPernyataan.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePoin(index)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sanksi & Pembuat */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pernyataan Sanksi & Konsekuensi Apabila Melanggar
                  </label>
                  <textarea
                    rows={3}
                    value={sanksiKonsekuensi}
                    onChange={(e) => setSanksiKonsekuensi(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pihak Yang Tanda Tangan
                    </label>
                    <select
                      value={pembuatPernyataan}
                      onChange={(e) =>
                        setPembuatPernyataan(e.target.value as 'Siswa' | 'Orang Tua / Wali' | 'Siswa & Orang Tua')
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Siswa & Orang Tua">Siswa & Orang Tua / Wali (Lengkap)</option>
                      <option value="Siswa">Siswa Sahaja</option>
                      <option value="Orang Tua / Wali">Orang Tua / Wali Sahaja</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kotak Materai Rp 10.000
                    </label>
                    <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={butuhMaterai}
                        onChange={(e) => setButuhMaterai(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>Sediakan Tempat Materai Rp 10.000</span>
                    </label>
                  </div>
                </div>

                {/* Collapsible Quick Live Preview Box inside Form */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Printer className="w-4 h-4 text-emerald-600" />
                      <span>Ringkasan Pratinjau Cepat Surat Pernyataan</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormTab('preview')}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
                    >
                      Buka Pratinjau PDF Lengkap
                    </button>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs font-serif space-y-2 text-slate-800">
                    <div className="text-center border-b border-slate-200 pb-2">
                      <p className="font-sans text-[10px] uppercase font-bold text-slate-500">
                        {profilSekolah.namaSekolah}
                      </p>
                      <h4 className="font-sans font-extrabold text-xs uppercase text-slate-900 mt-0.5">
                        {judulPernyataan || 'SURAT PERNYATAAN'}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-500">No: {nomorSurat}</p>
                    </div>

                    <div className="text-[11px] font-sans space-y-1">
                      <p>
                        <strong>Siswa:</strong>{' '}
                        {muridList.find((m) => m.id === studentId)?.nama || 'Siswa belum dipilih'}
                      </p>
                      <p>
                        <strong>Poin Komitmen:</strong> {poinPernyataan.filter((p) => p.trim()).length} Poin Terdaftar
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-md shadow-emerald-600/20"
                  >
                    {editingId ? 'Simpan Perubahan' : 'Terbitkan Surat Pernyataan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingLetterId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 text-center shadow-xl">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Hapus Surat Pernyataan?</h3>
            <p className="text-xs text-slate-500">
              Apakah Anda yakin ingin menghapus arsip surat pernyataan ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingLetterId(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deletingLetterId)}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT & PDF PREVIEW MODAL */}
      {selectedLetter && printStudent && !isPreviewMinimized && (
        <div
          className={`fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center overflow-y-auto ${
            isPreviewMaximized ? 'p-0' : 'p-2 sm:p-4'
          }`}
        >
          <div
            className={`bg-white flex flex-col shadow-2xl border border-slate-200 transition-all duration-200 ${
              isPreviewMaximized
                ? 'w-full h-full rounded-none max-h-none'
                : 'rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[95vh]'
            }`}
          >
            {/* Modal Header Controls */}
            <div
              className={`p-3 sm:p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-900 text-white shrink-0 ${
                isPreviewMaximized ? 'rounded-none' : 'rounded-t-2xl sm:rounded-t-3xl'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                <span className="font-extrabold text-xs sm:text-sm truncate">Pratinjau Surat Pernyataan</span>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-1.5 sm:space-x-2 flex-wrap gap-y-1.5">
                <button
                  onClick={() =>
                    exportElementToPdf(
                      'surat-pernyataan-print',
                      `Surat_Pernyataan_${printStudent.nama.replace(/\s+/g, '_')}.pdf`
                    )
                  }
                  className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>

                <button
                  onClick={() => triggerPrintModal('surat-pernyataan-print')}
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>

                {/* Window Control Buttons: Minimize, Maximize/Restore, Close */}
                <div className="flex items-center gap-0.5 sm:gap-1 pl-1.5 sm:pl-2 border-l border-slate-700">
                  <button
                    onClick={() => setIsPreviewMinimized(true)}
                    className="p-1 sm:p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                    title="Minimize (Kecilkan ke Dock)"
                    aria-label="Minimize"
                  >
                    <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => setIsPreviewMaximized(!isPreviewMaximized)}
                    className="p-1 sm:p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                    title={isPreviewMaximized ? 'Restore / Normal (Kembalikan Ukuran)' : 'Maximize (Perbesar Layar Penuh)'}
                    aria-label="Maximize"
                  >
                    {isPreviewMaximized ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>
                  <button
                    onClick={() => setSelectedLetter(null)}
                    className="p-1 sm:p-1.5 hover:bg-rose-900/60 hover:text-rose-300 text-slate-400 rounded-lg transition cursor-pointer"
                    title="Tutup (Close)"
                    aria-label="Close"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Print Container Sheet */}
            <div className="p-2 sm:p-6 md:p-10 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
              <div
                id="surat-pernyataan-print"
                className="bg-white p-4 sm:p-8 md:p-12 shadow-lg max-w-[210mm] w-full text-slate-900 font-serif leading-normal sm:leading-relaxed border border-slate-200"
                style={{ minHeight: '297mm' }}
              >
                {/* Official Header with Left (Kabupaten) and Right (Sekolah) Logos */}
                <KopSuratHeader />

                {/* Document Title */}
                <div className="text-center my-3 sm:my-6">
                  <h2 className="text-xs sm:text-base md:text-lg font-bold tracking-wide uppercase border-b-2 border-slate-900 inline-block pb-0.5 px-3 sm:px-4 font-sans">
                    {selectedLetter.judulPernyataan || 'SURAT PERNYATAAN'}
                  </h2>
                  <p className="text-[10px] sm:text-xs font-mono text-slate-800 mt-0.5 sm:mt-1">
                    Nomor: {selectedLetter.nomorSurat}
                  </p>
                </div>

                {/* Party Information */}
                <div className="text-[10px] sm:text-xs md:text-sm space-y-2 sm:space-y-3 text-justify">
                  <p>Yang bertanda tangan di bawah ini:</p>

                  <div className="pl-2 sm:pl-4 md:pl-6 space-y-1 font-sans text-[10px] sm:text-xs md:text-sm">
                    <div className="grid grid-cols-12 gap-1 sm:gap-2">
                      <span className="col-span-5 sm:col-span-4 font-semibold">Nama Siswa</span>
                      <span className="col-span-7 sm:col-span-8 font-bold text-slate-900">: {printStudent.nama}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1 sm:gap-2">
                      <span className="col-span-5 sm:col-span-4 font-semibold">NIS / NISN</span>
                      <span className="col-span-7 sm:col-span-8">: {printStudent.nis} / {printStudent.nisn || '-'}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1 sm:gap-2">
                      <span className="col-span-5 sm:col-span-4 font-semibold">Kelas</span>
                      <span className="col-span-7 sm:col-span-8 font-bold">: {printStudent.kelas}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1 sm:gap-2">
                      <span className="col-span-5 sm:col-span-4 font-semibold">Tempat, Tgl Lahir</span>
                      <span className="col-span-7 sm:col-span-8">
                        : {printStudent.tempatLahir || '-'}, {printStudent.tanggalLahir || '-'}
                      </span>
                    </div>
                    <div className="grid grid-cols-12 gap-1 sm:gap-2">
                      <span className="col-span-5 sm:col-span-4 font-semibold">Nama Orang Tua / Wali</span>
                      <span className="col-span-7 sm:col-span-8">: {printStudent.namaOrangTua || '-'}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1 sm:gap-2">
                      <span className="col-span-5 sm:col-span-4 font-semibold">Alamat Rumah</span>
                      <span className="col-span-7 sm:col-span-8">: {printStudent.alamat || '-'}</span>
                    </div>
                  </div>

                  <p className="pt-1 sm:pt-2">
                    Dengan ini menyatakan dengan sesungguhnya, penuh kesadaran, dan rasa tanggung jawab bahwa saya berjanji dan berkomitmen untuk:
                  </p>

                  {/* Commitment Points */}
                  <ol className="list-decimal list-outside pl-5 sm:pl-8 space-y-1.5 sm:space-y-2 pt-1 font-sans text-[10px] sm:text-xs md:text-sm">
                    {selectedLetter.poinPernyataan?.map((poin, idx) => (
                      <li key={idx} className="leading-normal sm:leading-relaxed pl-1">
                        {poin}
                      </li>
                    ))}
                  </ol>

                  {/* Consequences */}
                  {selectedLetter.sanksiKonsekuensi && (
                    <div className="pt-1 sm:pt-2 leading-normal sm:leading-relaxed">
                      <p className="font-semibold underline mb-0.5">Sanksi / Konsekuensi:</p>
                      <p className="text-slate-800">{selectedLetter.sanksiKonsekuensi}</p>
                    </div>
                  )}

                  {/* Closing Note */}
                  <p className="pt-1 sm:pt-2">
                    {selectedLetter.catatanTambahan ||
                      'Demikian surat pernyataan ini saya buat dengan sebenarnya tanpa ada paksaan dari pihak manapun untuk dipergunakan sebagaimana mestinya.'}
                  </p>
                </div>

                {/* Date & Signatures Grid */}
                <div className="mt-6 sm:mt-8 pt-2 sm:pt-4 font-sans text-[9px] sm:text-xs text-slate-900">
                  <div className="text-right mb-4 sm:mb-6">
                    <p>
                      {selectedLetter.dikeluarkanDi || profilSekolah.kotaSekolah || 'Kota'},{' '}
                      {new Date(selectedLetter.tanggalSurat).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Top Signatures (Parents & Student & Guru BK) */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                    <div>
                      <p className="font-bold mb-0.5 sm:mb-1">Mengetahui,</p>
                      <p className="font-semibold">Orang Tua / Wali Murid</p>
                      <div className="h-16 sm:h-20 flex items-end justify-center">
                        <span className="border-b border-slate-900 font-bold px-1 sm:px-2 text-[8px] sm:text-xs truncate max-w-full">
                          ( {printStudent.namaOrangTua || '........................'} )
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="font-bold mb-0.5 sm:mb-1">Yang Membuat Pernyataan,</p>
                      <p className="font-semibold">Siswa / Siswi</p>
                      <div className="h-16 sm:h-20 flex items-center justify-center my-0.5 sm:my-1">
                        {selectedLetter.butuhMaterai ? (
                          <div className="w-16 h-10 sm:w-20 sm:h-12 border border-dashed border-slate-400 text-[8px] sm:text-[9px] text-slate-400 flex items-center justify-center text-center p-0.5 sm:p-1 leading-none rounded">
                            Materai<br />Rp 10.000
                          </div>
                        ) : null}
                      </div>
                      <div className="flex justify-center">
                        <span className="border-b border-slate-900 font-bold px-1 sm:px-2 text-[8px] sm:text-xs truncate max-w-full">
                          ( {printStudent.nama} )
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="font-bold mb-0.5 sm:mb-1">Guru BK / Konselor,</p>
                      <p className="font-semibold">{printGuru?.jabatan || 'Guru Pembimbing'}</p>
                      <div className="h-16 sm:h-20 flex items-end justify-center">
                        <div className="text-center">
                          <p className="border-b border-slate-900 font-bold px-1 sm:px-2 text-[8px] sm:text-xs truncate max-w-full">
                            {printGuru?.nama || 'Drs. Bambang Hermawan, M.Pd.'}
                          </p>
                          <p className="text-[8px] sm:text-[10px] font-mono mt-0.5">
                            NIP. {printGuru?.nip || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Center Signature (Kepala Sekolah) */}
                  <div className="mt-6 sm:mt-10 text-center">
                    <p className="font-bold">Mengetahui / Menyetujui,</p>
                    <p className="font-bold uppercase">{profilSekolah.namaSekolah}</p>
                    <p className="text-[10px] sm:text-[11px]">Kepala Sekolah</p>
                    <div className="h-16 sm:h-20 flex items-end justify-center">
                      <div className="text-center">
                        <p className="border-b border-slate-900 font-bold px-2 sm:px-4 text-[9px] sm:text-xs">
                          {profilSekolah.namaKepalaSekolah}
                        </p>
                        <p className="text-[8px] sm:text-[10px] font-mono mt-0.5">
                          NIP. {profilSekolah.nipKepalaSekolah}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING DOCKED PILLS FOR MINIMIZED WINDOWS */}
      {/* 1. Minimized Form Window */}
      {showForm && isFormMinimized && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="text-xs">
              <p className="font-bold">
                {editingId ? 'Edit Surat Pernyataan' : 'Form Surat Pernyataan'}
              </p>
              {studentId && (
                <p className="text-[10px] text-slate-300 max-w-[130px] truncate">
                  {muridList.find((m) => m.id === studentId)?.nama || 'Siswa'}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
            <button
              onClick={() => setIsFormMinimized(false)}
              className="p-1.5 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Buka / Pulihkan"
            >
              <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Buka</span>
            </button>
            <button
              onClick={() => {
                setIsFormMinimized(false);
                setShowForm(false);
              }}
              className="p-1.5 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 rounded-lg cursor-pointer"
              title="Tutup Formulir"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Minimized Print Preview Window */}
      {selectedLetter && printStudent && isPreviewMinimized && (
        <div className="fixed bottom-4 left-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <p className="font-bold">Pratinjau Surat Pernyataan</p>
              <p className="text-[10px] text-slate-300 max-w-[130px] truncate">
                {printStudent.nama}
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
