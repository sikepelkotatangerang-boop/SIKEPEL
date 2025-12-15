-- ============================================
-- MIGRATION SCRIPT: Supabase to Neon
-- Database: Sistem Pelayanan Kelurahan Cibodas
-- Updated: 2025-12-15
-- ============================================

-- 1. MAIN SCHEMA
-- Drop tables if exists (Cascade to remove dependents)
DROP TABLE IF EXISTS app_settings CASCADE;
DROP TABLE IF EXISTS document_archives CASCADE;
DROP TABLE IF EXISTS belum_rumah_documents CASCADE;
DROP TABLE IF EXISTS sktm_documents CASCADE;
DROP TABLE IF EXISTS notification_recipients CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS surat_masuk CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS pejabat CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS kelurahan CASCADE;

-- Table: kelurahan
CREATE TABLE kelurahan (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL UNIQUE,
  nama_lengkap VARCHAR(150) NOT NULL,
  alamat TEXT NOT NULL,
  kecamatan VARCHAR(100) NOT NULL,
  kota VARCHAR(100) NOT NULL,
  kode_pos VARCHAR(10),
  telepon VARCHAR(20),
  email VARCHAR(100),
  nama_lurah VARCHAR(150) NOT NULL,
  nip_lurah VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff', 'user')),
  kelurahan_id INTEGER REFERENCES kelurahan(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: pejabat
CREATE TABLE pejabat (
  id SERIAL PRIMARY KEY,
  kelurahan_id INTEGER REFERENCES kelurahan(id) ON DELETE CASCADE,
  nama VARCHAR(150) NOT NULL,
  nip VARCHAR(30),
  jabatan VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: documents (Surat Keluar)
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  nomor_surat VARCHAR(100) NOT NULL,
  jenis_dokumen VARCHAR(100) NOT NULL,
  tanggal_surat DATE NOT NULL,
  perihal TEXT NOT NULL,
  
  -- Data detail surat
  sifat VARCHAR(50),
  jumlah_lampiran INTEGER DEFAULT 0,
  tujuan TEXT,
  isi_surat TEXT,
  akhiran TEXT,
  
  -- Data acara (optional)
  hari_acara VARCHAR(50),
  tanggal_acara VARCHAR(100),
  waktu_acara VARCHAR(100),
  tempat_acara TEXT,
  data_acara TEXT,
  
  -- Pejabat penandatangan (Snapshot)
  nama_pejabat VARCHAR(255),
  nip_pejabat VARCHAR(50),
  jabatan VARCHAR(100),
  
  -- Storage & File Info
  storage_bucket_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size BIGINT,
  mime_type VARCHAR(100),
  
  -- Metadata
  kelurahan_id INTEGER REFERENCES kelurahan(id) ON DELETE SET NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: surat_masuk
CREATE TABLE surat_masuk (
  id SERIAL PRIMARY KEY,
  
  -- Data Surat
  nomor_surat VARCHAR(100) NOT NULL,
  tanggal_masuk DATE NOT NULL,
  tanggal_surat DATE NOT NULL,
  asal_surat VARCHAR(255) NOT NULL,
  perihal TEXT NOT NULL,
  disposisi TEXT,
  
  -- File Info
  file_url TEXT,
  file_name VARCHAR(255),
  file_size BIGINT,
  
  -- Metadata
  kelurahan_id INTEGER REFERENCES kelurahan(id) ON DELETE SET NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: notifications
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  recipients VARCHAR(20) NOT NULL CHECK (recipients IN ('all', 'staff', 'specific')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: notification_recipients
CREATE TABLE notification_recipients (
  id SERIAL PRIMARY KEY,
  notification_id INTEGER REFERENCES notifications(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(notification_id, user_id)
);

-- Table: sktm_documents
CREATE TABLE sktm_documents (
  id SERIAL PRIMARY KEY,
  
  -- Informasi Surat
  nomor_surat VARCHAR(100) NOT NULL UNIQUE,
  tanggal_surat DATE NOT NULL,
  
  -- Data Pemohon
  nik_pemohon VARCHAR(16) NOT NULL,
  nama_pemohon VARCHAR(150) NOT NULL,
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  kelamin_pemohon VARCHAR(20),
  agama VARCHAR(50),
  pekerjaan VARCHAR(100),
  perkawinan VARCHAR(50),
  negara VARCHAR(50) DEFAULT 'Indonesia',
  
  -- Alamat
  alamat TEXT,
  rt VARCHAR(5),
  rw VARCHAR(5),
  kelurahan VARCHAR(100),
  kecamatan VARCHAR(100),
  kota_kabupaten VARCHAR(100),
  
  -- Data Ekonomi
  desil VARCHAR(100),
  
  -- Keperluan
  peruntukan TEXT,
  pengantar_rt VARCHAR(100),
  
  -- Data Pejabat Penandatangan
  pejabat_id INTEGER REFERENCES pejabat(id),
  nama_pejabat VARCHAR(150),
  nip_pejabat VARCHAR(30),
  jabatan VARCHAR(100),
  
  -- File Information
  google_drive_id VARCHAR(255),
  google_drive_url TEXT,
  file_name VARCHAR(255),
  file_size BIGINT,
  mime_type VARCHAR(100) DEFAULT 'application/pdf',
  
  -- Metadata
  kelurahan_id INTEGER REFERENCES kelurahan(id),
  created_by INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Full-text search
  search_vector tsvector
);

-- Table: belum_rumah_documents
CREATE TABLE belum_rumah_documents (
  id SERIAL PRIMARY KEY,
  
  -- Nomor Surat
  nomor_surat VARCHAR(100) NOT NULL UNIQUE,
  tanggal_surat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Data Pemohon
  nik_pemohon VARCHAR(16) NOT NULL,
  nama_pemohon VARCHAR(150) NOT NULL,
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  kelamin_pemohon VARCHAR(20) CHECK (kelamin_pemohon IN ('Laki-laki', 'Perempuan')),
  agama VARCHAR(50),
  pekerjaan VARCHAR(100),
  perkawinan VARCHAR(50),
  negara VARCHAR(100) DEFAULT 'Indonesia',
  
  -- Alamat
  alamat TEXT NOT NULL,
  rt VARCHAR(10),
  rw VARCHAR(10),
  kelurahan VARCHAR(100),
  kecamatan VARCHAR(100),
  kota_kabupaten VARCHAR(100),
  
  -- Keperluan
  peruntukan TEXT NOT NULL,
  pengantar_rt VARCHAR(100),
  
  -- Data Pejabat Penandatangan
  pejabat_id INTEGER REFERENCES pejabat(id),
  nama_pejabat VARCHAR(150) NOT NULL,
  nip_pejabat VARCHAR(20),
  jabatan VARCHAR(100) NOT NULL,
  
  -- File Storage
  google_drive_id VARCHAR(255),
  google_drive_url TEXT,
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  
  -- Metadata
  kelurahan_id INTEGER REFERENCES kelurahan(id),
  created_by INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: document_archives
CREATE TABLE document_archives (
  id SERIAL PRIMARY KEY,
  
  -- Informasi Dasar Surat
  nomor_surat VARCHAR(100) NOT NULL,
  jenis_dokumen VARCHAR(50) NOT NULL,
  tanggal_surat DATE NOT NULL,
  perihal TEXT,
  
  -- Data Pemohon/Subjek
  nik_subjek VARCHAR(16),
  nama_subjek VARCHAR(150) NOT NULL,
  alamat_subjek TEXT,
  
  -- Data Tambahan (JSON untuk fleksibilitas)
  data_detail JSONB,
  
  -- Data Pejabat Penandatangan
  pejabat_id INTEGER REFERENCES pejabat(id),
  nama_pejabat VARCHAR(150),
  nip_pejabat VARCHAR(30),
  jabatan_pejabat VARCHAR(100),
  
  -- File Information
  google_drive_id VARCHAR(255),
  google_drive_url TEXT,
  file_name VARCHAR(255),
  file_size BIGINT,
  mime_type VARCHAR(100) DEFAULT 'application/pdf',
  
  -- Metadata
  kelurahan_id INTEGER REFERENCES kelurahan(id),
  created_by INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Full-text search
  search_vector tsvector
);

-- ============================================
-- 2. INDEXES
-- ============================================

-- Indexes untuk users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_kelurahan ON users(kelurahan_id);

-- Indexes untuk pejabat
CREATE INDEX idx_pejabat_kelurahan ON pejabat(kelurahan_id);
CREATE INDEX idx_pejabat_active ON pejabat(is_active);

-- Indexes untuk documents
CREATE INDEX idx_documents_jenis ON documents(jenis_dokumen);
CREATE INDEX idx_documents_nomor ON documents(nomor_surat);
CREATE INDEX idx_documents_tanggal ON documents(tanggal_surat);
CREATE INDEX idx_documents_kelurahan ON documents(kelurahan_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- Indexes untuk surat_masuk
CREATE INDEX idx_surat_masuk_nomor ON surat_masuk(nomor_surat);
CREATE INDEX idx_surat_masuk_tanggal_masuk ON surat_masuk(tanggal_masuk DESC);
CREATE INDEX idx_surat_masuk_tanggal_surat ON surat_masuk(tanggal_surat DESC);
CREATE INDEX idx_surat_masuk_kelurahan ON surat_masuk(kelurahan_id);
CREATE INDEX idx_surat_masuk_status ON surat_masuk(status);
CREATE INDEX idx_surat_masuk_created_at ON surat_masuk(created_at DESC);

-- Indexes untuk notifications
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_by ON notifications(created_by);
CREATE INDEX idx_notification_recipients_user ON notification_recipients(user_id);
CREATE INDEX idx_notification_recipients_read ON notification_recipients(is_read);

-- Indexes untuk sktm_documents
CREATE INDEX idx_sktm_documents_nomor ON sktm_documents(nomor_surat);
CREATE INDEX idx_sktm_documents_nik ON sktm_documents(nik_pemohon);
CREATE INDEX idx_sktm_documents_nama ON sktm_documents(nama_pemohon);
CREATE INDEX idx_sktm_documents_kelurahan ON sktm_documents(kelurahan_id);
CREATE INDEX idx_sktm_documents_created_by ON sktm_documents(created_by);
CREATE INDEX idx_sktm_documents_status ON sktm_documents(status);
CREATE INDEX idx_sktm_documents_tanggal ON sktm_documents(tanggal_surat);
CREATE INDEX idx_sktm_documents_search ON sktm_documents USING GIN(search_vector);

-- Indexes untuk belum_rumah_documents
CREATE INDEX idx_belum_rumah_nomor_surat ON belum_rumah_documents(nomor_surat);
CREATE INDEX idx_belum_rumah_nik ON belum_rumah_documents(nik_pemohon);
CREATE INDEX idx_belum_rumah_nama ON belum_rumah_documents(nama_pemohon);
CREATE INDEX idx_belum_rumah_kelurahan ON belum_rumah_documents(kelurahan_id);
CREATE INDEX idx_belum_rumah_tanggal ON belum_rumah_documents(tanggal_surat);
CREATE INDEX idx_belum_rumah_status ON belum_rumah_documents(status);
CREATE INDEX idx_belum_rumah_created_by ON belum_rumah_documents(created_by);

-- Indexes untuk document_archives
CREATE INDEX idx_doc_archives_nomor ON document_archives(nomor_surat);
CREATE INDEX idx_doc_archives_jenis ON document_archives(jenis_dokumen);
CREATE INDEX idx_doc_archives_nik ON document_archives(nik_subjek);
CREATE INDEX idx_doc_archives_nama ON document_archives(nama_subjek);
CREATE INDEX idx_doc_archives_kelurahan ON document_archives(kelurahan_id);
CREATE INDEX idx_doc_archives_created_by ON document_archives(created_by);
CREATE INDEX idx_doc_archives_status ON document_archives(status);
CREATE INDEX idx_doc_archives_tanggal ON document_archives(tanggal_surat);
CREATE INDEX idx_doc_archives_search ON document_archives USING GIN(search_vector);
CREATE INDEX idx_doc_archives_data_detail ON document_archives USING GIN(data_detail);

-- ============================================
-- 3. FUNCTIONS & TRIGGERS
-- ============================================

-- Function untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers untuk auto-update updated_at (All tables)
CREATE TRIGGER update_kelurahan_updated_at BEFORE UPDATE ON kelurahan
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pejabat_updated_at BEFORE UPDATE ON pejabat
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surat_masuk_updated_at BEFORE UPDATE ON surat_masuk
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sktm_documents_updated_at BEFORE UPDATE ON sktm_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_belum_rumah_documents_updated_at BEFORE UPDATE ON belum_rumah_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doc_archives_updated_at BEFORE UPDATE ON document_archives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function untuk search vector sktm_documents
CREATE OR REPLACE FUNCTION sktm_documents_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('indonesian', COALESCE(NEW.nomor_surat, '')), 'A') ||
    setweight(to_tsvector('indonesian', COALESCE(NEW.nama_pemohon, '')), 'A') ||
    setweight(to_tsvector('indonesian', COALESCE(NEW.nik_pemohon, '')), 'B') ||
    setweight(to_tsvector('indonesian', COALESCE(NEW.peruntukan, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sktm_documents_search_update 
  BEFORE INSERT OR UPDATE ON sktm_documents
  FOR EACH ROW 
  EXECUTE FUNCTION sktm_documents_search_trigger();

-- Function untuk search vector document_archives
CREATE OR REPLACE FUNCTION doc_archives_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('indonesian', COALESCE(NEW.nomor_surat, '')), 'A') ||
    setweight(to_tsvector('indonesian', COALESCE(NEW.nama_subjek, '')), 'A') ||
    setweight(to_tsvector('indonesian', COALESCE(NEW.nik_subjek, '')), 'B') ||
    setweight(to_tsvector('indonesian', COALESCE(NEW.jenis_dokumen, '')), 'B') ||
    setweight(to_tsvector('indonesian', COALESCE(NEW.perihal, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER doc_archives_search_update 
  BEFORE INSERT OR UPDATE ON document_archives
  FOR EACH ROW 
  EXECUTE FUNCTION doc_archives_search_trigger();

-- ============================================
-- 4. COMMENTS
-- ============================================

COMMENT ON TABLE kelurahan IS 'Data kelurahan di Kecamatan Cibodas';
COMMENT ON TABLE users IS 'Data pengguna sistem (admin, staff, user)';
COMMENT ON TABLE pejabat IS 'Data pejabat di setiap kelurahan';
COMMENT ON TABLE documents IS 'Tabel untuk menyimpan data surat keluar';
COMMENT ON TABLE surat_masuk IS 'Tabel untuk menyimpan data surat masuk';
COMMENT ON TABLE notifications IS 'Notifikasi sistem untuk pengguna';
COMMENT ON TABLE notification_recipients IS 'Tracking notifikasi per user (read status)';
COMMENT ON TABLE sktm_documents IS 'Menyimpan data dokumen SKTM yang sudah dibuat';
COMMENT ON TABLE belum_rumah_documents IS 'Tabel untuk menyimpan data Surat Keterangan Belum Memiliki Rumah';
COMMENT ON TABLE document_archives IS 'Tabel universal untuk menyimpan arsip dokumen surat';
