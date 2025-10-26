$content = Get-Content PageContainer.tsx -Raw
$content = $content -replace "flexDirection: 'column',", "flexDirection: 'column',`n        p: 2,"
Set-Content PageContainer.tsx $content
