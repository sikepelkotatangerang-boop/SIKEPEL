-- Migration: Tabel untuk menyimpan dokumen SKTM yang sudah diproses
-- Tanggal: 2025-10-10

-- Table: sktm_documents
-- Menyimpan data dokumen SKTM yang sudah dibuat beserta link Google Drive
CREATE TABLE IF NOT EXISTS sktm_documents (
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

-- Indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_sktm_documents_nomor ON sktm_documents(nomor_surat);
CREATE INDEX IF NOT EXISTS idx_sktm_documents_nik ON sktm_documents(nik_pemohon);
CREATE INDEX IF NOT EXISTS idx_sktm_documents_nama ON sktm_documents(nama_pemohon);
CREATE INDEX IF NOT EXISTS idx_sktm_documents_kelurahan ON sktm_documents(kelurahan_id);
CREATE INDEX IF NOT EXISTS idx_sktm_documents_created_by ON sktm_documents(created_by);
CREATE INDEX IF NOT EXISTS idx_sktm_documents_status ON sktm_documents(status);
CREATE INDEX IF NOT EXISTS idx_sktm_documents_tanggal ON sktm_documents(tanggal_surat);
CREATE INDEX IF NOT EXISTS idx_sktm_documents_search ON sktm_documents USING GIN(search_vector);

-- Trigger untuk auto-update updated_at
CREATE TRIGGER update_sktm_documents_updated_at 
  BEFORE UPDATE ON sktm_documents
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk update search vector
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

-- Comments
COMMENT ON TABLE sktm_documents IS 'Menyimpan data dokumen SKTM yang sudah dibuat dan link Google Drive untuk cetak ulang';
COMMENT ON COLUMN sktm_documents.google_drive_id IS 'ID file di Google Drive';
COMMENT ON COLUMN sktm_documents.google_drive_url IS 'URL untuk download/view file dari Google Drive';
COMMENT ON COLUMN sktm_documents.search_vector IS 'Full-text search vector untuk pencarian cepat';
