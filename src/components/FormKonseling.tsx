import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import {
  TipeKonseling,
  KategoriKasus,
  TingkatUrgensi,
  StatusKonseling,
  DataKonseling,
} from '../types';
import {
  User,
  Users,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Send,
  Sparkles,
  FileText,
  Search,
} from 'lucide-react';
import { TabType } from './Header';

interface FormKonselingProps {
  setActiveTab: (tab: TabType) => void;
}

export const FormKonseling: React.FC<FormKonselingProps> = ({ setActiveTab }) => {
  const { muridList, guruBkList, addKonseling } = useDb();

  const [tipe, setTipe] = useState<TipeKonseling>('Pribadi');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedGuruBkId, setSelectedGuruBkId] = useState<string>(
    guruBkList[0]?.id || ''
  );

  const [tanggal, setTanggal] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [waktu, setWaktu] = useState<string>('09:00 - 10:00 WIB');
  const [tempat, setTempat] = useState<string>('Ruang Bimbingan & Konseling');

  const [kategoriKasus, setKategoriKasus] = useState<KategoriKasus>('Akademik');
  const [tingkatUrgensi, setTingkatUrgensi] = useState<TingkatUrgensi>('Ringan');

  const [deskripsiMasalah, setDeskripsiMasalah] = useState<string>('');
  const [penanganan, setPenanganan] = useState<string>('');
  const [tindakLanjut, setTindakLanjut] = useState<string>('');

  const [status, setStatus] = useState<StatusKonseling>('Selesai');
  const [evaluasiCatatan, setEvaluasiCatatan] = useState<string>('');

  // Search murid
  const [searchMurid, setSearchMurid] = useState('');
  const [filterKelas, setFilterKelas] = useState('');

  const [notification, setNotification] = useState<string | null>(null);

  const handleToggleStudent = (studentId: string) => {
    if (tipe === 'Pribadi') {
      setSelectedStudentIds([studentId]);
    } else {
      if (selectedStudentIds.includes(studentId)) {
        setSelectedStudentIds(selectedStudentIds.filter((id) => id !== studentId));
      } else {
        setSelectedStudentIds([...selectedStudentIds, studentId]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) {
      alert('Pilih setidaknya 1 murid untuk data konseling!');
      return;
    }
    if (!selectedGuruBkId) {
      alert('Pilih Guru BK Pembimbing!');
      return;
    }
    if (!deskripsiMasalah.trim()) {
      alert('Isi deskripsi masalah!');
      return;
    }

    const newSession: Omit<DataKonseling, 'id' | 'createdAt'> = {
      tanggal,
      waktu,
      tipe,
      studentIds: selectedStudentIds,
      guruBkId: selectedGuruBkId,
      kategoriKasus,
      tingkatUrgensi,
      tempat,
      deskripsiMasalah,
      penanganan,
      tindakLanjut,
      status,
      evaluasiCatatan,
    };

    addKonseling(newSession);
    setNotification('Data Konseling berhasil disimpan secara terintegrasi!');

    setTimeout(() => {
      setNotification(null);
      setActiveTab('arsip');
    }, 1200);
  };

  const filteredStudents = muridList.filter((m) => {
    const matchSearch =
      m.nama.toLowerCase().includes(searchMurid.toLowerCase()) ||
      m.nis.includes(searchMurid) ||
      m.kelas.toLowerCase().includes(searchMurid.toLowerCase());
    const matchKelas = filterKelas ? m.kelas === filterKelas : true;
    return matchSearch && matchKelas;
  });

  const uniqueKelas = Array.from(new Set(muridList.map((m) => m.kelas))).sort();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Form Sistematis BK Vol. 2</span>
          </span>
          <h2 className="text-xl font-extrabold text-slate-900">
            Input Data Sesi Bimbingan & Konseling
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Dokumentasikan proses konseling secara terstruktur dan terintegrasi langsung dengan database murid & guru.
          </p>
        </div>

        {/* Tipe Selector Buttons */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex space-x-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              setTipe('Pribadi');
              setSelectedStudentIds(selectedStudentIds.slice(0, 1));
            }}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              tipe === 'Pribadi'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Konseling Pribadi</span>
          </button>

          <button
            type="button"
            onClick={() => setTipe('Kelompok')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              tipe === 'Kelompok'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Konseling Kelompok</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-indigo-900 text-white flex items-center space-x-3 shadow-xl animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-indigo-300" />
          <span className="font-bold text-sm">{notification}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs">
        {/* Step 1: Student Selection */}
        <div className="space-y-3 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs font-extrabold">
                1
              </span>
              <span>
                Pilih Murid ({tipe === 'Pribadi' ? '1 Siswa' : 'Siswa Kelompok'})
              </span>
            </h3>
            {selectedStudentIds.length > 0 && (
              <span className="text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                {selectedStudentIds.length} Murid Terpilih
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau NIS siswa..."
                value={searchMurid}
                onChange={(e) => setSearchMurid(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-700 focus:outline-none"
            >
              <option value="">Semua Kelas</option>
              {uniqueKelas.map((k) => (
                <option key={k} value={k}>
                  Kelas {k}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
            {filteredStudents.map((m) => {
              const isSelected = selectedStudentIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => handleToggleStudent(m.id)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 font-semibold text-emerald-950 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <div>
                    <p className="font-bold text-xs">{m.nama}</p>
                    <p className="text-[10px] text-slate-500">
                      Kelas {m.kelas} | NIS: {m.nis}
                    </p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'border border-slate-300'
                    }`}
                  >
                    {isSelected ? '✓' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Counselor & Session Meta */}
        <div className="space-y-3 pb-4 border-b border-slate-200">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-extrabold">
              2
            </span>
            <span>Waktu, Tempat & Guru BK Pembimbing</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Guru BK Pembimbing *</label>
              <select
                value={selectedGuruBkId}
                onChange={(e) => setSelectedGuruBkId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                {guruBkList.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nama} ({g.jabatan})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Konseling *</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Waktu / Sesi</label>
              <input
                type="text"
                value={waktu}
                onChange={(e) => setWaktu(e.target.value)}
                placeholder="09:00 - 10:00 WIB"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">Tempat Pelaksanaan</label>
              <input
                type="text"
                value={tempat}
                onChange={(e) => setTempat(e.target.value)}
                placeholder="Ruang Bimbingan & Konseling / Kelas / Online"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Categorization & Urgency */}
        <div className="space-y-3 pb-4 border-b border-slate-200">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-extrabold">
              3
            </span>
            <span>Kategori Bidang Bimbingan & Tingkat Urgensi</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Bidang Kasus *</label>
              <select
                value={kategoriKasus}
                onChange={(e) => setKategoriKasus(e.target.value as KategoriKasus)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Akademik">Akademik (Prestasi Belajar & Kesulitan Nilai)</option>
                <option value="Perilaku/Kedisiplinan">Perilaku / Kedisiplinan / Tata Tertib</option>
                <option value="Pribadi/Emosional">Pribadi / Emosional / Kesehatan Mental</option>
                <option value="Sosial/Interpersonal">Sosial / Interpersonal / Pertemanan</option>
                <option value="Karir/Studi Lanjut">Karir / Pemilihan Studi Lanjut</option>
                <option value="Keluarga">Keluarga & Lingkungan Rumah</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tingkat Urgensi Kasus *</label>
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                {(['Ringan', 'Sedang', 'Berat'] as TingkatUrgensi[]).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setTingkatUrgensi(u)}
                    className={`py-2 px-3 rounded-lg font-bold text-center border transition ${
                      tingkatUrgensi === u
                        ? u === 'Ringan'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : u === 'Sedang'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Systematic Problem, Action & Follow up */}
        <div className="space-y-4 pb-4 border-b border-slate-200">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-extrabold">
              4
            </span>
            <span>Uraian Masalah, Penanganan & Rencana Tindak Lanjut</span>
          </h3>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Deskripsi Masalah / Pokok Bahasa Konseling *
            </label>
            <textarea
              rows={3}
              required
              value={deskripsiMasalah}
              onChange={(e) => setDeskripsiMasalah(e.target.value)}
              placeholder="Uraikan fakta, kronologi, latar belakang masalah, atau keluhan yang disampaikan siswa..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Penanganan / Intervensi & Solusi yang Diberikan *
            </label>
            <textarea
              rows={3}
              required
              value={penanganan}
              onChange={(e) => setPenanganan(e.target.value)}
              placeholder="Tuliskan teknik konseling yang digunakan, nasihat, pemahaman baru, serta komitmen yang disepakati..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Rencana Tindak Lanjut (Follow-Up Plan) *
            </label>
            <textarea
              rows={2}
              required
              value={tindakLanjut}
              onChange={(e) => setTindakLanjut(e.target.value)}
              placeholder="Tentukan agenda monitoring, jadwal konseling berikutnya, atau koordinasi wali kelas/orang tua..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Step 5: Status & Notes */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-extrabold">
              5
            </span>
            <span>Status Hasil Konseling & Catatan Tambahan</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Penanganan *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusKonseling)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none font-bold"
              >
                <option value="Selesai">Selesai (Kasus Tuntas / Teratasi)</option>
                <option value="Dalam Proses">Dalam Proses (Perlu Sesi Lanjutan)</option>
                <option value="Perlu Tindak Lanjut Khusus">
                  Perlu Tindak Lanjut Khusus (Butuh Surat Panggilan Orang Tua)
                </option>
                <option value="Dirujuk (Referral)">Dirujuk (Referral ke Dokter / Psikolog / Rumah Sakit)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Catatan Evaluasi (Opsional)
              </label>
              <input
                type="text"
                value={evaluasiCatatan}
                onChange={(e) => setEvaluasiCatatan(e.target.value)}
                placeholder="Catatan respon perubahan perilaku siswa..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center space-x-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5"
          >
            <Send className="w-4 h-4" />
            <span>Simpan Data Konseling Sistematis</span>
          </button>
        </div>
      </form>
    </div>
  );
};
