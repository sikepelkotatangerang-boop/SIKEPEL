# ============================================
# Script Otomatis Migrasi ke Neon Database
# ============================================

Write-Host "🚀 MIGRASI DATABASE KE NEON" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ File .env.local tidak ditemukan!" -ForegroundColor Red
    Write-Host "💡 Silakan buat file .env.local terlebih dahulu`n" -ForegroundColor Yellow
    exit 1
}

# Check if still using Supabase URL
$envContent = Get-Content ".env.local" -Raw
if ($envContent -match "db\.giutqfeliytoaamcmqny\.supabase\.co") {
    Write-Host "⚠️  PERINGATAN: .env.local masih menggunakan Supabase!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Apakah Anda ingin saya update DATABASE_URL ke Neon? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq "Y" -or $response -eq "y") {
        Write-Host "`n⏳ Updating .env.local..." -ForegroundColor Cyan
        
        # Backup .env.local
        Copy-Item ".env.local" ".env.local.backup" -Force
        Write-Host "✅ Backup dibuat: .env.local.backup" -ForegroundColor Green
        
        # Update DATABASE_URL
        $newEnvContent = $envContent -replace "DATABASE_URL=postgresql://.*", "DATABASE_URL=postgresql://neondb_owner:npg_fcrs3v1SnYGD@ep-sparkling-cell-a1jll4tr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
        
        # Comment out SUPABASE_DB_URL if exists
        $newEnvContent = $newEnvContent -replace "^SUPABASE_DB_URL=", "# SUPABASE_DB_URL="
        
        Set-Content ".env.local" $newEnvContent
        Write-Host "✅ .env.local updated!`n" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Migrasi dibatalkan." -ForegroundColor Red
        Write-Host "💡 Silakan update .env.local secara manual. Lihat UPDATE_ENV.md`n" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "STEP 1: Test Koneksi" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

node scripts/test-neon-connection.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Koneksi gagal! Silakan periksa .env.local" -ForegroundColor Red
    Write-Host "📖 Lihat UPDATE_ENV.md untuk panduan`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "STEP 2: Import Schema" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "Apakah Anda ingin import schema sekarang? (Y/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    node scripts/import-schema-to-neon.js
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Import schema gagal!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n⏭️  Skip import schema" -ForegroundColor Yellow
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "STEP 3: Seed Data Awal" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "Apakah Anda ingin seed data awal? (Y/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    npm run db:setup
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n⚠️  Seed data gagal, tapi tidak masalah" -ForegroundColor Yellow
        Write-Host "💡 Anda bisa jalankan manual: npm run db:setup`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n⏭️  Skip seed data" -ForegroundColor Yellow
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "✅ MIGRASI SELESAI!" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "🎉 Database Anda sudah menggunakan Neon PostgreSQL!`n" -ForegroundColor Green

Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. npm run dev (start development server)" -ForegroundColor White
Write-Host "   2. Buka http://localhost:3000" -ForegroundColor White
Write-Host "   3. Test login dan fitur aplikasi`n" -ForegroundColor White

Write-Host "📖 Dokumentasi lengkap: MIGRATION_GUIDE.md`n" -ForegroundColor Cyan
