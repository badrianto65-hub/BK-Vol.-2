import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Murid,
  GuruBk,
  ProfilSekolah,
  DataKonseling,
  SuratPanggilan,
  SuratTugas,
  SuratPernyataan,
} from '../types';
import {
  initialSekolah,
  initialGuruBk,
  initialMurid,
  initialKonseling,
  initialSuratPanggilan,
  initialSuratTugas,
  initialSuratPernyataan,
} from '../data/initialData';

interface DbContextType {
  profilSekolah: ProfilSekolah;
  updateProfilSekolah: (data: ProfilSekolah) => void;

  muridList: Murid[];
  addMurid: (murid: Omit<Murid, 'id'>) => void;
  importMuridBatch: (newMurids: Omit<Murid, 'id'>[]) => number;
  updateMurid: (id: string, murid: Partial<Murid>) => void;
  deleteMurid: (id: string) => void;
  deleteMuridBatch: (ids: string[]) => void;

  guruBkList: GuruBk[];
  addGuruBk: (guru: Omit<GuruBk, 'id'>) => void;
  updateGuruBk: (id: string, guru: Partial<GuruBk>) => void;
  deleteGuruBk: (id: string) => void;

  konselingList: DataKonseling[];
  addKonseling: (konseling: Omit<DataKonseling, 'id' | 'createdAt'>) => void;
  updateKonseling: (id: string, konseling: Partial<DataKonseling>) => void;
  deleteKonseling: (id: string) => void;

  suratPanggilanList: SuratPanggilan[];
  addSuratPanggilan: (surat: Omit<SuratPanggilan, 'id' | 'createdAt'>) => void;
  updateSuratPanggilan: (id: string, surat: Partial<SuratPanggilan>) => void;
  deleteSuratPanggilan: (id: string) => void;

  suratTugasList: SuratTugas[];
  addSuratTugas: (surat: Omit<SuratTugas, 'id' | 'createdAt'>) => void;
  updateSuratTugas: (id: string, surat: Partial<SuratTugas>) => void;
  deleteSuratTugas: (id: string) => void;

  suratPernyataanList: SuratPernyataan[];
  addSuratPernyataan: (surat: Omit<SuratPernyataan, 'id' | 'createdAt'>) => void;
  updateSuratPernyataan: (id: string, surat: Partial<SuratPernyataan>) => void;
  deleteSuratPernyataan: (id: string) => void;

  resetToDefaultData: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonString: string) => boolean;
}

const STORAGE_KEYS = {
  SEKOLAH: 'bk_vol2_sekolah',
  MURID: 'bk_vol2_murid',
  GURU_BK: 'bk_vol2_guru_bk',
  KONSELING: 'bk_vol2_konseling',
  SURAT_PANGGILAN: 'bk_vol2_surat_panggilan',
  SURAT_TUGAS: 'bk_vol2_surat_tugas',
  SURAT_PERNYATAAN: 'bk_vol2_surat_pernyataan',
};

const DbContext = createContext<DbContextType | undefined>(undefined);

export const DbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profilSekolah, setProfilSekolah] = useState<ProfilSekolah>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SEKOLAH);
    return saved ? JSON.parse(saved) : initialSekolah;
  });

  const [muridList, setMuridList] = useState<Murid[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MURID);
    return saved ? JSON.parse(saved) : initialMurid;
  });

  const [guruBkList, setGuruBkList] = useState<GuruBk[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GURU_BK);
    return saved ? JSON.parse(saved) : initialGuruBk;
  });

  const [konselingList, setKonselingList] = useState<DataKonseling[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.KONSELING);
    return saved ? JSON.parse(saved) : initialKonseling;
  });

  const [suratPanggilanList, setSuratPanggilanList] = useState<SuratPanggilan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SURAT_PANGGILAN);
    return saved ? JSON.parse(saved) : initialSuratPanggilan;
  });

  const [suratTugasList, setSuratTugasList] = useState<SuratTugas[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SURAT_TUGAS);
    return saved ? JSON.parse(saved) : initialSuratTugas;
  });

  const [suratPernyataanList, setSuratPernyataanList] = useState<SuratPernyataan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SURAT_PERNYATAAN);
    return saved ? JSON.parse(saved) : initialSuratPernyataan;
  });

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SEKOLAH, JSON.stringify(profilSekolah));
  }, [profilSekolah]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MURID, JSON.stringify(muridList));
  }, [muridList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GURU_BK, JSON.stringify(guruBkList));
  }, [guruBkList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.KONSELING, JSON.stringify(konselingList));
  }, [konselingList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SURAT_PANGGILAN, JSON.stringify(suratPanggilanList));
  }, [suratPanggilanList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SURAT_TUGAS, JSON.stringify(suratTugasList));
  }, [suratTugasList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SURAT_PERNYATAAN, JSON.stringify(suratPernyataanList));
  }, [suratPernyataanList]);

  // Actions
  const updateProfilSekolah = (data: ProfilSekolah) => {
    setProfilSekolah(data);
  };

  // Murid Actions
  const addMurid = (muridData: Omit<Murid, 'id'>) => {
    const newMurid: Murid = {
      ...muridData,
      id: `mrd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    setMuridList((prev) => [newMurid, ...prev]);
  };

  const importMuridBatch = (newMurids: Omit<Murid, 'id'>[]) => {
    if (!newMurids || newMurids.length === 0) return 0;
    const formatted: Murid[] = newMurids.map((m, index) => ({
      ...m,
      id: `mrd-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
    }));
    setMuridList((prev) => [...formatted, ...prev]);
    return formatted.length;
  };

  const updateMurid = (id: string, updated: Partial<Murid>) => {
    setMuridList((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
  };

  const deleteMurid = (id: string) => {
    setMuridList((prev) => prev.filter((m) => m.id !== id));
  };

  const deleteMuridBatch = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    setMuridList((prev) => prev.filter((m) => !idSet.has(m.id)));
  };

  // Guru BK Actions
  const addGuruBk = (guruData: Omit<GuruBk, 'id'>) => {
    const newGuru: GuruBk = {
      ...guruData,
      id: `gbk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    setGuruBkList((prev) => [...prev, newGuru]);
  };

  const updateGuruBk = (id: string, updated: Partial<GuruBk>) => {
    setGuruBkList((prev) => prev.map((g) => (g.id === id ? { ...g, ...updated } : g)));
  };

  const deleteGuruBk = (id: string) => {
    setGuruBkList((prev) => prev.filter((g) => g.id !== id));
  };

  // Konseling Actions
  const addKonseling = (konselingData: Omit<DataKonseling, 'id' | 'createdAt'>) => {
    const newKonseling: DataKonseling = {
      ...konselingData,
      id: `ksl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    setKonselingList((prev) => [newKonseling, ...prev]);
  };

  const updateKonseling = (id: string, updated: Partial<DataKonseling>) => {
    setKonselingList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, ...updated } : k))
    );
  };

  const deleteKonseling = (id: string) => {
    setKonselingList((prev) => prev.filter((k) => k.id !== id));
  };

  // Surat Panggilan Actions
  const addSuratPanggilan = (suratData: Omit<SuratPanggilan, 'id' | 'createdAt'>) => {
    const newSurat: SuratPanggilan = {
      ...suratData,
      id: `sp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    setSuratPanggilanList((prev) => [newSurat, ...prev]);
  };

  const updateSuratPanggilan = (id: string, updated: Partial<SuratPanggilan>) => {
    setSuratPanggilanList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  };

  const deleteSuratPanggilan = (id: string) => {
    setSuratPanggilanList((prev) => prev.filter((s) => s.id !== id));
  };

  // Surat Tugas Actions
  const addSuratTugas = (suratData: Omit<SuratTugas, 'id' | 'createdAt'>) => {
    const newSurat: SuratTugas = {
      ...suratData,
      id: `st-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    setSuratTugasList((prev) => [newSurat, ...prev]);
  };

  const updateSuratTugas = (id: string, updated: Partial<SuratTugas>) => {
    setSuratTugasList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  };

  const deleteSuratTugas = (id: string) => {
    setSuratTugasList((prev) => prev.filter((s) => s.id !== id));
  };

  // Surat Pernyataan Actions
  const addSuratPernyataan = (suratData: Omit<SuratPernyataan, 'id' | 'createdAt'>) => {
    const newSurat: SuratPernyataan = {
      ...suratData,
      id: `spny-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    setSuratPernyataanList((prev) => [newSurat, ...prev]);
  };

  const updateSuratPernyataan = (id: string, updated: Partial<SuratPernyataan>) => {
    setSuratPernyataanList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  };

  const deleteSuratPernyataan = (id: string) => {
    setSuratPernyataanList((prev) => prev.filter((s) => s.id !== id));
  };

  // Reset to default
  const resetToDefaultData = () => {
    setProfilSekolah(initialSekolah);
    setMuridList(initialMurid);
    setGuruBkList(initialGuruBk);
    setKonselingList(initialKonseling);
    setSuratPanggilanList(initialSuratPanggilan);
    setSuratTugasList(initialSuratTugas);
    setSuratPernyataanList(initialSuratPernyataan);
  };

  // Export DB
  const exportDatabaseJson = () => {
    const exportData = {
      profilSekolah,
      muridList,
      guruBkList,
      konselingList,
      suratPanggilanList,
      suratTugasList,
      suratPernyataanList,
      exportedAt: new Date().toISOString(),
      version: 'BK Vol. 2 Standard',
    };
    return JSON.stringify(exportData, null, 2);
  };

  // Import DB
  const importDatabaseJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profilSekolah) setProfilSekolah(parsed.profilSekolah);
      if (Array.isArray(parsed.muridList)) setMuridList(parsed.muridList);
      if (Array.isArray(parsed.guruBkList)) setGuruBkList(parsed.guruBkList);
      if (Array.isArray(parsed.konselingList)) setKonselingList(parsed.konselingList);
      if (Array.isArray(parsed.suratPanggilanList)) setSuratPanggilanList(parsed.suratPanggilanList);
      if (Array.isArray(parsed.suratTugasList)) setSuratTugasList(parsed.suratTugasList);
      if (Array.isArray(parsed.suratPernyataanList)) setSuratPernyataanList(parsed.suratPernyataanList);
      return true;
    } catch (e) {
      console.error('Error importing JSON DB:', e);
      return false;
    }
  };

  return (
    <DbContext.Provider
      value={{
        profilSekolah,
        updateProfilSekolah,
        muridList,
        addMurid,
        importMuridBatch,
        updateMurid,
        deleteMurid,
        deleteMuridBatch,
        guruBkList,
        addGuruBk,
        updateGuruBk,
        deleteGuruBk,
        konselingList,
        addKonseling,
        updateKonseling,
        deleteKonseling,
        suratPanggilanList,
        addSuratPanggilan,
        updateSuratPanggilan,
        deleteSuratPanggilan,
        suratTugasList,
        addSuratTugas,
        updateSuratTugas,
        deleteSuratTugas,
        suratPernyataanList,
        addSuratPernyataan,
        updateSuratPernyataan,
        deleteSuratPernyataan,
        resetToDefaultData,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </DbContext.Provider>
  );
};

export const useDb = () => {
  const context = useContext(DbContext);
  if (!context) {
    throw new Error('useDb must be used within a DbProvider');
  }
  return context;
};
