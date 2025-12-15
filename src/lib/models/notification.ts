import db, { getClient } from '../db';

export interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  recipients: 'all' | 'staff' | 'specific';
  created_by: number;
  created_at: Date;
  is_read?: boolean;
  read_at?: Date;
}

export class NotificationModel {
  // Create notification
  static async create(data: {
    type: string;
    title: string;
    message: string;
    recipients: string;
    created_by: number;
    recipient_ids?: number[];
  }): Promise<Notification> {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Insert notification
      const notifResult = await client.query<Notification>(
        `INSERT INTO notifications (type, title, message, recipients, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [data.type, data.title, data.message, data.recipients, data.created_by]
      );

      const notification = notifResult.rows[0];

      // Get recipient user IDs based on recipients type
      let userIds: number[] = [];

      if (data.recipients === 'all') {
        const usersResult = await client.query<{ id: number }>('SELECT id FROM users WHERE is_active = true');
        userIds = usersResult.rows.map((row: { id: number }) => row.id);
      } else if (data.recipients === 'staff') {
        const usersResult = await client.query<{ id: number }>("SELECT id FROM users WHERE role = 'staff' AND is_active = true");
        userIds = usersResult.rows.map((row: { id: number }) => row.id);
      } else if (data.recipients === 'specific' && data.recipient_ids) {
        userIds = data.recipient_ids;
      }

      // Insert notification recipients
      if (userIds.length > 0) {
        const values = userIds.map((userId, index) => 
          `($1, $${index + 2}, false)`
        ).join(', ');
        
        await client.query(
          `INSERT INTO notification_recipients (notification_id, user_id, is_read)
           VALUES ${values}`,
          [notification.id, ...userIds]
        );
      }

      await client.query('COMMIT');
      return notification;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get notifications for a specific user
  static async getForUser(userId: number, limit: number = 10): Promise<Notification[]> {
    const result = await db.query<Notification>(
      `SELECT 
        n.*,
        nr.is_read,
        nr.read_at
       FROM notifications n
       INNER JOIN notification_recipients nr ON n.id = nr.notification_id
       WHERE nr.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }

  // Get unread count for user
  static async getUnreadCount(userId: number): Promise<number> {
    const result = await db.queryOne<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM notification_recipients
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    return parseInt(result?.count || '0');
  }

  // Mark notification as read
  static async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    const result = await db.query(
      `UPDATE notification_recipients
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE notification_id = $1 AND user_id = $2`,
      [notificationId, userId]
    );

    return (result.rowCount || 0) > 0;
  }

  // Mark all as read for user
  static async markAllAsRead(userId: number): Promise<boolean> {
    const result = await db.query(
      `UPDATE notification_recipients
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    return (result.rowCount || 0) > 0;
  }

  // Delete notification (admin only)
  static async delete(notificationId: number): Promise<boolean> {
    const result = await db.query(
      'DELETE FROM notifications WHERE id = $1',
      [notificationId]
    );

    return (result.rowCount || 0) > 0;
  }

  // Get all notifications (admin only)
  static async getAll(limit: number = 50): Promise<Notification[]> {
    const result = await db.query<Notification>(
      `SELECT n.*, u.name as created_by_name
       FROM notifications n
       LEFT JOIN users u ON n.created_by = u.id
       ORDER BY n.created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }
}

export default NotificationModel;
