export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'user';
  kelurahan?: string; // Nama kelurahan untuk staff
  kelurahan_id?: number; // ID kelurahan untuk staff
  created_at: string;
}

export interface Document {
  id: string;
  nomor_surat: string;
  jenis_surat: 'masuk' | 'keluar';
  perihal: string;
  pengirim?: string;
  penerima?: string;
  tanggal_surat: string;
  tanggal_diterima?: string;
  status: 'pending' | 'diproses' | 'selesai';
  file_url?: string;
  keterangan?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_surat_masuk: number;
  total_surat_keluar: number;
  surat_pending: number;
  surat_selesai: number;
}
