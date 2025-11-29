# scripts/index_all.ps1
# data 폴더의 모든 PDF 파일을 인덱싱하는 스크립트

Write-Host "=== PDF 인덱싱 시작 ===" -ForegroundColor Cyan

# data 폴더 확인
$dataPath = Join-Path $PSScriptRoot "..\data"
if (-not (Test-Path $dataPath)) {
    Write-Host "data 폴더를 찾을 수 없습니다: $dataPath" -ForegroundColor Red
    exit 1
}

# PDF 파일 목록
$pdfFiles = Get-ChildItem -Path $dataPath -Filter "*.pdf"

if ($pdfFiles.Count -eq 0) {
    Write-Host "data 폴더에 PDF 파일이 없습니다." -ForegroundColor Yellow
    Write-Host "data/ 폴더에 PDF 파일을 추가한 후 다시 실행하세요." -ForegroundColor Yellow
    exit 0
}

Write-Host "발견된 PDF 파일: $($pdfFiles.Count)개" -ForegroundColor Green

# 각 PDF 인덱싱
$scriptPath = Join-Path $PSScriptRoot "index_pdf.py"
foreach ($pdf in $pdfFiles) {
    Write-Host ""
    Write-Host "--- $($pdf.Name) 인덱싱 중 ---" -ForegroundColor Cyan
    python $scriptPath $pdf.FullName
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "오류 발생: $($pdf.Name)" -ForegroundColor Red
    } else {
        Write-Host "완료: $($pdf.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== PDF 인덱싱 완료 ===" -ForegroundColor Cyan

