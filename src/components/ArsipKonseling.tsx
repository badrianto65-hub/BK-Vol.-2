import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { DataKonseling } from '../types';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Printer,
  Download,
  Mail,
  Users,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { KopSuratHeader } from './KopSuratHeader';
import { exportElementToPdf, triggerPrintModal } from '../utils/pdfExport';
import { TabType } from './Header';

interface ArsipKonselingProps {
  setActiveTab: (tab: TabType) => void;
}

export const ArsipKonseling: React.FC<ArsipKonselingProps> = ({ setActiveTab }) => {
  const { konselingList, muridList, guruBkList, profilSekolah, updateKonseling, deleteKonseling } =
    useDb();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipe, setFilterTipe] = useState<string>('Semua');
  const [filterKategori, setFilterKategori] = useState<string>('Semua');
  const [filterUrgensi, setFilterUrgensi] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [filterKelas, setFilterKelas] = useState<string>('Semua');

  // Active detail modal
  const [selectedRecord, setSelectedRecord] = useState<DataKonseling | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<DataKonseling | null>(null);
  const [deletingKonselingId, setDeletingKonselingId] = useState<string | null>(null);

  // Filter logic
  const filteredArchive = konselingList.filter((k) => {
    const students = muridList.filter((m) => k.studentIds.includes(m.id));
    const guru = guruBkList.find((g) => g.id === k.guruBkId);

    const matchText =
      searchQuery === '' ||
      students.some((s) => s.nama.toLowerCase().includes(searchQuery.toLowerCase())) ||
      students.some((s) => s.nis.includes(searchQuery)) ||
      (guru && guru.nama.toLowerCase().includes(searchQuery.toLowerCase())) ||
      k.deskripsiMasalah.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.penanganan.toLowerCase().includes(searchQuery.toLowerCase());

    const matchTipe = filterTipe === 'Semua' || k.tipe === filterTipe;
    const matchKategori = filterKategori === 'Semua' || k.kategoriKasus === filterKategori;
    const matchUrgensi = filterUrgensi === 'Semua' || k.tingkatUrgensi === filterUrgensi;
    const matchStatus = filterStatus === 'Semua' || k.status === filterStatus;
    const matchKelas =
      filterKelas === 'Semua' || students.some((s) => s.kelas === filterKelas);

    return matchText && matchTipe && matchKategori && matchUrgensi && matchStatus && matchKelas;
  });

  const uniqueKelas = Array.from(new Set(muridList.map((m) => m.kelas))).sort();

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'ID Konseling',
      'Tanggal',
      'Tipe',
      'Siswa',
      'Kelas',
      'Guru BK',
      'Kategori Kasus',
      'Urgensi',
      'Deskripsi Masalah',
      'Penanganan',
      'Tindak Lanjut',
      'Status',
    ];

    const rows = filteredArchive.map((k) => {
      const students = muridList.filter((m) => k.studentIds.includes(m.id));
      const guru = guruBkList.find((g) => g.id === k.guruBkId);
      return [
        k.id,
        k.tanggal,
        k.tipe,
        `"${students.map((s) => s.nama).join(', ')}"`,
        `"${students.map((s) => s.kelas).join(', ')}"`,
        `"${guru?.nama || ''}"`,
        `"${k.kategoriKasus}"`,
        k.tingkatUrgensi,
        `"${k.deskripsiMasalah.replace(/"/g, '""')}"`,
        `"${k.penanganan.replace(/"/g, '""')}"`,
        `"${k.tindakLanjut.replace(/"/g, '""')}"`,
        k.status,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Arsip_Konseling_BK_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;
    updateKonseling(editFormData.id, editFormData);
    setIsEditModalOpen(false);
    setSelectedRecord(null);
    alert('Data konseling berhasil diperbarui!');
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mb-1">
            <span>Arsip Terintegrasi</span>
          </span>
          <h2 className="text-xl font-extrabold text-slate-900">
            Arsip Data Bimbingan & Konseling
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Total {filteredArchive.length} rekam data sesi konseling tersimpan terintegrasi di database.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Ekspor Excel / CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
          {/* Search */}
          <div className="sm:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kata kunci masalah/nama/NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Filter Tipe */}
          <div>
            <select
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-slate-700 focus:outline-none"
            >
              <option value="Semua">Semua Tipe</option>
              <option value="Pribadi">Pribadi</option>
              <option value="Kelompok">Kelompok</option>
            </select>
          </div>

          {/* Filter Kategori */}
          <div>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-slate-700 focus:outline-none"
            >
              <option value="Semua">Semua Bidang</option>
              <option value="Akademik">Akademik</option>
              <option value="Perilaku/Kedisiplinan">Kedisiplinan</option>
              <option value="Pribadi/Emosional">Emosional</option>
              <option value="Sosial/Interpersonal">Sosial</option>
              <option value="Karir/Studi Lanjut">Karir</option>
              <option value="Keluarga">Keluarga</option>
            </select>
          </div>

          {/* Filter Urgensi */}
          <div>
            <select
              value={filterUrgensi}
              onChange={(e) => setFilterUrgensi(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-slate-700 focus:outline-none"
            >
              <option value="Semua">Semua Urgensi</option>
              <option value="Ringan">Ringan</option>
              <option value="Sedang">Sedang</option>
              <option value="Berat">Berat</option>
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-slate-700 focus:outline-none"
            >
              <option value="Semua">Semua Status</option>
              <option value="Selesai">Selesai</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Perlu Tindak Lanjut Khusus">Perlu Tindak Lanjut</option>
              <option value="Dirujuk (Referral)">Dirujuk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Tgl & Sesi</th>
                <th className="py-3.5 px-4">Tipe & Siswa</th>
                <th className="py-3.5 px-4">Guru BK</th>
                <th className="py-3.5 px-4">Bidang Kasus</th>
                <th className="py-3.5 px-4">Urgensi</th>
                <th className="py-3.5 px-4">Ringkasan Masalah & Solusi</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredArchive.length > 0 ? (
                filteredArchive.map((k) => {
                  const students = muridList.filter((m) => k.studentIds.includes(m.id));
                  const guru = guruBkList.find((g) => g.id === k.guruBkId);

                  return (
                    <tr key={k.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono whitespace-nowrap">
                        <div className="font-bold text-slate-900">{k.tanggal}</div>
                        <div className="text-[10px] text-slate-500">{k.waktu}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5 mb-0.5">
                          {k.tipe === 'Pribadi' ? (
                            <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                              Pribadi
                            </span>
                          ) : (
                            <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                              Kelompok
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-slate-900">
                          {students.map((s) => s.nama).join(', ')}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Kelas: {students.map((s) => s.kelas).join(', ')}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {guru?.nama || 'N/A'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">
                          {k.kategoriKasus}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            k.tingkatUrgensi === 'Ringan'
                              ? 'bg-emerald-100 text-emerald-800'
                              : k.tingkatUrgensi === 'Sedang'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {k.tingkatUrgensi}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-semibold text-slate-900 line-clamp-1">
                          {k.deskripsiMasalah}
                        </p>
                        <p className="text-[10px] text-slate-500 line-clamp-1">
                          Solusi: {k.penanganan}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            k.status === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-800'
                              : k.status === 'Dalam Proses'
                              ? 'bg-blue-100 text-blue-800'
                              : k.status === 'Perlu Tindak Lanjut Khusus'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-purple-100 text-purple-900'
                          }`}
                        >
                          {k.status}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setSelectedRecord(k)}
                            title="Lihat Laporan Dokumen"
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditFormData(k);
                              setIsEditModalOpen(true);
                            }}
                            title="Edit Record"
                            className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingKonselingId(k.id)}
                            title="Hapus Record"
                            className="p-1.5 rounded hover:bg-rose-50 text-rose-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    Tidak ada arsip konseling yang sesuai kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL RECORD MODAL / PRINTABLE LAPORAN KONSELING */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 text-slate-900 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
              <h3 className="font-bold text-base">Pratinjau Dokumen Laporan Konseling</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => triggerPrintModal('printable-laporan-konseling')}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold inline-flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-slate-400 hover:text-slate-700 text-2xl font-bold leading-none px-2"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Printable Content Body */}
            <div
              id="printable-laporan-konseling"
              className="p-8 bg-white font-serif text-slate-900 text-xs leading-relaxed"
            >
              <KopSuratHeader customTitle="LAPORAN HASIL BIMBINGAN DAN KONSELING" />

              <div className="my-4 space-y-3 font-sans text-xs">
                {(() => {
                  const students = muridList.filter((m) =>
                    selectedRecord.studentIds.includes(m.id)
                  );
                  const guru = guruBkList.find((g) => g.id === selectedRecord.guruBkId);

                  return (
                    <>
                      <table className="w-full text-left border-collapse my-3 border border-slate-300">
                        <tbody>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <td className="p-2 font-bold w-36">Tipe Konseling</td>
                            <td className="p-2 font-semibold text-emerald-800">
                              Konseling {selectedRecord.tipe}
                            </td>
                            <td className="p-2 font-bold w-36">Tanggal / Waktu</td>
                            <td className="p-2">
                              {selectedRecord.tanggal} ({selectedRecord.waktu})
                            </td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="p-2 font-bold">Nama Murid</td>
                            <td className="p-2 font-bold" colSpan={3}>
                              {students.map((s) => `${s.nama} (Kelas ${s.kelas})`).join(', ')}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <td className="p-2 font-bold">Guru BK Pembimbing</td>
                            <td className="p-2 font-semibold">{guru?.nama || 'N/A'}</td>
                            <td className="p-2 font-bold">Tempat Layanan</td>
                            <td className="p-2">{selectedRecord.tempat}</td>
                          </tr>
                          <tr className="border-b border-slate-200">
                            <td className="p-2 font-bold">Kategori Bidang</td>
                            <td className="p-2">{selectedRecord.kategoriKasus}</td>
                            <td className="p-2 font-bold">Tingkat Urgensi</td>
                            <td className="p-2 font-bold">{selectedRecord.tingkatUrgensi}</td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="space-y-3 my-4">
                        <div className="p-3 border border-slate-300 rounded">
                          <p className="font-bold uppercase text-[10px] text-slate-500 mb-1">
                            A. Uraian Permasalahan / Pokok Bahasa
                          </p>
                          <p className="text-slate-900 leading-relaxed">
                            {selectedRecord.deskripsiMasalah}
                          </p>
                        </div>

                        <div className="p-3 border border-slate-300 rounded">
                          <p className="font-bold uppercase text-[10px] text-slate-500 mb-1">
                            B. Penanganan / Intervensi & Solusi
                          </p>
                          <p className="text-slate-900 leading-relaxed">
                            {selectedRecord.penanganan}
                          </p>
                        </div>

                        <div className="p-3 border border-slate-300 rounded">
                          <p className="font-bold uppercase text-[10px] text-slate-500 mb-1">
                            C. Rencana Tindak Lanjut (Follow Up)
                          </p>
                          <p className="text-slate-900 leading-relaxed">
                            {selectedRecord.tindakLanjut}
                          </p>
                        </div>

                        <div className="p-3 border border-slate-300 bg-slate-50 rounded flex justify-between items-center">
                          <div>
                            <p className="font-bold text-[10px] text-slate-500">D. Status Akhir</p>
                            <p className="font-bold text-slate-900">{selectedRecord.status}</p>
                          </div>
                          {selectedRecord.evaluasiCatatan && (
                            <div className="text-right">
                              <p className="font-bold text-[10px] text-slate-500">Evaluasi</p>
                              <p className="italic text-slate-700">{selectedRecord.evaluasiCatatan}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Signatures */}
                      <div className="pt-8 flex justify-between text-center font-serif text-xs">
                        <div>
                          <p className="mb-12">
                            Guru Bimbingan Konseling,
                            <br />
                            Pembimbing
                          </p>
                          <p className="font-bold underline">{guru?.nama || '......................'}</p>
                          <p className="text-[10px]">NIP. {guru?.nip || '......................'}</p>
                        </div>

                        <div>
                          <p className="mb-12">
                            {profilSekolah.kotaSekolah},{' '}
                            {new Date().toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                            <br />
                            Mengetahui, Kepala Sekolah
                          </p>
                          <p className="font-bold underline">{profilSekolah.namaKepalaSekolah}</p>
                          <p className="text-[10px]">NIP. {profilSekolah.nipKepalaSekolah}</p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-slate-900 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-sm">Edit Data Konseling</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Deskripsi Masalah</label>
                <textarea
                  rows={3}
                  value={editFormData.deskripsiMasalah}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, deskripsiMasalah: e.target.value })
                  }
                  className="w-full p-2 bg-slate-50 border rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Penanganan</label>
                <textarea
                  rows={3}
                  value={editFormData.penanganan}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, penanganan: e.target.value })
                  }
                  className="w-full p-2 bg-slate-50 border rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Tindak Lanjut</label>
                <textarea
                  rows={2}
                  value={editFormData.tindakLanjut}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, tindakLanjut: e.target.value })
                  }
                  className="w-full p-2 bg-slate-50 border rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Status Penanganan</label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      status: e.target.value as DataKonseling['status'],
                    })
                  }
                  className="w-full p-2 bg-slate-50 border rounded font-bold"
                >
                  <option value="Selesai">Selesai</option>
                  <option value="Dalam Proses">Dalam Proses</option>
                  <option value="Perlu Tindak Lanjut Khusus">Perlu Tindak Lanjut Khusus</option>
                  <option value="Dirujuk (Referral)">Dirujuk (Referral)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded bg-slate-200 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-emerald-600 text-white font-bold"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal - Delete Konseling */}
      {deletingKonselingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hapus Rekam Konseling</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Apakah Anda yakin ingin menghapus data rekam bimbingan konseling ini dari database?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingKonselingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteKonseling(deletingKonselingId);
                  setDeletingKonselingId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
