-- Migration: Tabel universal untuk semua jenis dokumen surat
-- Tanggal: 2025-10-10

-- Table: document_archives
-- Menyimpan semua jenis dokumen surat yang telah dibuat
CREATE TABLE IF NOT EXISTS document_archives (
  id SERIAL PRIMARY KEY,
  
  -- Informasi Dasar Surat
  nomor_surat VARCHAR(100) NOT NULL,
  jenis_dokumen VARCHAR(50) NOT NULL, -- 'SKTM', 'Domisili', 'Usaha', dll
  tanggal_surat DATE NOT NULL,
  perihal TEXT,
  
  -- Data Pemohon/Subjek
  nik_subjek VARCHAR(16),
  nama_subjek VARCHAR(150) NOT NULL,
  alamat_subjek TEXT,
  
  -- Data Tambahan (JSON untuk fleksibilitas)
  data_detail JSONB, -- Menyimpan semua field spesifik per jenis dokumen
  
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

-- Indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_doc_archives_nomor ON document_archives(nomor_surat);
CREATE INDEX IF NOT EXISTS idx_doc_archives_jenis ON document_archives(jenis_dokumen);
CREATE INDEX IF NOT EXISTS idx_doc_archives_nik ON document_archives(nik_subjek);
CREATE INDEX IF NOT EXISTS idx_doc_archives_nama ON document_archives(nama_subjek);
CREATE INDEX IF NOT EXISTS idx_doc_archives_kelurahan ON document_archives(kelurahan_id);
CREATE INDEX IF NOT EXISTS idx_doc_archives_created_by ON document_archives(created_by);
CREATE INDEX IF NOT EXISTS idx_doc_archives_status ON document_archives(status);
CREATE INDEX IF NOT EXISTS idx_doc_archives_tanggal ON document_archives(tanggal_surat);
CREATE INDEX IF NOT EXISTS idx_doc_archives_search ON document_archives USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_doc_archives_data_detail ON document_archives USING GIN(data_detail);

-- Trigger untuk auto-update updated_at
CREATE TRIGGER update_doc_archives_updated_at 
  BEFORE UPDATE ON document_archives
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk update search vector
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

-- Migrasi data dari sktm_documents ke document_archives
INSERT INTO document_archives (
  nomor_surat, jenis_dokumen, tanggal_surat, perihal,
  nik_subjek, nama_subjek, alamat_subjek,
  data_detail,
  pejabat_id, nama_pejabat, nip_pejabat, jabatan_pejabat,
  google_drive_id, google_drive_url, file_name, file_size, mime_type,
  kelurahan_id, created_by, status, created_at, updated_at
)
SELECT 
  nomor_surat, 
  'SKTM' as jenis_dokumen, 
  tanggal_surat, 
  'Surat Keterangan Tidak Mampu untuk ' || peruntukan as perihal,
  nik_pemohon, 
  nama_pemohon, 
  alamat || ', RT ' || rt || '/RW ' || rw || ', ' || kelurahan || ', ' || kecamatan || ', ' || kota_kabupaten as alamat_subjek,
  jsonb_build_object(
    'tempat_lahir', tempat_lahir,
    'tanggal_lahir', tanggal_lahir,
    'kelamin_pemohon', kelamin_pemohon,
    'agama', agama,
    'pekerjaan', pekerjaan,
    'perkawinan', perkawinan,
    'negara', negara,
    'rt', rt,
    'rw', rw,
    'kelurahan', kelurahan,
    'kecamatan', kecamatan,
    'kota_kabupaten', kota_kabupaten,
    'desil', desil,
    'peruntukan', peruntukan,
    'pengantar_rt', pengantar_rt
  ) as data_detail,
  pejabat_id, 
  nama_pejabat, 
  nip_pejabat, 
  jabatan as jabatan_pejabat,
  google_drive_id, 
  google_drive_url, 
  file_name, 
  file_size, 
  mime_type,
  kelurahan_id, 
  created_by, 
  status, 
  created_at, 
  updated_at
FROM sktm_documents
WHERE NOT EXISTS (
  SELECT 1 FROM document_archives da 
  WHERE da.nomor_surat = sktm_documents.nomor_surat
);

-- Comments
COMMENT ON TABLE document_archives IS 'Tabel universal untuk menyimpan semua jenis dokumen surat yang telah dibuat';
COMMENT ON COLUMN document_archives.jenis_dokumen IS 'Jenis dokumen: SKTM, Domisili, Usaha, Kelahiran, dll';
COMMENT ON COLUMN document_archives.data_detail IS 'Data detail spesifik per jenis dokumen dalam format JSONB';
COMMENT ON COLUMN document_archives.search_vector IS 'Full-text search vector untuk pencarian cepat';
