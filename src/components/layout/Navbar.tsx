'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Menu, Bell, X, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Button from '../ui/Button';
import { mockAuth } from '@/lib/mockData';

interface NavbarProps {
  onMenuClick: () => void;
}

interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = mockAuth.getCurrentUser();
    setCurrentUser(user);
    loadNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = () => {
    const saved = localStorage.getItem('userNotifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  };

  const handleLogout = () => {
    // Clear localStorage
    mockAuth.logout();
    
    // Clear auth cookie
    document.cookie = 'auth-token=; path=/; max-age=0';
    
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-20 h-16">
      <div className="h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Left side - Menu button */}
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 mr-2"
              onClick={onMenuClick}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
              Sistem Administrasi Surat
            </h1>
          </div>

          {/* Right side - User info & actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Notifikasi</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Tidak ada notifikasi</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => {
                        const Icon = notif.type === 'success' ? CheckCircle 
                          : notif.type === 'warning' || notif.type === 'error' ? AlertTriangle 
                          : Info;
                        
                        const iconColor = notif.type === 'success' ? 'text-green-600'
                          : notif.type === 'warning' ? 'text-yellow-600'
                          : notif.type === 'error' ? 'text-red-600'
                          : 'text-blue-600';

                        return (
                          <div 
                            key={notif.id} 
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-blue-50' : ''}`}
                          >
                            <div className="flex gap-3">
                              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                                <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notif.createdAt).toLocaleDateString('id-ID', { 
                                    day: 'numeric', 
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-200 text-center">
                      <button 
                        onClick={() => {
                          setShowNotifications(false);
                          router.push('/notifikasi');
                        }}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Lihat Semua Notifikasi
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User info */}
            {currentUser && (
              <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-medium text-sm">
                      {currentUser.name.charAt(0)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Logout button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-700"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
