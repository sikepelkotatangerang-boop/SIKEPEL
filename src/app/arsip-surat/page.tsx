'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus, Archive } from 'lucide-react';

export default function ArsipSuratPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Arsip Surat</h1>
            <p className="mt-2 text-gray-600">
              Arsip surat yang telah selesai diproses
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Arsipkan Surat
          </Button>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Arsip</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Archive className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Halaman Arsip Surat</p>
              <p className="text-sm text-gray-400 mt-2">
                Fitur ini sedang dalam pengembangan
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
