'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import {
    ArrowLeft,
    Printer,
    Sparkles,
    Trash2,
    Plus
} from 'lucide-react';
import { mockAuth } from '@/lib/mockData';

interface ChangeDetail {
    active: boolean;
    semula: string;
    menjadi: string;
    dasar: string;
}

interface LainnyaDetail extends ChangeDetail {
    elemen: string;
}

interface Entry {
    id: number;
    no_urut: string;
    nama: string;
    nik: string;
    shdk: string;
    changes: {
        pendidikan: ChangeDetail;
        pekerjaan: ChangeDetail;
        agama: ChangeDetail;
        lainnya: LainnyaDetail;
    };
}

export default function FormPerubahanData() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const user = mockAuth.getCurrentUser();

    // Data Wilayah
    const [dataWilayah] = useState({
        provinsi: 'BANTEN',
        kabupaten_kota: 'TANGERANG',
        kecamatan: 'CIBODAS',
        desakelurahan: user?.kelurahan || 'CIBODAS',
    });

    // Data Pemohon
    const [formData, setFormData] = useState({
        nama_lengkap: '',
        nik: '',
        no_kk: '',
        alamat_rumah: '',
        rt: '',
        rw: '',
        kode_pos: '',
        tanggal_surat: new Date().toISOString().split('T')[0],
    });

    const defaultChanges = {
        pendidikan: { active: false, semula: '', menjadi: '', dasar: '' },
        pekerjaan: { active: false, semula: '', menjadi: '', dasar: '' },
        agama: { active: false, semula: '', menjadi: '', dasar: '' },
        lainnya: { active: false, elemen: '', semula: '', menjadi: '', dasar: '' },
    };

    const [entries, setEntries] = useState<Entry[]>([
        {
            id: Date.now(),
            no_urut: '',
            nama: '',
            nik: '',
            shdk: '',
            changes: JSON.parse(JSON.stringify(defaultChanges))
        }
    ]);

    const generateSampleData = () => {
        setFormData({
            nama_lengkap: 'BUDI SANTOSO',
            nik: '3671012345678901',
            no_kk: '3671012345678902',
            alamat_rumah: 'JL. MERDEKA NO. 45',
            rt: '001',
            rw: '002',
            kode_pos: '15138',
            tanggal_surat: new Date().toISOString().split('T')[0],
        });
        setEntries([
            {
                id: Date.now(),
                no_urut: '1',
                nama: 'BUDI SANTOSO',
                nik: '3671012345678901',
                shdk: 'KEPALA KELUARGA',
                changes: {
                    pendidikan: { active: true, semula: 'SMA', menjadi: 'SARJANA (S1)', dasar: 'IJAZAH S1' },
                    pekerjaan: { active: true, semula: 'KARYAWAN SWASTA', menjadi: 'PNS', dasar: 'SK PNS' },
                    agama: { active: false, semula: '', menjadi: '', dasar: '' },
                    lainnya: { active: false, elemen: '', semula: '', menjadi: '', dasar: '' },
                }
            }
        ]);
        alert('Data contoh berhasil dimuat!');
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value.toUpperCase() }));
    };

    const addEntry = () => {
        setEntries(prev => [
            ...prev,
            {
                id: Date.now(),
                no_urut: (prev.length + 1).toString(),
                nama: '',
                nik: '',
                shdk: '',
                changes: JSON.parse(JSON.stringify(defaultChanges))
            }
        ]);
    };

    const removeEntry = (id: number) => {
        if (entries.length === 1) {
            alert("Minimal satu data harus diisi");
            return;
        }
        setEntries(prev => prev.filter(e => e.id !== id));
    };

    const updateEntry = (id: number, field: string, value: string) => {
        setEntries(prev => prev.map(e => {
            if (e.id === id) return { ...e, [field]: value.toUpperCase() };
            return e;
        }));
    };

    const updateEntryChange = (id: number, category: keyof Entry['changes'], field: string, value: any) => {
        setEntries(prev => prev.map(e => {
            if (e.id === id) {
                return {
                    ...e,
                    changes: {
                        ...e.changes,
                        [category]: {
                            ...e.changes[category],
                            [field]: field === 'active' ? value : value.toUpperCase()
                        }
                    }
                };
            }
            return e;
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nama_lengkap || !formData.nik || !formData.no_kk) {
            alert('Mohon lengkapi data pemohon');
            return;
        }

        // Validate entries
        for (const entry of entries) {
            if (!entry.nama || !entry.nik) {
                alert(`Mohon lengkapi nama dan NIK untuk data perubahan No. Urut ${entry.no_urut}`);
                return;
            }
            const hasChanges = Object.values(entry.changes).some((c) => c.active);
            if (!hasChanges) {
                alert(`Mohon pilih minimal satu jenis perubahan data untuk ${entry.nama}`);
                return;
            }
        }

        setLoading(true);
        try {
            const payload = {
                dataWilayah,
                formData,
                entries
            };

            const response = await fetch('/api/process-f106', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Gagal memproses dokumen');
            }

            alert('Berhasil! Dokumen telah diproses dan disimpan.');

            if (result.url) {
                window.open(result.url, '_blank');
            }

            router.push('/surat-keterangan');

        } catch (err: any) {
            console.error(err);
            alert('Terjadi kesalahan: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/surat-keterangan');
    };

    const shdkOptions = [
        'KEPALA KELUARGA',
        'SUAMI',
        'ISTRI',
        'ANAK',
        'MENANTU',
        'CUCU',
        'ORANG TUA',
        'MERTUA',
        'FAMILI LAIN',
        'PEMBANTU',
        'LAINNYA'
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" onClick={handleBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Form Surat Perubahan Data (F-106)</h1>
                            <p className="text-sm text-gray-600">Isi form sesuai dengan template F-106</p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateSampleData}
                        className="bg-purple-50 text-purple-700 border-purple-200"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Contoh Data
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">


                    {/* II. Data Pemohon */}
                    <Card>
                        <CardHeader className="bg-gray-50 border-b">
                            <CardTitle className="text-lg">I. Data Pemohon</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Nama Lengkap</Label>
                                    <Input
                                        value={formData.nama_lengkap}
                                        onChange={(e) => handleInputChange('nama_lengkap', e.target.value)}
                                        placeholder="Sesuai KTP"
                                    />
                                </div>
                                <div>
                                    <Label>NIK</Label>
                                    <Input
                                        value={formData.nik}
                                        onChange={(e) => handleInputChange('nik', e.target.value)}
                                        maxLength={16}
                                        placeholder="16 Digit NIK"
                                    />
                                </div>
                                <div>
                                    <Label>Nomor KK</Label>
                                    <Input
                                        value={formData.no_kk}
                                        onChange={(e) => handleInputChange('no_kk', e.target.value)}
                                        maxLength={16}
                                        placeholder="16 Digit No. KK"
                                    />
                                </div>
                                <div>
                                    <Label>Tanggal Surat</Label>
                                    <Input
                                        type="date"
                                        value={formData.tanggal_surat}
                                        onChange={(e) => handleInputChange('tanggal_surat', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Alamat Rumah</Label>
                                <Input
                                    value={formData.alamat_rumah}
                                    onChange={(e) => handleInputChange('alamat_rumah', e.target.value)}
                                    placeholder="Nama Jalan, Blok, No. Rumah"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>RT</Label>
                                    <Input
                                        value={formData.rt}
                                        onChange={(e) => handleInputChange('rt', e.target.value)}
                                        placeholder="000"
                                    />
                                </div>
                                <div>
                                    <Label>RW</Label>
                                    <Input
                                        value={formData.rw}
                                        onChange={(e) => handleInputChange('rw', e.target.value)}
                                        placeholder="000"
                                    />
                                </div>
                                <div>
                                    <Label>Kode Pos</Label>
                                    <Input
                                        value={formData.kode_pos}
                                        onChange={(e) => handleInputChange('kode_pos', e.target.value)}
                                        placeholder="00000"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* III. Anggota Keluarga yang Diubah datanya */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">II. Data Anggota Keluarga Yang Berubah</h2>
                            <Button type="button" onClick={addEntry} size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Anggota
                            </Button>
                        </div>

                        {entries.map((entry, index) => (
                            <Card key={entry.id} className="border-l-4 border-l-blue-500">
                                <CardHeader className="bg-gray-50 border-b flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg">Anggota Keluarga #{index + 1}</CardTitle>
                                    {entries.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            onClick={() => removeEntry(entry.id)}
                                            className="h-8 w-8 p-0"
                                            title="Hapus Data"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    {/* Identitas */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>No Urut KK</Label>
                                            <Input
                                                value={entry.no_urut}
                                                onChange={(e) => updateEntry(entry.id, 'no_urut', e.target.value)}
                                                placeholder="Contoh: 1"
                                            />
                                        </div>
                                        <div>
                                            <Label>SHDK</Label>
                                            <div className="relative">
                                                <select
                                                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={entry.shdk}
                                                    onChange={(e) => updateEntry(entry.id, 'shdk', e.target.value)}
                                                >
                                                    <option value="">Pilih SHDK</option>
                                                    {shdkOptions.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Nama Lengkap</Label>
                                            <Input
                                                value={entry.nama}
                                                onChange={(e) => updateEntry(entry.id, 'nama', e.target.value)}
                                                placeholder="Nama"
                                            />
                                        </div>
                                        <div>
                                            <Label>NIK</Label>
                                            <Input
                                                value={entry.nik}
                                                onChange={(e) => updateEntry(entry.id, 'nik', e.target.value)}
                                                maxLength={16}
                                                placeholder="NIK"
                                            />
                                        </div>
                                    </div>

                                    {/* Rincian Perubahan */}
                                    <div className="space-y-4 border-t pt-4">
                                        <h4 className="font-semibold text-gray-700">Rincian Perubahan Data:</h4>

                                        {/* Pendidikan */}
                                        <div className="border p-4 rounded-lg bg-gray-50/50">
                                            <div className="flex items-center space-x-2 mb-4">
                                                <Checkbox
                                                    id={`check-pendidikan-${entry.id}`}
                                                    checked={entry.changes.pendidikan.active}
                                                    onCheckedChange={(c) => updateEntryChange(entry.id, 'pendidikan', 'active', c === true)}
                                                />
                                                <Label htmlFor={`check-pendidikan-${entry.id}`} className="font-bold cursor-pointer">Perubahan Pendidikan</Label>
                                            </div>
                                            {entry.changes.pendidikan.active && (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                                                    <div><Label>Semula</Label><Input value={entry.changes.pendidikan.semula} onChange={(e) => updateEntryChange(entry.id, 'pendidikan', 'semula', e.target.value)} placeholder="Semula" /></div>
                                                    <div><Label>Menjadi</Label><Input value={entry.changes.pendidikan.menjadi} onChange={(e) => updateEntryChange(entry.id, 'pendidikan', 'menjadi', e.target.value)} placeholder="Menjadi" /></div>
                                                    <div><Label>Dasar</Label><Input value={entry.changes.pendidikan.dasar} onChange={(e) => updateEntryChange(entry.id, 'pendidikan', 'dasar', e.target.value)} placeholder="Dasar" /></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Pekerjaan */}
                                        <div className="border p-4 rounded-lg bg-gray-50/50">
                                            <div className="flex items-center space-x-2 mb-4">
                                                <Checkbox
                                                    id={`check-pekerjaan-${entry.id}`}
                                                    checked={entry.changes.pekerjaan.active}
                                                    onCheckedChange={(c) => updateEntryChange(entry.id, 'pekerjaan', 'active', c === true)}
                                                />
                                                <Label htmlFor={`check-pekerjaan-${entry.id}`} className="font-bold cursor-pointer">Perubahan Pekerjaan</Label>
                                            </div>
                                            {entry.changes.pekerjaan.active && (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                                                    <div><Label>Semula</Label><Input value={entry.changes.pekerjaan.semula} onChange={(e) => updateEntryChange(entry.id, 'pekerjaan', 'semula', e.target.value)} placeholder="Semula" /></div>
                                                    <div><Label>Menjadi</Label><Input value={entry.changes.pekerjaan.menjadi} onChange={(e) => updateEntryChange(entry.id, 'pekerjaan', 'menjadi', e.target.value)} placeholder="Menjadi" /></div>
                                                    <div><Label>Dasar</Label><Input value={entry.changes.pekerjaan.dasar} onChange={(e) => updateEntryChange(entry.id, 'pekerjaan', 'dasar', e.target.value)} placeholder="Dasar" /></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Agama */}
                                        <div className="border p-4 rounded-lg bg-gray-50/50">
                                            <div className="flex items-center space-x-2 mb-4">
                                                <Checkbox
                                                    id={`check-agama-${entry.id}`}
                                                    checked={entry.changes.agama.active}
                                                    onCheckedChange={(c) => updateEntryChange(entry.id, 'agama', 'active', c === true)}
                                                />
                                                <Label htmlFor={`check-agama-${entry.id}`} className="font-bold cursor-pointer">Perubahan Agama</Label>
                                            </div>
                                            {entry.changes.agama.active && (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                                                    <div><Label>Semula</Label><Input value={entry.changes.agama.semula} onChange={(e) => updateEntryChange(entry.id, 'agama', 'semula', e.target.value)} placeholder="Semula" /></div>
                                                    <div><Label>Menjadi</Label><Input value={entry.changes.agama.menjadi} onChange={(e) => updateEntryChange(entry.id, 'agama', 'menjadi', e.target.value)} placeholder="Menjadi" /></div>
                                                    <div><Label>Dasar</Label><Input value={entry.changes.agama.dasar} onChange={(e) => updateEntryChange(entry.id, 'agama', 'dasar', e.target.value)} placeholder="Dasar" /></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Lainnya */}
                                        <div className="border p-4 rounded-lg bg-gray-50/50">
                                            <div className="flex items-center space-x-2 mb-4">
                                                <Checkbox
                                                    id={`check-lainnya-${entry.id}`}
                                                    checked={entry.changes.lainnya.active}
                                                    onCheckedChange={(c) => updateEntryChange(entry.id, 'lainnya', 'active', c === true)}
                                                />
                                                <Label htmlFor={`check-lainnya-${entry.id}`} className="font-bold cursor-pointer">Perubahan Lainnya</Label>
                                            </div>
                                            {entry.changes.lainnya.active && (
                                                <div className="space-y-4 pl-6">
                                                    <div><Label>Elemen</Label><Input value={entry.changes.lainnya.elemen} onChange={(e) => updateEntryChange(entry.id, 'lainnya', 'elemen', e.target.value)} placeholder="Elemen Data" /></div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div><Label>Semula</Label><Input value={entry.changes.lainnya.semula} onChange={(e) => updateEntryChange(entry.id, 'lainnya', 'semula', e.target.value)} placeholder="Semula" /></div>
                                                        <div><Label>Menjadi</Label><Input value={entry.changes.lainnya.menjadi} onChange={(e) => updateEntryChange(entry.id, 'lainnya', 'menjadi', e.target.value)} placeholder="Menjadi" /></div>
                                                        <div><Label>Dasar</Label><Input value={entry.changes.lainnya.dasar} onChange={(e) => updateEntryChange(entry.id, 'lainnya', 'dasar', e.target.value)} placeholder="Dasar" /></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Submit Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            disabled={loading}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]"
                            disabled={loading}
                        >
                            {loading ? 'Memproses...' : (
                                <>
                                    <Printer className="w-4 h-4 mr-2" />
                                    Cetak & Simpan PDF
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
