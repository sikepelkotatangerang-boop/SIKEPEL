import { User, Document } from '@/types';

// ============================================
// Data Kelurahan dengan Alamat Kantor
// ============================================
// Data ini masih digunakan untuk auto-fill form SKTM
// Nantinya akan diganti dengan fetch dari database

export interface KelurahanData {
  nama: string;
  alamat: string;
  kecamatan: string;
  kota: string;
  kodePos: string;
  telepon: string;
  lurah: string;
  nipLurah: string;
}

export const dataKelurahan: Record<string, KelurahanData> = {
  'Kelurahan Cibodas': {
    nama: 'CIBODAS',
    alamat: 'Jl. Raya Cibodas No. 45, Cibodas',
    kecamatan: 'Cibodas',
    kota: 'Kota Tangerang',
    kodePos: '15138',
    telepon: '(021) 5523456',
    lurah: 'Drs. H. Ahmad Suryadi, M.Si',
    nipLurah: '196501011990031001',
  },
  'Kelurahan Cibodas Baru': {
    nama: 'CIBODAS BARU',
    alamat: 'Jl. Merdeka No. 123, Cibodas Baru',
    kecamatan: 'Cibodas',
    kota: 'Kota Tangerang',
    kodePos: '15139',
    telepon: '(021) 5523457',
    lurah: 'H. Bambang Hermanto, S.Sos',
    nipLurah: '196702121991031002',
  },
  'Kelurahan Panunggangan Barat': {
    nama: 'PANUNGGANGAN BARAT',
    alamat: 'Jl. Panunggangan Raya No. 88, Panunggangan Barat',
    kecamatan: 'Cibodas',
    kota: 'Kota Tangerang',
    kodePos: '15143',
    telepon: '(021) 5523458',
    lurah: 'Dra. Hj. Siti Maryam, M.M',
    nipLurah: '196803151992032001',
  },
  'Kelurahan Cibodasari': {
    nama: 'CIBODASARI',
    alamat: 'Jl. Cibodasari Utara No. 56, Cibodasari',
    kecamatan: 'Cibodas',
    kota: 'Kota Tangerang',
    kodePos: '15144',
    telepon: '(021) 5523459',
    lurah: 'H. Yusuf Hidayat, S.IP',
    nipLurah: '196904201993031003',
  },
  'Kelurahan Uwung Jaya': {
    nama: 'UWUNG JAYA',
    alamat: 'Jl. Uwung Jaya No. 77, Uwung Jaya',
    kecamatan: 'Cibodas',
    kota: 'Kota Tangerang',
    kodePos: '15145',
    telepon: '(021) 5523460',
    lurah: 'Drs. H. Rahmat Hidayat',
    nipLurah: '197005101994031001',
  },
  'Kelurahan Jatiuwung': {
    nama: 'JATIUWUNG',
    alamat: 'Jl. Jatiuwung Raya No. 99, Jatiuwung',
    kecamatan: 'Cibodas',
    kota: 'Kota Tangerang',
    kodePos: '15146',
    telepon: '(021) 5523461',
    lurah: 'Hj. Nurhayati, S.Sos, M.Si',
    nipLurah: '197106151995032001',
  },
};

// ============================================
// DEPRECATED: Mock Users & Documents
// ============================================
// Gunakan database untuk users dan documents
// Lihat: src/lib/models/user.ts

export const mockUsers: User[] = [];
export const mockDocuments: Document[] = [];

// ============================================
// Mock Authentication - TEMPORARY
// ============================================
// Temporary mock auth untuk development
// TODO: Implement proper authentication dengan database + bcrypt

export const mockAuth = {
  // Temporary login - hardcoded credentials
  // Password untuk semua: password123
  login: (email: string, password: string): User | null => {
    if (password !== 'password123') return null;

    // Hardcoded users untuk development
    const tempUsers: Record<string, User> = {
      'admin@cibodas.go.id': {
        id: '1',
        email: 'admin@cibodas.go.id',
        name: 'Admin Kecamatan',
        role: 'admin',
        created_at: new Date().toISOString(),
      },
      'staffkelcibodas@cibodas.go.id': {
        id: '2',
        email: 'staffkelcibodas@cibodas.go.id',
        name: 'Staff Kelurahan Cibodas',
        role: 'staff',
        kelurahan: 'Kelurahan Cibodas',
        created_at: new Date().toISOString(),
      },
      'staffkelcbb@cibodas.go.id': {
        id: '3',
        email: 'staffkelcbb@cibodas.go.id',
        name: 'Staff Kelurahan Cibodas Baru',
        role: 'staff',
        kelurahan: 'Kelurahan Cibodas Baru',
        created_at: new Date().toISOString(),
      },
      'staffpanbar@cibodas.go.id': {
        id: '4',
        email: 'staffpanbar@cibodas.go.id',
        name: 'Staff Kelurahan Panunggangan Barat',
        role: 'staff',
        kelurahan: 'Kelurahan Panunggangan Barat',
        created_at: new Date().toISOString(),
      },
      'staffcibodasari@cibodas.go.id': {
        id: '5',
        email: 'staffcibodasari@cibodas.go.id',
        name: 'Staff Kelurahan Cibodasari',
        role: 'staff',
        kelurahan: 'Kelurahan Cibodasari',
        created_at: new Date().toISOString(),
      },
      'staffuwungjaya@cibodas.go.id': {
        id: '6',
        email: 'staffuwungjaya@cibodas.go.id',
        name: 'Staff Kelurahan Uwung Jaya',
        role: 'staff',
        kelurahan: 'Kelurahan Uwung Jaya',
        created_at: new Date().toISOString(),
      },
      'staffjatiuwung@cibodas.go.id': {
        id: '7',
        email: 'staffjatiuwung@cibodas.go.id',
        name: 'Staff Kelurahan Jatiuwung',
        role: 'staff',
        kelurahan: 'Kelurahan Jatiuwung',
        created_at: new Date().toISOString(),
      },
    };

    return tempUsers[email] || null;
  },

  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('currentUser');
    const user = userStr ? JSON.parse(userStr) : null;

    // Jika admin, override kelurahan_id dengan pilihan dari localStorage
    if (user && user.role === 'admin') {
      const adminActingAs = localStorage.getItem('admin_acting_as_kelurahan');
      if (adminActingAs) {
        try {
          const kelurahanData = JSON.parse(adminActingAs);
          return {
            ...user,
            kelurahan_id: kelurahanData.kelurahan_id || kelurahanData.id
          };
        } catch (error) {
          // Silent fail
        }
      }
    }

    return user;
  },

  setCurrentUser: (user: User | null) => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  },

  register: (email: string, password: string, name: string): User => {
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      email,
      name,
      role: 'user',
      created_at: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    }
    return newUser;
  },

  logout: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('currentUser');
  },
};

// ============================================
// Helper Functions
// ============================================

// Get data kelurahan berdasarkan nama kelurahan
export const getKelurahanData = (namaKelurahan?: string): KelurahanData | null => {
  if (!namaKelurahan) return null;
  return dataKelurahan[namaKelurahan] || null;
};

// Get data kelurahan dari user yang sedang login
// Untuk admin, gunakan kelurahan yang dipilih dari localStorage
export const getKelurahanDataFromUser = (): KelurahanData | null => {
  const currentUser = mockAuth.getCurrentUser();

  // Jika admin, cek apakah ada kelurahan yang dipilih
  if (currentUser?.role === 'admin') {
    if (typeof window !== 'undefined') {
      const adminActingAs = localStorage.getItem('admin_acting_as_kelurahan');
      if (adminActingAs) {
        try {
          const kelurahanData = JSON.parse(adminActingAs);
          return {
            nama: kelurahanData.nama,
            kecamatan: kelurahanData.kecamatan,
            kota: kelurahanData.kota,
            alamat: kelurahanData.alamat || `Jl. Kelurahan ${kelurahanData.nama}`,
            kodePos: kelurahanData.kodePos || '15000',
            telepon: kelurahanData.telepon || '021-12345678',
            lurah: kelurahanData.lurah || 'Lurah',
            nipLurah: kelurahanData.nipLurah || '197001011990031001'
          };
        } catch (error) {
          // Silent fail, fallback to default
        }
      }
    }
    // Admin tanpa pilihan kelurahan, return null atau default
    return null;
  }

  // Untuk staff, gunakan kelurahan mereka
  if (!currentUser || !currentUser.kelurahan) return null;
  return getKelurahanData(currentUser.kelurahan);
};

// DEPRECATED: Gunakan database
export const getMockUsers = (): User[] => {
  return mockUsers;
};

// DEPRECATED: Gunakan database
export const getMockDocuments = (jenis?: 'masuk' | 'keluar'): Document[] => {
  if (jenis) {
    return mockDocuments.filter((doc) => doc.jenis_surat === jenis);
  }
  return mockDocuments;
};

// DEPRECATED: Gunakan database
export const getMockStats = () => {
  const suratMasuk = mockDocuments.filter((d) => d.jenis_surat === 'masuk');
  const suratKeluar = mockDocuments.filter((d) => d.jenis_surat === 'keluar');
  const pending = mockDocuments.filter((d) => d.status === 'pending');
  const selesai = mockDocuments.filter((d) => d.status === 'selesai');

  return {
    total_surat_masuk: suratMasuk.length,
    total_surat_keluar: suratKeluar.length,
    surat_pending: pending.length,
    surat_selesai: selesai.length,
  };
};
