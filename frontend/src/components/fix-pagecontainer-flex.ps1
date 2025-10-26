$content = Get-Content PageContainer.tsx -Raw
$content = $content -replace "flexDirection: 'column',", "flexDirection: 'column',`n        alignItems: 'stretch',"
Set-Content PageContainer.tsx $content
