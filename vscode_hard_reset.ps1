# VS Code Hard Reset Script
# Bu script tüm VS Code kullanıcı verilerini siler (ayarlar, extensions, workspace history, vb.)

Write-Host ""
Write-Host "============================================" -ForegroundColor Yellow
Write-Host "    VS CODE HARD RESET" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "UYARI: Bu işlem şunları SİLER:" -ForegroundColor Red
Write-Host "  - Tüm VS Code ayarları (settings.json, keybindings)" -ForegroundColor Red
Write-Host "  - Tüm extensions (yeniden yüklemeniz gerekir)" -ForegroundColor Red
Write-Host "  - Workspace geçmişi ve state" -ForegroundColor Red
Write-Host "  - MongoDB bağlantı verileri" -ForegroundColor Red
Write-Host "  - Extension ayarları ve cache" -ForegroundColor Red
Write-Host ""
Write-Host "SİLİNECEK KLASÖRLER:" -ForegroundColor Cyan
Write-Host "  1. $env:APPDATA\Code" -ForegroundColor Gray
Write-Host "  2. $env:USERPROFILE\.vscode" -ForegroundColor Gray
Write-Host ""

# VS Code açık mı kontrol et
$vscodeProcess = Get-Process -Name "Code" -ErrorAction SilentlyContinue
if ($vscodeProcess) {
    Write-Host "✗ HATA: VS Code hala çalışıyor!" -ForegroundColor Red
    Write-Host "  Önce VS Code'u tamamen kapatın (tüm pencereler)" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Devam etmek için Enter'a basın"
    exit
}

Write-Host "✓ VS Code kapalı" -ForegroundColor Green
Write-Host ""

# Son onay
$confirm = Read-Host "Devam etmek istiyor musunuz? (EVET yazın)"
if ($confirm -ne "EVET") {
    Write-Host "İşlem iptal edildi." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Siliniyor..." -ForegroundColor Yellow

# Klasörleri sil
try {
    if (Test-Path "$env:APPDATA\Code") {
        Remove-Item "$env:APPDATA\Code" -Recurse -Force -ErrorAction Stop
        Write-Host "✓ $env:APPDATA\Code silindi" -ForegroundColor Green
    } else {
        Write-Host "○ $env:APPDATA\Code zaten yok" -ForegroundColor Gray
    }
    
    if (Test-Path "$env:USERPROFILE\.vscode") {
        Remove-Item "$env:USERPROFILE\.vscode" -Recurse -Force -ErrorAction Stop
        Write-Host "✓ $env:USERPROFILE\.vscode silindi" -ForegroundColor Green
    } else {
        Write-Host "○ $env:USERPROFILE\.vscode zaten yok" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "  ✓ VS CODE TAMAMEN SIFIRLANDI" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Şimdi VS Code'u açın - ilk kurulum gibi temiz başlayacak." -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "✗ HATA: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Bazı dosyalar hala kullanımda olabilir." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Kapatmak için Enter'a basın"
