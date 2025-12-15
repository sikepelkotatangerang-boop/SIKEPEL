-- Tabel untuk menyimpan data surat keluar
CREATE TABLE IF NOT EXISTS documents (
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
  
  -- Pejabat penandatangan
  nama_pejabat VARCHAR(255),
  nip_pejabat VARCHAR(50),
  jabatan VARCHAR(100),
  
  -- Storage & File Info
  storage_bucket_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size BIGINT,
  mime_type VARCHAR(100),
  
  -- Metadata
  kelurahan_id INTEGER,
  created_by INTEGER,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  CONSTRAINT fk_kelurahan FOREIGN KEY (kelurahan_id) REFERENCES kelurahan(id) ON DELETE SET NULL,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_documents_jenis ON documents(jenis_dokumen);
CREATE INDEX IF NOT EXISTS idx_documents_nomor ON documents(nomor_surat);
CREATE INDEX IF NOT EXISTS idx_documents_tanggal ON documents(tanggal_surat);
CREATE INDEX IF NOT EXISTS idx_documents_kelurahan ON documents(kelurahan_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Trigger untuk update updated_at
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_updated_at();
