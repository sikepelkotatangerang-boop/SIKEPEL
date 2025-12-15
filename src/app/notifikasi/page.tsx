'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Bell, Send, Users, UserCheck, X } from 'lucide-react';
import { mockAuth } from '@/lib/mockData';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function NotifikasiPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    title: '',
    message: '',
    recipients: 'all' as 'all' | 'staff' | 'specific',
    selectedUsers: [] as number[],
  });

  // Check if user is admin
  useEffect(() => {
    const currentUser = mockAuth.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/dashboard');
    } else {
      setIsAuthorized(true);
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setMessage('');

    try {
      const currentUser = mockAuth.getCurrentUser();
      
      const payload = {
        type: formData.type,
        title: formData.title,
        message: formData.message,
        recipients: formData.recipients,
        recipientIds: formData.recipients === 'specific' ? formData.selectedUsers : [],
        createdBy: currentUser?.id || 1,
      };

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        // Save to localStorage for demo
        const existingNotifs = JSON.parse(localStorage.getItem('userNotifications') || '[]');
        existingNotifs.unshift({
          ...payload,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          read: false,
        });
        localStorage.setItem('userNotifications', JSON.stringify(existingNotifs));

        setMessage('✅ Notifikasi berhasil dikirim!');
        setFormData({
          type: 'info',
          title: '',
          message: '',
          recipients: 'all',
          selectedUsers: [],
        });
        setShowModal(false);
        
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ ' + (data.error || 'Gagal mengirim notifikasi'));
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setMessage('❌ Terjadi kesalahan saat mengirim notifikasi');
    } finally {
      setSending(false);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId]
    }));
  };

  const staffUsers = users.filter(u => u.role === 'staff');
  const recipientCount = formData.recipients === 'all' 
    ? users.length 
    : formData.recipients === 'staff'
      ? staffUsers.length
      : formData.selectedUsers.length;

  if (!isAuthorized) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kirim Notifikasi</h1>
            <p className="mt-2 text-gray-600">Kirim notifikasi ke semua pengguna atau staff tertentu</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Send className="w-4 h-4 mr-2" />
            Buat Notifikasi Baru
          </Button>
        </div>

        {/* Success Message */}
        {message && (
          <div className={`p-4 rounded-md ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                  <div className="text-sm text-gray-500">Total Pengguna</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{staffUsers.length}</div>
                  <div className="text-sm text-gray-500">Staff Aktif</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Bell className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {JSON.parse(localStorage.getItem('userNotifications') || '[]').length}
                  </div>
                  <div className="text-sm text-gray-500">Notifikasi Terkirim</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Cara Menggunakan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>Semua Pengguna:</strong> Notifikasi akan dikirim ke semua user yang terdaftar</p>
              <p>• <strong>Semua Staff:</strong> Notifikasi hanya dikirim ke user dengan role staff</p>
              <p>• <strong>Pilih Pengguna:</strong> Pilih user tertentu yang akan menerima notifikasi</p>
              <p>• <strong>Tipe Notifikasi:</strong> Info (biru), Success (hijau), Warning (kuning), Error (merah)</p>
            </div>
          </CardContent>
        </Card>

        {/* Modal Create Notification */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Buat Notifikasi Baru</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendNotification} className="space-y-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Notifikasi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="info">Info (Biru)</option>
                    <option value="success">Success (Hijau)</option>
                    <option value="warning">Warning (Kuning)</option>
                    <option value="error">Error (Merah)</option>
                  </select>
                </div>

                {/* Title */}
                <Input
                  label="Judul Notifikasi"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Contoh: Pengumuman Penting"
                />

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pesan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={3}
                    placeholder="Tulis pesan notifikasi..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Recipients */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Penerima <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.recipients}
                    onChange={(e) => setFormData({ ...formData, recipients: e.target.value as any, selectedUsers: [] })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">Semua Pengguna ({users.length} orang)</option>
                    <option value="staff">Semua Staff ({staffUsers.length} orang)</option>
                    <option value="specific">Pilih Pengguna Tertentu</option>
                  </select>
                </div>

                {/* User Selection */}
                {formData.recipients === 'specific' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Pengguna ({formData.selectedUsers.length} dipilih)
                    </label>
                    <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto space-y-2">
                      {users.map(user => (
                        <label key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={formData.selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email} • {user.role}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="text-sm text-blue-800">
                    <strong>Ringkasan:</strong> Notifikasi akan dikirim ke <strong>{recipientCount} pengguna</strong>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={sending || (formData.recipients === 'specific' && formData.selectedUsers.length === 0)} className="flex-1">
                    <Send className="w-4 h-4 mr-2" />
                    {sending ? 'Mengirim...' : 'Kirim Notifikasi'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                    Batal
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
