export type JenisKelamin = 'L' | 'P';

export type TipeKonseling = 'Pribadi' | 'Kelompok';

export type KategoriKasus =
  | 'Akademik'
  | 'Perilaku/Kedisiplinan'
  | 'Pribadi/Emosional'
  | 'Sosial/Interpersonal'
  | 'Karir/Studi Lanjut'
  | 'Keluarga'
  | 'Lainnya';

export type TingkatUrgensi = 'Ringan' | 'Sedang' | 'Berat';

export type StatusKonseling =
  | 'Selesai'
  | 'Dalam Proses'
  | 'Perlu Tindak Lanjut Khusus'
  | 'Dirujuk (Referral)';

export interface Murid {
  id: string;
  nis: string;
  nisn: string;
  nama: string;
  kelas: string;
  jenisKelamin: JenisKelamin;
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  namaOrangTua: string;
  noHpOrangTua: string;
  catatanKhusus?: string;
}

export interface GuruBk {
  id: string;
  nip: string;
  nama: string;
  jenisKelamin: JenisKelamin;
  noHp: string;
  jabatan: string;
  binaanKelas: string[];
}

export interface ProfilSekolah {
  namaSekolah: string;
  npsn: string;
  alamatSekolah: string;
  kotaSekolah: string;
  provinsi: string;
  kodePos: string;
  teleponSekolah: string;
  emailSekolah: string;
  websiteSekolah?: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  logoUrl?: string;
  logoKabupatenUrl?: string; // Logo Kabupaten/Pemda (Kiri Kop Surat)
  logoSekolahUrl?: string;   // Logo Sekolah (Kanan Kop Surat)
}

export interface DataKonseling {
  id: string;
  tanggal: string; // YYYY-MM-DD
  waktu: string;
  tipe: TipeKonseling;
  studentIds: string[]; // 1 for Pribadi, 1+ for Kelompok
  guruBkId: string;
  kategoriKasus: KategoriKasus;
  tingkatUrgensi: TingkatUrgensi;
  tempat: string;
  deskripsiMasalah: string;
  penanganan: string;
  tindakLanjut: string;
  status: StatusKonseling;
  evaluasiCatatan?: string;
  createdAt: string;
}

export interface SuratPanggilan {
  id: string;
  nomorSurat: string;
  tanggalSurat: string; // YYYY-MM-DD
  tipePanggilan?: 'Individu' | 'Kolektif';
  studentId: string; // primary/first student id
  studentIds?: string[]; // list of student IDs when Kolektif
  formatCetakKolektif?: 'Tabel Kolektif' | 'Lembar Per Siswa';
  hariTanggalPanggilan: string;
  waktuPanggilan: string;
  tempatPanggilan: string;
  menemuiGuruBkId: string;
  alasanPanggilan: string;
  sifat: 'Biasa' | 'Penting' | 'Sangat Rahasia';
  statusHadir?: 'Belum Hadir' | 'Hadir' | 'Dijadwalkan Ulang';
  createdAt: string;
}

export interface SuratTugas {
  id: string;
  nomorSurat: string;
  tanggalSurat: string;
  menimbang: string;
  mengingat: string;
  ditugaskanGuruBkIds: string[];
  maksudTujuan: string;
  tempatPelaksanaan: string;
  tanggalPelaksanaan: string;
  dikeluarkanDi: string;
  createdAt: string;
}

export type TipeSuratPernyataan =
  | 'Kedisiplinan & Tata Tertib'
  | 'Perbaikan Kehadiran & Presensi'
  | 'Komitmen Belajar & Akademik'
  | 'Pernyataan Orang Tua / Wali'
  | 'Pernyataan Bebas Perundungan (Bullying)'
  | 'Lainnya';

export interface SuratPernyataan {
  id: string;
  nomorSurat: string;
  tanggalSurat: string; // YYYY-MM-DD
  studentId: string;
  guruBkId: string;
  tipePernyataan: TipeSuratPernyataan;
  judulPernyataan: string;
  poinPernyataan: string[];
  sanksiKonsekuensi: string;
  pembuatPernyataan: 'Siswa' | 'Orang Tua / Wali' | 'Siswa & Orang Tua';
  dikeluarkanDi: string;
  butuhMaterai: boolean;
  catatanTambahan?: string;
  createdAt: string;
}
