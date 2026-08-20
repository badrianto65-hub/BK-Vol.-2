import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useDb } from '../context/DbContext';
import { Murid } from '../types';
import {
  FileSpreadsheet,
  Upload,
  ClipboardList,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Table,
  HelpCircle,
} from 'lucide-react';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({ isOpen, onClose }) => {
  const { importMuridBatch } = useDb();

  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pasteText, setPasteText] = useState('');
  const [parsedData, setParsedData] = useState<Omit<Murid, 'id'>[]>([]);
  const [fileName, setFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  if (!isOpen) return null;

  // Helper to normalize header keys
  const mapRowToMurid = (row: Record<string, any>): Omit<Murid, 'id'> | null => {
    const keys = Object.keys(row);
    if (keys.length === 0) return null;

    let nis = '';
    let nisn = '';
    let nama = '';
    let kelas = '7A';
    let jenisKelamin: 'L' | 'P' = 'L';
    let tempatLahir = '';
    let tanggalLahir = '';
    let namaOrangTua = '';
    let noHpOrangTua = '';
    let alamat = '';
    let catatanKhusus = '';

    for (const key of keys) {
      const cleanKey = key.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const val = row[key] ? row[key].toString().trim() : '';

      if (cleanKey === 'nis') nis = val;
      else if (cleanKey === 'nisn') nisn = val;
      else if (cleanKey.includes('nama') && !cleanKey.includes('orangtua') && !cleanKey.includes('ortu') && !cleanKey.includes('wali')) {
        nama = val;
      }
      else if (cleanKey.includes('kelas') || cleanKey.includes('rombel')) kelas = val;
      else if (cleanKey.includes('kelamin') || cleanKey === 'jk' || cleanKey === 'lp' || cleanKey === 'jeniskelamin') {
        const uppercaseVal = val.toUpperCase();
        if (uppercaseVal.startsWith('P') || uppercaseVal.includes('PEREMPUAN')) {
          jenisKelamin = 'P';
        } else {
          jenisKelamin = 'L';
        }
      } else if (cleanKey.includes('tempat') || cleanKey.includes('lahirtempat') || cleanKey.includes('tmptlahir')) {
        tempatLahir = val;
      } else if (cleanKey.includes('tanggal') || cleanKey.includes('tgllahir') || cleanKey.includes('tgl') || cleanKey.includes('birth')) {
        tanggalLahir = val;
      } else if (cleanKey.includes('orangtua') || cleanKey.includes('ortu') || cleanKey.includes('wali') || cleanKey.includes('ayah') || cleanKey.includes('ibu')) {
        namaOrangTua = val;
      } else if (cleanKey.includes('hp') || cleanKey.includes('telepon') || cleanKey.includes('wa') || cleanKey.includes('phone') || cleanKey.includes('kontak')) {
        noHpOrangTua = val;
      } else if (cleanKey.includes('alamat') || cleanKey.includes('domisili') || cleanKey.includes('tinggal')) {
        alamat = val;
      } else if (cleanKey.includes('catatan') || cleanKey.includes('khusus') || cleanKey.includes('minat') || cleanKey.includes('prestasi') || cleanKey.includes('keterangan')) {
        catatanKhusus = val;
      }
    }

    if (!nama) return null; // Nama is required

    return {
      nis: nis || `${Math.floor(100000 + Math.random() * 900000)}`,
      nisn: nisn || `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      nama,
      kelas: kelas || '7A',
      jenisKelamin,
      tempatLahir: tempatLahir || 'Indonesia',
      tanggalLahir: tanggalLahir || '2010-01-01',
      alamat: alamat || '-',
      namaOrangTua: namaOrangTua || '-',
      noHpOrangTua: noHpOrangTua || '-',
      catatanKhusus: catatanKhusus || '',
    };
  };

  // Handle File Upload (.xlsx, .xls, .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonRows.length === 0) {
          setErrorMessage('File Excel kosong atau format tidak sesuai.');
          return;
        }

        const formattedList: Omit<Murid, 'id'>[] = [];
        jsonRows.forEach((row) => {
          const mapped = mapRowToMurid(row);
          if (mapped) formattedList.push(mapped);
        });

        if (formattedList.length === 0) {
          setErrorMessage('Tidak ada data siswa valid yang dapat dibaca. Pastikan terdapat kolom Nama.');
        } else {
          setParsedData(formattedList);
        }
      } catch (err) {
        console.error(err);
        setErrorMessage('Gagal membaca file Excel. Pastikan format file .xlsx, .xls, atau .csv');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Handle Paste from Excel (TSV / CSV)
  const handleProcessPaste = () => {
    setErrorMessage('');
    if (!pasteText.trim()) {
      setErrorMessage('Silakan tempel (paste) data dari tabel Excel terlebih dahulu.');
      return;
    }

    const lines = pasteText.trim().split('\n');
    if (lines.length === 0) return;

    // Check if first line is header or data
    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    const firstRowItems = lines[0].split(delimiter).map((item) => item.trim());

    const hasHeader = firstRowItems.some((item) => {
      const lower = item.toLowerCase();
      return lower.includes('nama') || lower.includes('nis') || lower.includes('kelas');
    });

    let headers: string[] = [];
    let startIdx = 0;

    if (hasHeader) {
      headers = firstRowItems;
      startIdx = 1;
    } else {
      // Default fallback headers
      headers = [
        'NIS',
        'NISN',
        'Nama Lengkap',
        'Kelas',
        'Jenis Kelamin',
        'Tempat Lahir',
        'Tanggal Lahir',
        'Alamat',
        'Nama Orang Tua',
        'No HP Orang Tua',
        'Catatan Khusus',
      ];
      startIdx = 0;
    }

    const formattedList: Omit<Murid, 'id'>[] = [];

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ''));
      const rowObj: Record<string, string> = {};

      headers.forEach((h, idx) => {
        rowObj[h] = cols[idx] || '';
      });

      // If no explicit header matching, fallback by column index
      if (!hasHeader) {
        rowObj['nis'] = cols[0] || '';
        rowObj['nisn'] = cols[1] || '';
        rowObj['nama'] = cols[2] || cols[0] || '';
        rowObj['kelas'] = cols[3] || '7A';
        rowObj['jenisKelamin'] = cols[4] || 'L';
        rowObj['tempatLahir'] = cols[5] || '';
        rowObj['tanggalLahir'] = cols[6] || '';
        rowObj['alamat'] = cols[7] || '-';
        rowObj['namaOrangTua'] = cols[8] || '-';
        rowObj['noHpOrangTua'] = cols[9] || '-';
        rowObj['catatanKhusus'] = cols[10] || '';
      }

      const mapped = mapRowToMurid(rowObj);
      if (mapped) formattedList.push(mapped);
    }

    if (formattedList.length === 0) {
      setErrorMessage('Gagal memproses teks yang ditempel. Pastikan terdapat data nama siswa.');
    } else {
      setParsedData(formattedList);
    }
  };

  // Generate and Download Sample Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        NIS: '232401',
        NISN: '0089123401',
        'Nama Lengkap': 'Ahmad Fauzi',
        Kelas: '8A',
        'Jenis Kelamin': 'L',
        'Tempat Lahir': 'Jakarta',
        'Tanggal Lahir': '2010-05-14',
        Alamat: 'Jl. Merdeka No. 12, Kebayoran Baru',
        'Nama Orang Tua': 'Budi Santoso',
        'No HP Orang Tua': '081234567890',
        'Catatan Khusus': 'Pengurus OSIS, Gemar Matematika',
      },
      {
        NIS: '232402',
        NISN: '0089123402',
        'Nama Lengkap': 'Siti Rahmawati',
        Kelas: '8A',
        'Jenis Kelamin': 'P',
        'Tempat Lahir': 'Bandung',
        'Tanggal Lahir': '2010-08-20',
        Alamat: 'Jl. Pemuda No. 45, Cilandak',
        'Nama Orang Tua': 'Hasan Basri',
        'No HP Orang Tua': '081987654321',
        'Catatan Khusus': 'Perlu motivasi belajar matematika',
      },
      {
        NIS: '232403',
        NISN: '0089123403',
        'Nama Lengkap': 'Rian Ardianto',
        Kelas: '8B',
        'Jenis Kelamin': 'L',
        'Tempat Lahir': 'Depok',
        'Tanggal Lahir': '2011-02-10',
        Alamat: 'Jl. Melati No. 8, Margonda',
        'Nama Orang Tua': 'Suryadi',
        'No HP Orang Tua': '085711223344',
        'Catatan Khusus': 'Atlet bulutangkis sekolah',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');

    XLSX.writeFile(workbook, 'Template_Import_Siswa_BK.xlsx');
  };

  // Remove preview item
  const handleRemoveRow = (index: number) => {
    setParsedData((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Final Commit Import
  const handleCommitImport = () => {
    if (parsedData.length === 0) return;
    const count = importMuridBatch(parsedData);
    setImportedCount(count);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setParsedData([]);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white">
                Import Data Siswa Otomatis (Excel / CSV)
              </h3>
              <p className="text-xs text-slate-400">
                Tambah puluhan data murid sekaligus dengan upload file atau salin-tempel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Top Info Banner & Template Download Button */}
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-2.5">
              <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-indigo-950 text-xs">
                  Format Kolom Excel yang Didukung:
                </p>
                <p className="text-[11px] text-indigo-700 leading-relaxed mt-0.5">
                  <span className="font-semibold">NIS, NISN, Nama Lengkap, Kelas, Jenis Kelamin (L/P), Tempat Lahir, Tanggal Lahir, Alamat, Nama Orang Tua, No HP Orang Tua, Catatan Khusus</span>. Sistem mengenali tata letak secara otomatis.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 bg-white hover:bg-indigo-100/60 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs inline-flex items-center space-x-1.5 shadow-sm shrink-0 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Template Excel</span>
            </button>
          </div>

          {/* Success Screen */}
          {isSuccess ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-extrabold text-slate-900">
                Berhasil Memproses Import!
              </h4>
              <p className="text-sm font-semibold text-emerald-700">
                +{importedCount} data siswa baru telah berhasil disimpan ke database.
              </p>
            </div>
          ) : (
            <>
              {/* Method Selector Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('upload');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition ${
                    activeTab === 'upload'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload File Excel (.xlsx / .csv)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('paste');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition ${
                    activeTab === 'paste'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Salin-Tempel (Copy-Paste) Tabel</span>
                </button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              {/* Tab 1: Upload File */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-3xl p-8 text-center bg-slate-50/50 hover:bg-indigo-50/30 transition cursor-pointer relative group">
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                      <Upload className="w-7 h-7" />
                    </div>
                    <p className="font-bold text-slate-800 text-sm">
                      Klik atau Seret (Drag) File Excel Ke Sini
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Mendukung format .xlsx, .xls, dan .csv
                    </p>
                    {fileName && (
                      <span className="inline-block mt-3 px-3 py-1 bg-indigo-600 text-white font-bold rounded-full text-xs shadow-sm">
                        File Terpilih: {fileName}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Copy-Paste */}
              {activeTab === 'paste' && (
                <div className="space-y-3">
                  <label className="font-bold text-slate-700 block">
                    Tempelkan Baris Tabel Excel / Google Sheets Di Sini:
                  </label>
                  <textarea
                    rows={6}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder={`Contoh tempelkan data dari Excel:\n232401\t0089123401\tAhmad Fauzi\t8A\tL\tJakarta\t2010-05-14\tJl. Merdeka No. 12\tBudi Santoso\t081234567890\tPengurus OSIS`}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleProcessPaste}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition inline-flex items-center space-x-2"
                  >
                    <Table className="w-4 h-4" />
                    <span>Proses & Pratinjau Teks</span>
                  </button>
                </div>
              )}

              {/* Preview Table Section */}
              {parsedData.length > 0 && (
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        Pratinjau Data Siswa Terbaca
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                        {parsedData.length} Siswa Siap Diimport
                      </span>
                    </div>

                    <button
                      onClick={() => setParsedData([])}
                      className="text-xs text-rose-600 hover:underline font-bold"
                    >
                      Batal / Bersihkan
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[10px] sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">NIS / NISN</th>
                          <th className="py-2.5 px-3">Nama Siswa</th>
                          <th className="py-2.5 px-3">Kelas</th>
                          <th className="py-2.5 px-3">L/P</th>
                          <th className="py-2.5 px-3">Tempat, Tgl Lahir</th>
                          <th className="py-2.5 px-3">Alamat</th>
                          <th className="py-2.5 px-3">Orang Tua</th>
                          <th className="py-2.5 px-3">No HP</th>
                          <th className="py-2.5 px-3">Catatan Khusus</th>
                          <th className="py-2.5 px-3 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedData.map((m, index) => (
                          <tr key={index} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                              {m.nis} / {m.nisn}
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-900">{m.nama}</td>
                            <td className="py-2 px-3 font-semibold text-indigo-600">{m.kelas}</td>
                            <td className="py-2 px-3 font-semibold">
                              {m.jenisKelamin === 'L' ? (
                                <span className="text-blue-600">L</span>
                              ) : (
                                <span className="text-pink-600">P</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-600">
                              {m.tempatLahir}, {m.tanggalLahir}
                            </td>
                            <td className="py-2 px-3 text-slate-600 max-w-xs truncate" title={m.alamat}>
                              {m.alamat}
                            </td>
                            <td className="py-2 px-3 text-slate-600">{m.namaOrangTua}</td>
                            <td className="py-2 px-3 text-slate-600 font-mono">{m.noHpOrangTua}</td>
                            <td className="py-2 px-3 text-slate-500 italic max-w-xs truncate" title={m.catatanKhusus}>
                              {m.catatanKhusus || '-'}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                onClick={() => handleRemoveRow(index)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                                title="Hapus baris ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Save Import Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleCommitImport}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/25 transition text-xs inline-flex items-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simpan +{parsedData.length} Siswa Ke Database</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
