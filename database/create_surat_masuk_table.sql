-- Tabel untuk menyimpan data surat masuk
CREATE TABLE IF NOT EXISTS surat_masuk (
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
  kelurahan_id INTEGER,
  created_by INTEGER,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  CONSTRAINT fk_kelurahan FOREIGN KEY (kelurahan_id) REFERENCES kelurahan(id) ON DELETE SET NULL,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_surat_masuk_nomor ON surat_masuk(nomor_surat);
CREATE INDEX IF NOT EXISTS idx_surat_masuk_tanggal_masuk ON surat_masuk(tanggal_masuk DESC);
CREATE INDEX IF NOT EXISTS idx_surat_masuk_tanggal_surat ON surat_masuk(tanggal_surat DESC);
CREATE INDEX IF NOT EXISTS idx_surat_masuk_kelurahan ON surat_masuk(kelurahan_id);
CREATE INDEX IF NOT EXISTS idx_surat_masuk_status ON surat_masuk(status);
CREATE INDEX IF NOT EXISTS idx_surat_masuk_created_at ON surat_masuk(created_at DESC);

-- Trigger untuk update updated_at
CREATE OR REPLACE FUNCTION update_surat_masuk_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_surat_masuk_updated_at
  BEFORE UPDATE ON surat_masuk
  FOR EACH ROW
  EXECUTE FUNCTION update_surat_masuk_updated_at();
