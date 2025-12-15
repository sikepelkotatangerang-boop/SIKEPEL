'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, FileText, Send, Users, X, FileCheck, List, BarChart3, Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { mockAuth } from '@/lib/mockData';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'staff', 'user'] },
  { name: 'Pelayanan Administrasi', href: '/surat-keterangan', icon: FileCheck, roles: ['admin', 'staff'] },
  { name: 'Daftar Surat', href: '/daftar-surat', icon: List, roles: ['admin', 'staff'] },
  { name: 'Surat Keluar', href: '/surat-keluar', icon: Send, roles: ['admin', 'staff'] },
  { name: 'Surat Masuk', href: '/surat-masuk', icon: FileText, roles: ['admin', 'staff'] },
  { name: 'Statistik', href: '/statistik', icon: BarChart3, roles: ['admin', 'staff'] },
  { name: 'Pengguna', href: '/pengguna', icon: Users, roles: ['admin'] }, // Only admin
  { name: 'Notifikasi', href: '/notifikasi', icon: Bell, roles: ['admin'] }, // Only admin
  { name: 'Pengaturan', href: '/settings', icon: Settings, roles: ['admin'] }, // Only admin
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = mockAuth.getCurrentUser();
    setCurrentUser(user);
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-14 relative flex-shrink-0 flex items-center justify-center overflow-hidden">
                <Image
                  src="/assets/logo_sikepel.png"
                  alt="Logo Sikepel"
                  width={160}
                  height={160}
                  className="object-contain"
                  priority
                  onError={(e) => {
                    // Fallback to text logo if image not found
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 text-base">
                  SIKEPEL
                </span>
                <span className="text-xs text-gray-500">
                  {currentUser?.role === 'admin'
                    ? 'Kecamatan Cibodas'
                    : (currentUser as any)?.kelurahan?.nama
                      ? `Kel. ${(currentUser as any).kelurahan.nama}`
                      : typeof currentUser?.kelurahan === 'string'
                        ? currentUser.kelurahan
                        : 'Kelurahan Cibodas'
                  }
                </span>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation
              .filter((item) => {
                // Filter menu based on user role
                if (!currentUser) return true;
                return item.roles.includes(currentUser.role);
              })
              .map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      // Close mobile menu when clicking a link
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    className={cn(
                      'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-primary-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-primary-900 mb-1">
                SIKEPEL
              </p>
              <p className="text-xs text-primary-600 mt-2">
                v1.0.0
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
