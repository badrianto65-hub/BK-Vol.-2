import React from 'react';
import { useDb } from '../context/DbContext';
import {
  Users,
  FileCheck2,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  BookOpen,
  Plus,
  Mail,
  Award,
  Database,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TabType } from './Header';

interface DashboardProps {
  setActiveTab: (tab: TabType) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { konselingList, muridList, guruBkList, profilSekolah } = useDb();

  // Metrics
  const totalKonseling = konselingList.length;
  const konselingPribadi = konselingList.filter((k) => k.tipe === 'Pribadi').length;
  const konselingKelompok = konselingList.filter((k) => k.tipe === 'Kelompok').length;
  const selesaiCount = konselingList.filter((k) => k.status === 'Selesai').length;
  const perluTindakLanjutCount = konselingList.filter(
    (k) => k.status === 'Perlu Tindak Lanjut Khusus' || k.status === 'Dirujuk (Referral)'
  ).length;

  // Unique students served
  const servedStudentIds = new Set<string>();
  konselingList.forEach((k) => k.studentIds.forEach((id) => servedStudentIds.add(id)));
  const totalServedStudents = servedStudentIds.size;

  // Kategori Kasus Data
  const kategoriMap: Record<string, number> = {
    Akademik: 0,
    'Perilaku/Kedisiplinan': 0,
    'Pribadi/Emosional': 0,
    'Sosial/Interpersonal': 0,
    'Karir/Studi Lanjut': 0,
    Keluarga: 0,
    Lainnya: 0,
  };
  konselingList.forEach((k) => {
    if (kategoriMap[k.kategoriKasus] !== undefined) {
      kategoriMap[k.kategoriKasus] += 1;
    } else {
      kategoriMap['Lainnya'] += 1;
    }
  });

  const dataKategoriChart = Object.keys(kategoriMap).map((key) => ({
    name: key,
    Jumlah: kategoriMap[key],
  }));

  // Urgensi Kasus Data
  const urgensiMap: Record<string, number> = { Ringan: 0, Sedang: 0, Berat: 0 };
  konselingList.forEach((k) => {
    if (urgensiMap[k.tingkatUrgensi] !== undefined) {
      urgensiMap[k.tingkatUrgensi] += 1;
    }
  });

  const dataUrgensiChart = [
    { name: 'Ringan', value: urgensiMap['Ringan'], color: '#10b981' }, // emerald
    { name: 'Sedang', value: urgensiMap['Sedang'], color: '#f59e0b' }, // amber
    { name: 'Berat', value: urgensiMap['Berat'], color: '#ef4444' }, // rose
  ].filter((item) => item.value > 0);

  // Status Kasus Data
  const statusMap: Record<string, number> = {
    Selesai: 0,
    'Dalam Proses': 0,
    'Perlu Tindak Lanjut Khusus': 0,
    'Dirujuk (Referral)': 0,
  };
  konselingList.forEach((k) => {
    if (statusMap[k.status] !== undefined) {
      statusMap[k.status] += 1;
    }
  });

  const dataStatusChart = [
    { name: 'Selesai', value: statusMap['Selesai'], color: '#10b981' },
    { name: 'Dalam Proses', value: statusMap['Dalam Proses'], color: '#6366f1' }, // indigo
    { name: 'Perlu Tindak Lanjut', value: statusMap['Perlu Tindak Lanjut Khusus'], color: '#f59e0b' },
    { name: 'Dirujuk', value: statusMap['Dirujuk (Referral)'], color: '#ec4899' },
  ].filter((item) => item.value > 0);

  // Konseling per Kelas
  const kelasMap: Record<string, number> = {};
  konselingList.forEach((k) => {
    k.studentIds.forEach((sId) => {
      const student = muridList.find((m) => m.id === sId);
      if (student) {
        const kelasPrefix = student.kelas;
        kelasMap[kelasPrefix] = (kelasMap[kelasPrefix] || 0) + 1;
      }
    });
  });

  const dataKelasChart = Object.keys(kelasMap).map((k) => ({
    kelas: k,
    Jumlah: kelasMap[k],
  }));

  // Urgent attention cases
  const urgentCases = konselingList.filter(
    (k) => k.tingkatUrgensi === 'Berat' || k.status === 'Perlu Tindak Lanjut Khusus'
  );

  // Recent logs (latest 3)
  const recentLogs = [...konselingList].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 3);

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Top Action Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
              Bento Grid Overview
            </span>
            <span className="text-xs text-slate-400">• {profilSekolah.namaSekolah}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Bimbingan & Konseling
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Selamat datang kembali! Ringkasan lengkap statistik dan administrasi konseling sekolah.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('input-konseling')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 inline-flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input Kasus</span>
          </button>
          <button
            onClick={() => setActiveTab('surat-pernyataan')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 inline-flex items-center space-x-1.5 transition cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>+ Surat Pernyataan</span>
          </button>
          <button
            onClick={() => setActiveTab('arsip')}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            Lihat Arsip
          </button>
        </div>
      </div>

      {/* URGENT ATENTION BANNER IF ANY */}
      {urgentCases.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-rose-500 text-white">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-rose-950 text-sm">
                  Perhatian Khusus ({urgentCases.length} Kasus Berurgensi Tinggi / Referral)
                </h3>
                <p className="text-[11px] text-rose-700">
                  Siswa membutuhkan penanganan khusus atau panggilan orang tua segera.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('arsip')}
              className="text-xs font-bold text-rose-800 hover:text-rose-950 flex items-center space-x-1 bg-white px-3 py-1.5 rounded-xl border border-rose-200 shadow-sm"
            >
              <span>Detail Arsip</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentCases.slice(0, 2).map((k) => {
              const students = muridList.filter((m) => k.studentIds.includes(m.id));
              const guru = guruBkList.find((g) => g.id === k.guruBkId);
              return (
                <div
                  key={k.id}
                  className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-sm text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {students.map((s) => s.nama).join(', ')} ({students.map((s) => s.kelas).join(', ')})
                    </span>
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Urgensi: {k.tingkatUrgensi}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] line-clamp-2">{k.deskripsiMasalah}</p>
                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                    <span>Guru: {guru?.nama || 'N/A'}</span>
                    <button
                      onClick={() => setActiveTab('surat-panggilan')}
                      className="text-indigo-600 font-bold hover:underline inline-flex items-center space-x-1"
                    >
                      <Mail className="w-3 h-3" />
                      <span>+ Surat Panggilan</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BENTO GRID MAIN CONTAINER */}
      <div className="grid grid-cols-12 gap-5">
        {/* BENTO 1-4: 4 KPI STATS BENTO BOXES (TOP LEVEL) */}
        <div className="col-span-6 lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Total Konseling</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">{totalKonseling}</h3>
            <p className="text-[11px] text-indigo-600 font-bold mt-1">
              {konselingPribadi} Pribadi • {konselingKelompok} Kelompok
            </p>
          </div>
        </div>

        <div className="col-span-6 lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Siswa Terlayani</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">{totalServedStudents}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Dari {muridList.length} siswa terdaftar
            </p>
          </div>
        </div>

        <div className="col-span-6 lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Kasus Selesai</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-emerald-600">{selesaiCount}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {totalKonseling > 0
                ? `${Math.round((selesaiCount / totalKonseling) * 100)}% Penanganan Tuntas`
                : '100% Selesai'}
            </p>
          </div>
        </div>

        <div className="col-span-6 lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Tindak Lanjut</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-amber-600">{perluTindakLanjutCount}</h3>
            <p className="text-[11px] text-amber-600 font-bold mt-1">Perlu Atensi Khusus</p>
          </div>
        </div>

        {/* BENTO 5: Recent Log Arsip Bento Box (MOVED UP) */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Log Konseling Terbaru</h3>
                <p className="text-[11px] text-slate-500">Catatan riwayat bimbingan terkini</p>
              </div>
              <button
                onClick={() => setActiveTab('arsip')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-3">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => {
                  const students = muridList.filter((m) => log.studentIds.includes(m.id));
                  const studentName = students.map((s) => s.nama).join(', ') || 'Siswa';
                  const studentClass = students[0]?.kelas || 'BK';

                  return (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition"
                    >
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-extrabold shrink-0">
                        {studentName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {studentName} <span className="text-[10px] text-slate-400">({studentClass})</span>
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          Bidang: {log.kategoriKasus} • {log.status}
                        </p>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 shrink-0">
                        {log.tanggal}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center py-6 text-xs text-slate-400">Belum ada riwayat konseling.</p>
              )}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Arsip Terdata:</span>
            <span className="font-bold text-slate-900">{totalKonseling} Sesi</span>
          </div>
        </div>

        {/* BENTO 6: PDF Quick Actions Bento Box (MOVED UP) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm mb-1">Administrasi PDF</h3>
            <p className="text-[11px] text-slate-500 mb-4">Cetak instan dokumen resmi sekolah</p>

            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('surat-panggilan')}
                className="w-full flex items-center gap-3 p-3.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-2xl transition text-left group"
              >
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-indigo-900 group-hover:text-indigo-950">
                    Surat Panggilan
                  </p>
                  <p className="text-[10px] text-indigo-600 font-medium">Orang Tua / Wali Murid</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('surat-tugas')}
                className="w-full flex items-center gap-3 p-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-2xl transition text-left group"
              >
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-amber-900 group-hover:text-amber-950">
                    Surat Tugas
                  </p>
                  <p className="text-[10px] text-amber-600 font-medium">Dinas / Homevisit BK</p>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center font-medium">
            Format Resmi Kop Surat Sekolah
          </div>
        </div>

        {/* BENTO 7: Database Stats Dark Bento Box (MOVED UP) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-slate-900 rounded-3xl p-6 text-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Database Master BK
              </h3>
              <Database className="w-4 h-4 text-indigo-400" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/50">
                <p className="text-2xl font-black text-white">{muridList.length}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight mt-0.5">
                  Total Murid
                </p>
              </div>
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/50">
                <p className="text-2xl font-black text-white">{guruBkList.length}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight mt-0.5">
                  Guru BK Active
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
              <div className="bg-indigo-500 h-2 rounded-full w-[85%] transition-all" />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
              <span>Local Offline Persistence</span>
              <span className="text-indigo-400 font-bold">Terhubung OK</span>
            </div>
          </div>
        </div>

        {/* BENTO 8: Tingkat Urgensi Kasus (Now on Left) */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Tingkat Urgensi Kasus</h3>
            <p className="text-xs text-slate-500 mb-2">Klasifikasi kadar prioritas penanganan</p>

            <div className="h-60 w-full flex items-center justify-center">
              {dataUrgensiChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataUrgensiChart}
                      cx="50%"
                      cy="45%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {dataUrgensiChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-xs text-slate-400">Belum ada data konseling</div>
              )}
            </div>
          </div>
        </div>

        {/* BENTO 9: Tren Bidang Bimbingan & Kasus (Now on Right) */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Tren Bidang Bimbingan & Kasus</h3>
                <p className="text-slate-500 text-xs">Statistik distribusi kategori masalah siswa</p>
              </div>
              <div className="flex flex-wrap gap-3 text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div> Utama
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Tuntas
                </span>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataKategoriChart} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                    }}
                  />
                  <Bar dataKey="Jumlah" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* BENTO 10: Indigo Highlight Status Summary Bento */}
        <div className="col-span-12 lg:col-span-5 bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/20 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-indigo-500/30 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 bg-indigo-700/60 px-2.5 py-1 rounded-full border border-indigo-400/30">
                Status Layanan Hari Ini
              </span>
              <Calendar className="w-4 h-4 text-indigo-200" />
            </div>
            <h3 className="text-lg font-bold text-white capitalize">{currentDateFormatted}</h3>
          </div>

          <div className="my-6 space-y-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-100 font-medium">Kasus Pribadi</p>
                <p className="text-2xl font-extrabold">{konselingPribadi} <span className="text-xs font-normal opacity-80">Sesi</span></p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-bold text-white">
                P
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-100 font-medium">Konseling Kelompok</p>
                <p className="text-2xl font-extrabold">{konselingKelompok} <span className="text-xs font-normal opacity-80">Kelompok</span></p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-bold text-white">
                K
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-indigo-500/50 flex items-center justify-between text-[11px] text-indigo-200">
            <span className="font-medium">Kepala Sekolah:</span>
            <span className="font-bold text-white">{profilSekolah.namaKepalaSekolah || 'Dr. Hartono'}</span>
          </div>
        </div>

        {/* BENTO 11: Konseling per Kelas Bento Box */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Konseling per Rombel / Kelas</h3>
            <p className="text-xs text-slate-500 mb-2">Frekuensi siswa terlayani berdasarkan kelas</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataKelasChart} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="kelas" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="Jumlah" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

