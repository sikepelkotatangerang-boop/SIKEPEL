-- Database Schema untuk Sistem Pelayanan Kelurahan Cibodas

-- Drop tables if exists (untuk development)
DROP TABLE IF EXISTS pejabat CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS notification_recipients CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
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

-- Table: documents
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  nomor_surat VARCHAR(50) NOT NULL UNIQUE,
  jenis_surat VARCHAR(20) NOT NULL CHECK (jenis_surat IN ('masuk', 'keluar')),
  perihal TEXT NOT NULL,
  pengirim VARCHAR(150),
  penerima VARCHAR(150),
  tanggal_surat DATE NOT NULL,
  tanggal_diterima DATE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'diproses', 'selesai', 'ditolak')),
  file_path TEXT,
  keterangan TEXT,
  created_by INTEGER REFERENCES users(id),
  kelurahan_id INTEGER REFERENCES kelurahan(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes untuk performa
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_kelurahan ON users(kelurahan_id);
CREATE INDEX idx_documents_nomor ON documents(nomor_surat);
CREATE INDEX idx_documents_jenis ON documents(jenis_surat);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_kelurahan ON documents(kelurahan_id);

-- Function untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers untuk auto-update updated_at
CREATE TRIGGER update_kelurahan_updated_at BEFORE UPDATE ON kelurahan
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
-- Untuk tracking siapa saja yang sudah membaca notifikasi
CREATE TABLE notification_recipients (
  id SERIAL PRIMARY KEY,
  notification_id INTEGER REFERENCES notifications(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(notification_id, user_id)
);

-- Indexes untuk performa notifications
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_by ON notifications(created_by);
CREATE INDEX idx_notification_recipients_user ON notification_recipients(user_id);
CREATE INDEX idx_notification_recipients_read ON notification_recipients(is_read);

-- Trigger untuk auto-update updated_at notifications
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: pejabat
-- Untuk menyimpan data pejabat di setiap kelurahan
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

-- Indexes untuk performa pejabat
CREATE INDEX idx_pejabat_kelurahan ON pejabat(kelurahan_id);
CREATE INDEX idx_pejabat_active ON pejabat(is_active);

-- Trigger untuk auto-update updated_at pejabat
CREATE TRIGGER update_pejabat_updated_at BEFORE UPDATE ON pejabat
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE kelurahan IS 'Data kelurahan di Kecamatan Cibodas';
COMMENT ON TABLE users IS 'Data pengguna sistem (admin, staff, user)';
COMMENT ON TABLE documents IS 'Data surat masuk dan keluar';
COMMENT ON TABLE notifications IS 'Notifikasi sistem untuk pengguna';
COMMENT ON TABLE notification_recipients IS 'Tracking notifikasi per user (read status)';
COMMENT ON TABLE pejabat IS 'Data pejabat di setiap kelurahan';
