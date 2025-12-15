import db from '../db';

export interface Kelurahan {
  id: number;
  nama: string;
  nama_lengkap: string;
  alamat: string;
  kecamatan: string;
  kota: string;
  kode_pos: string;
  telepon: string;
  email: string;
  nama_lurah: string;
  nip_lurah: string;
  created_at: Date;
  updated_at: Date;
}

export class KelurahanModel {
  // Get all kelurahan
  static async getAll(): Promise<Kelurahan[]> {
    const result = await db.query<Kelurahan>(
      'SELECT * FROM kelurahan ORDER BY nama ASC'
    );
    return result.rows;
  }

  // Get kelurahan by ID
  static async getById(id: number): Promise<Kelurahan | null> {
    return await db.queryOne<Kelurahan>(
      'SELECT * FROM kelurahan WHERE id = $1',
      [id]
    );
  }

  // Get kelurahan by nama
  static async getByNama(nama: string): Promise<Kelurahan | null> {
    return await db.queryOne<Kelurahan>(
      'SELECT * FROM kelurahan WHERE UPPER(nama) = UPPER($1)',
      [nama]
    );
  }

  // Create new kelurahan
  static async create(data: Omit<Kelurahan, 'id' | 'created_at' | 'updated_at'>): Promise<Kelurahan> {
    const result = await db.query<Kelurahan>(
      `INSERT INTO kelurahan 
       (nama, nama_lengkap, alamat, kecamatan, kota, kode_pos, telepon, email, nama_lurah, nip_lurah)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.nama,
        data.nama_lengkap,
        data.alamat,
        data.kecamatan,
        data.kota,
        data.kode_pos,
        data.telepon,
        data.email,
        data.nama_lurah,
        data.nip_lurah,
      ]
    );
    return result.rows[0];
  }

  // Update kelurahan
  static async update(id: number, data: Partial<Kelurahan>): Promise<Kelurahan | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' && value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const result = await db.query<Kelurahan>(
      `UPDATE kelurahan SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  // Delete kelurahan
  static async delete(id: number): Promise<boolean> {
    const result = await db.query(
      'DELETE FROM kelurahan WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }
}

export default KelurahanModel;
