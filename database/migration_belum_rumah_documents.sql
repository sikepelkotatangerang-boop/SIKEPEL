-- Migration: Tabel untuk Surat Keterangan Belum Memiliki Rumah
-- Created: 2025-01-15

-- Drop table if exists
DROP TABLE IF EXISTS belum_rumah_documents CASCADE;

-- Create table for Surat Keterangan Belum Memiliki Rumah
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

-- Indexes untuk performa
CREATE INDEX idx_belum_rumah_nomor_surat ON belum_rumah_documents(nomor_surat);
CREATE INDEX idx_belum_rumah_nik ON belum_rumah_documents(nik_pemohon);
CREATE INDEX idx_belum_rumah_nama ON belum_rumah_documents(nama_pemohon);
CREATE INDEX idx_belum_rumah_kelurahan ON belum_rumah_documents(kelurahan_id);
CREATE INDEX idx_belum_rumah_tanggal ON belum_rumah_documents(tanggal_surat);
CREATE INDEX idx_belum_rumah_status ON belum_rumah_documents(status);
CREATE INDEX idx_belum_rumah_created_by ON belum_rumah_documents(created_by);

-- Trigger untuk auto-update updated_at
CREATE TRIGGER update_belum_rumah_documents_updated_at 
  BEFORE UPDATE ON belum_rumah_documents
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE belum_rumah_documents IS 'Tabel untuk menyimpan data Surat Keterangan Belum Memiliki Rumah';
COMMENT ON COLUMN belum_rumah_documents.peruntukan IS 'Keperluan/tujuan pembuatan surat';
COMMENT ON COLUMN belum_rumah_documents.pengantar_rt IS 'Nomor surat pengantar dari RT';
COMMENT ON COLUMN belum_rumah_documents.google_drive_id IS 'ID file di Google Drive';
COMMENT ON COLUMN belum_rumah_documents.google_drive_url IS 'URL untuk akses file di Google Drive';
