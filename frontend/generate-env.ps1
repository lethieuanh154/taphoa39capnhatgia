# generate-env.ps1
$latestBranchId = $env:LatestBranchId;
$username = $env:UserName;
$password = $env:Password;
$retailer = $env:retailer;

$envContent = @"

window.__env = {
  LatestBranchId: '$latestBranchId',
  UserName: '$username',
  Password: '$password',
  retailer: '$retailer'
};

"@


# Ghi vào file Angular static assets
$envPath = "src/assets/env.js"
Set-Content -Path $envPath -Value $envContent -Encoding UTF8
Write-Host "✅ Đã tạo file env.js tại $envPath"
