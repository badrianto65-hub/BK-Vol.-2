import React, { useState, useEffect } from 'react';
import { useDb } from '../context/DbContext';
import { ImportExcelModal } from './ImportExcelModal';
import { LogoKonselor } from './LogoKonselor';
import {
  Murid,
  GuruBk,
  ProfilSekolah,
  JenisKelamin,
} from '../types';
import {
  User,
  GraduationCap,
  School,
  Plus,
  Search,
  Edit,
  Trash2,
  FileSpreadsheet,
  CheckCircle,
  Phone,
  BookOpen,
  Filter,
  CheckSquare,
  Upload,
  Image as ImageIcon,
  X,
  Building2,
} from 'lucide-react';

export const MasterData: React.FC = () => {
  const {
    muridList,
    addMurid,
    updateMurid,
    deleteMurid,
    deleteMuridBatch,
    guruBkList,
    addGuruBk,
    updateGuruBk,
    deleteGuruBk,
    profilSekolah,
    updateProfilSekolah,
    konselingList,
  } = useDb();

  const [activeSubTab, setActiveSubTab] = useState<'murid' | 'guru' | 'sekolah'>('murid');

  // Search & Filters for Murid
  const [searchMurid, setSearchMurid] = useState('');
  const [filterKelas, setFilterKelas] = useState('');

  // Modals
  const [showMuridModal, setShowMuridModal] = useState(false);
  const [showImportExcelModal, setShowImportExcelModal] = useState(false);
  const [editingMurid, setEditingMurid] = useState<Murid | null>(null);

  const [showGuruModal, setShowGuruModal] = useState(false);
  const [editingGuru, setEditingGuru] = useState<GuruBk | null>(null);

  const [showHistoryMurid, setShowHistoryMurid] = useState<Murid | null>(null);
  const [deletingMurid, setDeletingMurid] = useState<Murid | null>(null);
  const [deletingGuru, setDeletingGuru] = useState<GuruBk | null>(null);

  // Bulk Selection States - Murid
  const [selectedMuridIds, setSelectedMuridIds] = useState<string[]>([]);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);

  // Form States - Murid
  const [formMurid, setFormMurid] = useState<Omit<Murid, 'id'>>({
    nis: '',
    nisn: '',
    nama: '',
    kelas: '7A',
    jenisKelamin: 'L',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2010-01-01',
    alamat: '',
    namaOrangTua: '',
    noHpOrangTua: '',
    catatanKhusus: '',
  });

  // Form States - Guru BK
  const [formGuru, setFormGuru] = useState<Omit<GuruBk, 'id'>>({
    nip: '',
    nama: '',
    jenisKelamin: 'L',
    noHp: '',
    jabatan: 'Guru Bimbingan Konseling',
    binaanKelas: ['7A', '7B'],
  });

  // Form State - Sekolah
  const [formSekolah, setFormSekolah] = useState<ProfilSekolah>(profilSekolah);

  useEffect(() => {
    setFormSekolah(profilSekolah);
  }, [profilSekolah]);

  const SAMPLE_LOGO_KABUPATEN =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><path d="M100 10 L170 40 V110 C170 155 100 190 100 190 C100 190 30 155 30 110 V40 Z" fill="%231e3a8a" stroke="%23fbbf24" stroke-width="6"/><path d="M100 25 L155 50 V105 C155 142 100 172 100 172 C100 172 45 142 45 105 V50 Z" fill="%2315803d" stroke="%23ffffff" stroke-width="2"/><polygon points="100,45 108,68 132,68 113,82 120,105 100,90 80,105 87,82 68,68 92,68" fill="%23f59e0b"/><text x="100" y="135" fill="%23ffffff" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle">PEMDA</text><text x="100" y="152" fill="%23fbbf24" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">KABUPATEN</text></svg>';

  const SAMPLE_LOGO_SEKOLAH =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><circle cx="100" cy="100" r="90" fill="%230284c7" stroke="%23f59e0b" stroke-width="8"/><polygon points="100,30 120,70 165,75 132,105 140,150 100,128 60,150 68,105 35,75 80,70" fill="%23fbbf24" stroke="%231e3a8a" stroke-width="2"/><circle cx="100" cy="100" r="35" fill="%23ffffff"/><text x="100" y="105" fill="%230369a1" font-size="13" font-family="sans-serif" font-weight="bold" text-anchor="middle">SEKOLAH</text></svg>';

  const handleLogoFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoKabupatenUrl' | 'logoSekolahUrl'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file gambar logo terlalu besar (maksimal 2MB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormSekolah((prev) => ({
          ...prev,
          [field]: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Murid
  const handleSaveMurid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMurid.nama || !formMurid.nis) return;

    if (editingMurid) {
      updateMurid(editingMurid.id, formMurid);
    } else {
      addMurid(formMurid);
    }
    setShowMuridModal(false);
    setEditingMurid(null);
    resetFormMurid();
  };

  const resetFormMurid = () => {
    setFormMurid({
      nis: '',
      nisn: '',
      nama: '',
      kelas: '7A',
      jenisKelamin: 'L',
      tempatLahir: 'Jakarta',
      tanggalLahir: '2010-01-01',
      alamat: '',
      namaOrangTua: '',
      noHpOrangTua: '',
      catatanKhusus: '',
    });
  };

  const openEditMurid = (m: Murid) => {
    setEditingMurid(m);
    setFormMurid({
      nis: m.nis,
      nisn: m.nisn,
      nama: m.nama,
      kelas: m.kelas,
      jenisKelamin: m.jenisKelamin,
      tempatLahir: m.tempatLahir,
      tanggalLahir: m.tanggalLahir,
      alamat: m.alamat,
      namaOrangTua: m.namaOrangTua,
      noHpOrangTua: m.noHpOrangTua,
      catatanKhusus: m.catatanKhusus || '',
    });
    setShowMuridModal(true);
  };

  // Save Guru BK
  const handleSaveGuru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGuru.nama || !formGuru.nip) return;

    if (editingGuru) {
      updateGuruBk(editingGuru.id, formGuru);
    } else {
      addGuruBk(formGuru);
    }
    setShowGuruModal(false);
    setEditingGuru(null);
    resetFormGuru();
  };

  const resetFormGuru = () => {
    setFormGuru({
      nip: '',
      nama: '',
      jenisKelamin: 'L',
      noHp: '',
      jabatan: 'Guru Bimbingan Konseling',
      binaanKelas: ['7A', '7B'],
    });
  };

  const openEditGuru = (g: GuruBk) => {
    setEditingGuru(g);
    setFormGuru({
      nip: g.nip,
      nama: g.nama,
      jenisKelamin: g.jenisKelamin,
      noHp: g.noHp,
      jabatan: g.jabatan,
      binaanKelas: g.binaanKelas,
    });
    setShowGuruModal(true);
  };

  // Save Sekolah
  const handleSaveSekolah = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfilSekolah(formSekolah);
    alert('Profil Sekolah & Kepala Sekolah berhasil diperbarui!');
  };

  // Filtered Murid
  const uniqueKelasList = Array.from(new Set(muridList.map((m) => m.kelas))).sort();

  const filteredMurid = muridList.filter((m) => {
    const matchSearch =
      m.nama.toLowerCase().includes(searchMurid.toLowerCase()) ||
      m.nis.includes(searchMurid) ||
      m.nisn.includes(searchMurid) ||
      m.kelas.toLowerCase().includes(searchMurid.toLowerCase());
    const matchKelas = filterKelas ? m.kelas === filterKelas : true;
    return matchSearch && matchKelas;
  });

  // Selection Helpers for Bulk Delete
  const isAllFilteredSelected =
    filteredMurid.length > 0 &&
    filteredMurid.every((m) => selectedMuridIds.includes(m.id));

  const handleToggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      const filteredIds = new Set(filteredMurid.map((m) => m.id));
      setSelectedMuridIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      const filteredIds = filteredMurid.map((m) => m.id);
      setSelectedMuridIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleToggleSelectMurid = (id: string) => {
    setSelectedMuridIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExecuteBatchDelete = () => {
    if (selectedMuridIds.length > 0) {
      deleteMuridBatch(selectedMuridIds);
      setSelectedMuridIds([]);
      setShowBatchDeleteModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Tab Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubTab('murid')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'murid'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-indigo-200" />
          <span>Data Murid / Siswa ({muridList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('guru')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'guru'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4 text-indigo-200" />
          <span>Data Guru BK ({guruBkList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sekolah')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'sekolah'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <School className="w-4 h-4 text-amber-400" />
          <span>Data Kepala Sekolah & Profil</span>
        </button>
      </div>

      {/* SUB-TAB 1: DATA MURID */}
      {activeSubTab === 'murid' && (
        <div className="space-y-4">
          {/* Header Controls */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari Nama, NIS, NISN..."
                  value={searchMurid}
                  onChange={(e) => setSearchMurid(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-700 focus:outline-none"
              >
                <option value="">Semua Kelas</option>
                {uniqueKelasList.map((k) => (
                  <option key={k} value={k}>
                    Kelas {k}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowImportExcelModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Import Siswa (Excel / CSV)</span>
              </button>

              <button
                onClick={() => {
                  resetFormMurid();
                  setEditingMurid(null);
                  setShowMuridModal(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Manual</span>
              </button>
            </div>
          </div>

          {/* Bulk Selection Action Banner */}
          {selectedMuridIds.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150 shadow-sm">
              <div className="flex items-center space-x-2 text-rose-800 text-xs font-semibold">
                <CheckSquare className="w-4.5 h-4.5 text-rose-600" />
                <span>Terpilih <span className="font-bold text-rose-900 underline underline-offset-2">{selectedMuridIds.length}</span> data siswa</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedMuridIds([])}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-rose-100 transition"
                >
                  Batal Pilih
                </button>
                <button
                  type="button"
                  onClick={() => setShowBatchDeleteModal(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-600/20 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus ({selectedMuridIds.length}) Terpilih</span>
                </button>
              </div>
            </div>
          )}

          {/* Table Murid */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllFilteredSelected}
                        onChange={handleToggleSelectAllFiltered}
                        title={isAllFilteredSelected ? 'Batal pilih semua' : 'Pilih semua siswa di tabel ini'}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer align-middle"
                      />
                    </th>
                    <th className="py-3 px-4">NIS / NISN</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">L/P</th>
                    <th className="py-3 px-4">Orang Tua / Wali</th>
                    <th className="py-3 px-4">Kontak Orang Tua</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredMurid.length > 0 ? (
                    filteredMurid.map((m) => {
                      const isSelected = selectedMuridIds.includes(m.id);
                      return (
                        <tr
                          key={m.id}
                          className={`transition ${isSelected ? 'bg-indigo-50/70' : 'hover:bg-slate-50'}`}
                        >
                          <td className="py-3 px-3 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectMurid(m.id)}
                              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer align-middle"
                            />
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            <div>{m.nis}</div>
                            <div className="text-[10px] text-slate-400">{m.nisn}</div>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {m.nama}
                            {m.catatanKhusus && (
                              <p className="text-[10px] text-emerald-700 font-normal italic">
                                {m.catatanKhusus}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-800 font-semibold text-[11px]">
                              {m.kelas}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            {m.jenisKelamin === 'L' ? (
                              <span className="text-blue-600">L</span>
                            ) : (
                              <span className="text-pink-600">P</span>
                            )}
                          </td>
                          <td className="py-3 px-4">{m.namaOrangTua}</td>
                          <td className="py-3 px-4 text-slate-600 font-mono">{m.noHpOrangTua}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => setShowHistoryMurid(m)}
                                title="Riwayat Konseling"
                                className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditMurid(m)}
                                title="Edit Data"
                                className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingMurid(m)}
                                title="Hapus Data"
                                className="p-1.5 rounded hover:bg-rose-50 text-rose-600 transition"
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
                        Tidak ada data murid ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DATA GURU BK */}
      {activeSubTab === 'guru' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Daftar Guru Bimbingan Konseling</h3>
              <p className="text-xs text-slate-500">
                Data pendidik konselor dan pembagian kelas binaan bimbingan
              </p>
            </div>
            <button
              onClick={() => {
                resetFormGuru();
                setEditingGuru(null);
                setShowGuruModal(true);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Guru BK Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guruBkList.map((g) => (
              <div
                key={g.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 relative hover:border-emerald-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{g.nama}</h4>
                    <p className="text-[11px] font-mono text-slate-500">NIP: {g.nip}</p>
                    <span className="inline-block mt-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                      {g.jabatan}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                    {g.jenisKelamin === 'L' ? 'Bpk' : 'Ibu'}
                  </div>
                </div>

                <div className="text-xs space-y-1 text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{g.noHp}</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 mb-1">Kelas Binaan:</p>
                    <div className="flex flex-wrap gap-1">
                      {g.binaanKelas.map((k) => (
                        <span
                          key={k}
                          className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded"
                        >
                          Kelas {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => openEditGuru(g)}
                    className="p-1.5 rounded hover:bg-blue-50 text-blue-600 text-xs flex items-center space-x-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeletingGuru(g)}
                    className="p-1.5 rounded hover:bg-rose-50 text-rose-600 text-xs flex items-center space-x-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DATA PROFIL SEKOLAH & KEPALA SEKOLAH */}
      {activeSubTab === 'sekolah' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-3xl">
          <div className="mb-6 pb-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Pengaturan Profil Sekolah & Kepala Sekolah
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Data ini akan muncul secara otomatis pada Kop Surat Panggilan dan Surat Tugas
            </p>
          </div>

          <form onSubmit={handleSaveSekolah} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Sekolah</label>
                <input
                  type="text"
                  required
                  value={formSekolah.namaSekolah}
                  onChange={(e) =>
                    setFormSekolah({ ...formSekolah, namaSekolah: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NPSN</label>
                <input
                  type="text"
                  value={formSekolah.npsn}
                  onChange={(e) => setFormSekolah({ ...formSekolah, npsn: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Alamat Sekolah</label>
                <input
                  type="text"
                  value={formSekolah.alamatSekolah}
                  onChange={(e) =>
                    setFormSekolah({ ...formSekolah, alamatSekolah: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kota / Kabupaten</label>
                <input
                  type="text"
                  value={formSekolah.kotaSekolah}
                  onChange={(e) =>
                    setFormSekolah({ ...formSekolah, kotaSekolah: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Provinsi</label>
                <input
                  type="text"
                  value={formSekolah.provinsi}
                  onChange={(e) => setFormSekolah({ ...formSekolah, provinsi: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Telepon Sekolah</label>
                <input
                  type="text"
                  value={formSekolah.teleponSekolah}
                  onChange={(e) =>
                    setFormSekolah({ ...formSekolah, teleponSekolah: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Sekolah</label>
                <input
                  type="email"
                  value={formSekolah.emailSekolah}
                  onChange={(e) =>
                    setFormSekolah({ ...formSekolah, emailSekolah: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <hr className="my-4 border-slate-200" />

            {/* Principal details */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">Data Kepala Sekolah (Penandatangan)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Kepala Sekolah (Lengkap Gelar)
                  </label>
                  <input
                    type="text"
                    required
                    value={formSekolah.namaKepalaSekolah}
                    onChange={(e) =>
                      setFormSekolah({ ...formSekolah, namaKepalaSekolah: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIP Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    required
                    value={formSekolah.nipKepalaSekolah}
                    onChange={(e) =>
                      setFormSekolah({ ...formSekolah, nipKepalaSekolah: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <hr className="my-6 border-slate-200" />

            {/* Logo Kop Surat Section (Left & Right) */}
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>Pengaturan Logo Kop Surat (PDF / Lembar Cetak)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Upload file logo atau masukkan URL gambar. Logo Kabupaten akan tampil di sebelah KIRI, dan Logo Sekolah di sebelah KANAN pada Kop Surat PDF.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* LOGO KABUPATEN (KIRI) */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                        KIRI
                      </span>
                      <span className="font-bold text-slate-800 text-xs">Logo Kabupaten / Pemda</span>
                    </div>
                    {formSekolah.logoKabupatenUrl && (
                      <button
                        type="button"
                        onClick={() => setFormSekolah({ ...formSekolah, logoKabupatenUrl: '' })}
                        className="text-rose-600 hover:text-rose-700 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>

                  {/* Preview Box */}
                  <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                    <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {formSekolah.logoKabupatenUrl ? (
                        <img
                          src={formSekolah.logoKabupatenUrl}
                          alt="Preview Logo Kabupaten"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="text-center p-1 text-slate-400">
                          <Building2 className="w-6 h-6 mx-auto mb-0.5 text-slate-400" />
                          <span className="text-[8px] font-semibold uppercase block">Kiri</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Upload File Gambar (Kiri):
                        </label>
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg cursor-pointer border border-emerald-200 transition">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih File Gambar</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleLogoFileUpload(e, 'logoKabupatenUrl')}
                          />
                        </label>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">
                          Atau Masukkan Link / URL Gambar:
                        </label>
                        <input
                          type="text"
                          placeholder="https://.../logo-kabupaten.png"
                          value={formSekolah.logoKabupatenUrl || ''}
                          onChange={(e) =>
                            setFormSekolah({ ...formSekolah, logoKabupatenUrl: e.target.value })
                          }
                          className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormSekolah({ ...formSekolah, logoKabupatenUrl: SAMPLE_LOGO_KABUPATEN })
                          }
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold underline"
                        >
                          + Gunakan Contoh Logo Pemda
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LOGO SEKOLAH (KANAN) */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                        KANAN
                      </span>
                      <span className="font-bold text-slate-800 text-xs">Logo Sekolah / Instansi</span>
                    </div>
                    {(formSekolah.logoSekolahUrl || formSekolah.logoUrl) && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormSekolah({ ...formSekolah, logoSekolahUrl: '', logoUrl: '' })
                        }
                        className="text-rose-600 hover:text-rose-700 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>

                  {/* Preview Box */}
                  <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                    <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {formSekolah.logoSekolahUrl || formSekolah.logoUrl ? (
                        <img
                          src={formSekolah.logoSekolahUrl || formSekolah.logoUrl}
                          alt="Preview Logo Sekolah"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <LogoKonselor className="w-12 h-12" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Upload File Gambar (Kanan):
                        </label>
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold rounded-lg cursor-pointer border border-blue-200 transition">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih File Gambar</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleLogoFileUpload(e, 'logoSekolahUrl')}
                          />
                        </label>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">
                          Atau Masukkan Link / URL Gambar:
                        </label>
                        <input
                          type="text"
                          placeholder="https://.../logo-sekolah.png"
                          value={formSekolah.logoSekolahUrl || formSekolah.logoUrl || ''}
                          onChange={(e) =>
                            setFormSekolah({ ...formSekolah, logoSekolahUrl: e.target.value })
                          }
                          className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormSekolah({ ...formSekolah, logoSekolahUrl: SAMPLE_LOGO_SEKOLAH })
                          }
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold underline"
                        >
                          + Gunakan Contoh Logo Sekolah
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kop Surat Live Preview Box */}
              <div className="mt-4 p-4 bg-slate-100 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Pratinjau Kop Surat PDF (Hasil Cetak)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Kiri: {formSekolah.logoKabupatenUrl ? 'Logo Kustom' : 'Logo Default'} | Kanan: {formSekolah.logoSekolahUrl || formSekolah.logoUrl ? 'Logo Kustom' : 'Default BK'}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm font-serif">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-double border-slate-900 gap-2">
                    {/* Left Logo */}
                    <div className="w-14 h-14 flex items-center justify-center shrink-0">
                      {formSekolah.logoKabupatenUrl ? (
                        <img
                          src={formSekolah.logoKabupatenUrl}
                          alt="Logo Kabupaten"
                          className="max-h-14 max-w-14 object-contain"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-slate-50 text-slate-700 flex flex-col items-center justify-center font-bold text-[7px] border border-slate-300 text-center leading-tight">
                          <Building2 className="w-4 h-4 text-slate-500" />
                          <span>KABUPATEN</span>
                        </div>
                      )}
                    </div>

                    {/* Header text */}
                    <div className="flex-1 text-center px-2">
                      <p className="text-[9px] font-sans font-bold uppercase text-slate-700">
                        PEMERINTAH {formSekolah.kotaSekolah ? formSekolah.kotaSekolah.toUpperCase() : 'KABUPATEN / KOTA'}
                      </p>
                      <p className="text-[9px] font-sans font-bold uppercase text-slate-700">
                        DINAS PENDIDIKAN DAN KEBUDAYAAN
                      </p>
                      <h2 className="text-sm font-extrabold uppercase text-slate-950 my-0.5">
                        {formSekolah.namaSekolah || 'NAMA SEKOLAH'}
                      </h2>
                      <p className="text-[9px] text-slate-700">
                        {formSekolah.alamatSekolah || 'Alamat Sekolah'}, {formSekolah.kotaSekolah || 'Kota'}
                      </p>
                    </div>

                    {/* Right Logo */}
                    <div className="w-14 h-14 flex items-center justify-center shrink-0">
                      {formSekolah.logoSekolahUrl || formSekolah.logoUrl ? (
                        <img
                          src={formSekolah.logoSekolahUrl || formSekolah.logoUrl}
                          alt="Logo Sekolah"
                          className="max-h-14 max-w-14 object-contain"
                        />
                      ) : (
                        <LogoKonselor className="w-12 h-12" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20"
              >
                Simpan Perubahan Profil
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL EDIT / ADD MURID */}
      {showMuridModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 text-slate-900 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-base">
                {editingMurid ? 'Edit Data Murid' : 'Input Data Murid Baru'}
              </h3>
              <button
                onClick={() => setShowMuridModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveMurid} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">NIS *</label>
                  <input
                    type="text"
                    required
                    value={formMurid.nis}
                    onChange={(e) => setFormMurid({ ...formMurid, nis: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">NISN *</label>
                  <input
                    type="text"
                    required
                    value={formMurid.nisn}
                    onChange={(e) => setFormMurid({ ...formMurid, nisn: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Lengkap Murid *</label>
                <input
                  type="text"
                  required
                  value={formMurid.nama}
                  onChange={(e) => setFormMurid({ ...formMurid, nama: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Kelas *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 7A, 8B, 9C"
                    value={formMurid.kelas}
                    onChange={(e) => setFormMurid({ ...formMurid, kelas: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Jenis Kelamin *</label>
                  <select
                    value={formMurid.jenisKelamin}
                    onChange={(e) =>
                      setFormMurid({ ...formMurid, jenisKelamin: e.target.value as JenisKelamin })
                    }
                    className="w-full p-2 bg-slate-50 border rounded"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formMurid.tempatLahir}
                    onChange={(e) => setFormMurid({ ...formMurid, tempatLahir: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formMurid.tanggalLahir}
                    onChange={(e) => setFormMurid({ ...formMurid, tanggalLahir: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Alamat Rumah</label>
                <input
                  type="text"
                  value={formMurid.alamat}
                  onChange={(e) => setFormMurid({ ...formMurid, alamat: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={formMurid.namaOrangTua}
                    onChange={(e) => setFormMurid({ ...formMurid, namaOrangTua: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">No HP Orang Tua</label>
                  <input
                    type="text"
                    value={formMurid.noHpOrangTua}
                    onChange={(e) => setFormMurid({ ...formMurid, noHpOrangTua: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Catatan Khusus / Minat Bakat</label>
                <textarea
                  rows={2}
                  value={formMurid.catatanKhusus}
                  onChange={(e) => setFormMurid({ ...formMurid, catatanKhusus: e.target.value })}
                  placeholder="Catatan keanggotaan OSIS, prestasi, kesehatan, dll..."
                  className="w-full p-2 bg-slate-50 border rounded"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMuridModal(false)}
                  className="px-4 py-2 rounded bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-emerald-600 text-white font-bold shadow"
                >
                  Simpan Murid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT / ADD GURU BK */}
      {showGuruModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-base">
                {editingGuru ? 'Edit Data Guru BK' : 'Input Guru BK Baru'}
              </h3>
              <button
                onClick={() => setShowGuruModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveGuru} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">NIP / NUPTK *</label>
                <input
                  type="text"
                  required
                  value={formGuru.nip}
                  onChange={(e) => setFormGuru({ ...formGuru, nip: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Lengkap (Gelar) *</label>
                <input
                  type="text"
                  required
                  value={formGuru.nama}
                  onChange={(e) => setFormGuru({ ...formGuru, nama: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={formGuru.jenisKelamin}
                    onChange={(e) =>
                      setFormGuru({ ...formGuru, jenisKelamin: e.target.value as JenisKelamin })
                    }
                    className="w-full p-2 bg-slate-50 border rounded"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">No HP / WhatsApp</label>
                  <input
                    type="text"
                    value={formGuru.noHp}
                    onChange={(e) => setFormGuru({ ...formGuru, noHp: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Jabatan dalam Tim BK</label>
                <input
                  type="text"
                  value={formGuru.jabatan}
                  onChange={(e) => setFormGuru({ ...formGuru, jabatan: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Kelas Binaan (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formGuru.binaanKelas.join(', ')}
                  onChange={(e) =>
                    setFormGuru({
                      ...formGuru,
                      binaanKelas: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="e.g. 7A, 7B, 8A, 8B"
                  className="w-full p-2 bg-slate-50 border rounded"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowGuruModal(false)}
                  className="px-4 py-2 rounded bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-emerald-600 text-white font-bold shadow"
                >
                  Simpan Guru BK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RIWAYAT KONSELING SISWA */}
      {showHistoryMurid && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 text-slate-900 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-bold text-base">Riwayat Bimbingan & Konseling Siswa</h3>
                <p className="text-xs text-slate-500">
                  {showHistoryMurid.nama} ({showHistoryMurid.kelas}) - NIS: {showHistoryMurid.nis}
                </p>
              </div>
              <button
                onClick={() => setShowHistoryMurid(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {(() => {
              const studentSessions = konselingList.filter((k) =>
                k.studentIds.includes(showHistoryMurid.id)
              );
              return studentSessions.length > 0 ? (
                <div className="space-y-3">
                  {studentSessions.map((k) => (
                    <div
                      key={k.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {k.tanggal} ({k.tipe} - {k.kategoriKasus})
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold text-[10px]">
                          {k.status}
                        </span>
                      </div>
                      <p className="text-slate-700">
                        <strong>Masalah:</strong> {k.deskripsiMasalah}
                      </p>
                      <p className="text-slate-700">
                        <strong>Penanganan:</strong> {k.penanganan}
                      </p>
                      <p className="text-slate-700">
                        <strong>Tindak Lanjut:</strong> {k.tindakLanjut}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Siswa ini belum memiliki catatan bimbingan konseling.
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      <ImportExcelModal
        isOpen={showImportExcelModal}
        onClose={() => setShowImportExcelModal(false)}
      />

      {/* Confirmation Modal - Delete Murid */}
      {deletingMurid && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hapus Data Murid</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Apakah Anda yakin ingin menghapus data murid <span className="font-bold text-slate-900">{deletingMurid.nama}</span> (NIS: {deletingMurid.nis}) dari database?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingMurid(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMurid(deletingMurid.id);
                  setDeletingMurid(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal - Delete Guru BK */}
      {deletingGuru && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hapus Data Guru BK</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Apakah Anda yakin ingin menghapus data guru BK <span className="font-bold text-slate-900">{deletingGuru.nama}</span> (NIP: {deletingGuru.nip}) dari database?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingGuru(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteGuruBk(deletingGuru.id);
                  setDeletingGuru(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal - Batch Delete Murid */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hapus Massal Data Siswa</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-700 bg-rose-50/70 p-3 rounded-xl border border-rose-100 leading-relaxed">
                Apakah Anda yakin ingin menghapus <span className="font-bold text-rose-700">{selectedMuridIds.length} data siswa</span> yang dipilih dari database?
              </p>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-40 overflow-y-auto text-xs space-y-1">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Daftar Siswa Terpilih ({selectedMuridIds.length}):
                </p>
                {muridList
                  .filter((m) => selectedMuridIds.includes(m.id))
                  .map((m) => (
                    <div
                      key={m.id}
                      className="flex justify-between items-center text-slate-700 py-1 border-b border-slate-100 last:border-0"
                    >
                      <span className="font-medium truncate max-w-[200px]">{m.nama}</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        NIS: {m.nis} ({m.kelas})
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteBatchDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus {selectedMuridIds.length} Siswa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
