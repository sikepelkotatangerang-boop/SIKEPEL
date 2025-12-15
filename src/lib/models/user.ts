import db from '../db';
import { Kelurahan } from './kelurahan';

export interface User {
  id: number;
  email: string;
  password_hash?: string; // Optional karena tidak selalu di-return
  name: string;
  role: 'admin' | 'staff' | 'user';
  kelurahan_id: number | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithKelurahan extends User {
  kelurahan?: Kelurahan;
}

export class UserModel {
  // Get all users
  static async getAll(): Promise<User[]> {
    const result = await db.query<User>(
      `SELECT id, email, name, role, kelurahan_id, is_active, created_at, updated_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    return result.rows;
  }

  // Get user by ID
  static async getById(id: number): Promise<User | null> {
    return await db.queryOne<User>(
      `SELECT id, email, name, role, kelurahan_id, is_active, created_at, updated_at 
       FROM users 
       WHERE id = $1`,
      [id]
    );
  }

  // Get user by email
  static async getByEmail(email: string): Promise<User | null> {
    return await db.queryOne<User>(
      `SELECT id, email, name, role, kelurahan_id, is_active, created_at, updated_at 
       FROM users 
       WHERE email = $1`,
      [email]
    );
  }

  // Get user with password hash (untuk authentication)
  static async getByEmailWithPassword(email: string): Promise<User | null> {
    return await db.queryOne<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
  }

  // Get user with kelurahan data
  static async getByIdWithKelurahan(id: number): Promise<UserWithKelurahan | null> {
    return await db.queryOne<UserWithKelurahan>(
      `SELECT 
        u.id, u.email, u.name, u.role, u.kelurahan_id, u.is_active, u.created_at, u.updated_at,
        json_build_object(
          'id', k.id,
          'nama', k.nama,
          'nama_lengkap', k.nama_lengkap,
          'alamat', k.alamat,
          'kecamatan', k.kecamatan,
          'kota', k.kota,
          'kode_pos', k.kode_pos,
          'telepon', k.telepon,
          'email', k.email,
          'nama_lurah', k.nama_lurah,
          'nip_lurah', k.nip_lurah
        ) as kelurahan
       FROM users u
       LEFT JOIN kelurahan k ON u.kelurahan_id = k.id
       WHERE u.id = $1`,
      [id]
    );
  }

  // Get users by kelurahan
  static async getByKelurahan(kelurahanId: number): Promise<User[]> {
    const result = await db.query<User>(
      `SELECT id, email, name, role, kelurahan_id, is_active, created_at, updated_at 
       FROM users 
       WHERE kelurahan_id = $1 
       ORDER BY name ASC`,
      [kelurahanId]
    );
    return result.rows;
  }

  // Create new user
  static async create(data: {
    email: string;
    password_hash: string;
    name: string;
    role: 'admin' | 'staff' | 'user';
    kelurahan_id?: number | null;
  }): Promise<User> {
    const result = await db.query<User>(
      `INSERT INTO users (email, password_hash, name, role, kelurahan_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, kelurahan_id, is_active, created_at, updated_at`,
      [data.email, data.password_hash, data.name, data.role, data.kelurahan_id || null]
    );
    return result.rows[0];
  }

  // Update user
  static async update(id: number, data: Partial<User>): Promise<User | null> {
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
    const result = await db.query<User>(
      `UPDATE users 
       SET ${fields.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING id, email, name, role, kelurahan_id, is_active, created_at, updated_at`,
      values
    );

    return result.rows[0] || null;
  }

  // Delete user (soft delete - set is_active = false)
  static async delete(id: number): Promise<boolean> {
    const result = await db.query(
      'UPDATE users SET is_active = false WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }

  // Hard delete user
  static async hardDelete(id: number): Promise<boolean> {
    const result = await db.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }
}

export default UserModel;
