import db from '../db';

export interface Document {
  id: number;
  nomor_surat: string;
  jenis_surat: 'masuk' | 'keluar';
  perihal: string;
  pengirim?: string;
  penerima?: string;
  tanggal_surat: Date;
  tanggal_diterima?: Date;
  status: 'pending' | 'diproses' | 'selesai' | 'ditolak';
  file_path?: string;
  keterangan?: string;
  created_by: number;
  kelurahan_id?: number;
  created_at: Date;
  updated_at: Date;
}

export class DocumentModel {
  // Get all documents
  static async getAll(filters?: {
    jenis_surat?: 'masuk' | 'keluar';
    status?: string;
    kelurahan_id?: number;
    limit?: number;
  }): Promise<Document[]> {
    let query = 'SELECT * FROM documents WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.jenis_surat) {
      query += ` AND jenis_surat = $${paramCount}`;
      params.push(filters.jenis_surat);
      paramCount++;
    }

    if (filters?.status) {
      query += ` AND status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters?.kelurahan_id) {
      query += ` AND kelurahan_id = $${paramCount}`;
      params.push(filters.kelurahan_id);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    if (filters?.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
    }

    const result = await db.query<Document>(query, params);
    return result.rows;
  }

  // Get document by ID
  static async getById(id: number): Promise<Document | null> {
    return await db.queryOne<Document>(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );
  }

  // Get stats
  static async getStats(kelurahan_id?: number): Promise<{
    total_surat_masuk: number;
    total_surat_keluar: number;
    surat_pending: number;
    surat_selesai: number;
  }> {
    const whereClause = kelurahan_id ? `WHERE kelurahan_id = $1` : '';
    const params = kelurahan_id ? [kelurahan_id] : [];

    const result = await db.queryOne<any>(
      `SELECT 
        COUNT(*) FILTER (WHERE jenis_surat = 'masuk') as total_surat_masuk,
        COUNT(*) FILTER (WHERE jenis_surat = 'keluar') as total_surat_keluar,
        COUNT(*) FILTER (WHERE status = 'pending') as surat_pending,
        COUNT(*) FILTER (WHERE status = 'selesai') as surat_selesai
       FROM documents ${whereClause}`,
      params
    );

    return {
      total_surat_masuk: parseInt(result?.total_surat_masuk || '0'),
      total_surat_keluar: parseInt(result?.total_surat_keluar || '0'),
      surat_pending: parseInt(result?.surat_pending || '0'),
      surat_selesai: parseInt(result?.surat_selesai || '0'),
    };
  }

  // Get recent documents
  static async getRecent(limit: number = 10, kelurahan_id?: number): Promise<Document[]> {
    const whereClause = kelurahan_id ? 'WHERE kelurahan_id = $1' : '';
    const params = kelurahan_id ? [kelurahan_id] : [];
    const limitParam = kelurahan_id ? '$2' : '$1';
    
    if (kelurahan_id) {
      params.push(limit);
    } else {
      params.push(limit);
    }

    const result = await db.query<Document>(
      `SELECT * FROM documents ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ${limitParam}`,
      params
    );
    return result.rows;
  }

  // Create document
  static async create(data: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<Document> {
    const result = await db.query<Document>(
      `INSERT INTO documents 
       (nomor_surat, jenis_surat, perihal, pengirim, penerima, tanggal_surat, 
        tanggal_diterima, status, file_path, keterangan, created_by, kelurahan_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        data.nomor_surat,
        data.jenis_surat,
        data.perihal,
        data.pengirim || null,
        data.penerima || null,
        data.tanggal_surat,
        data.tanggal_diterima || null,
        data.status,
        data.file_path || null,
        data.keterangan || null,
        data.created_by,
        data.kelurahan_id || null,
      ]
    );
    return result.rows[0];
  }

  // Update document
  static async update(id: number, data: Partial<Document>): Promise<Document | null> {
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
    const result = await db.query<Document>(
      `UPDATE documents SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  // Delete document
  static async delete(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM documents WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  }
}

export default DocumentModel;
