$content = Get-Content Dashboard.tsx -Raw
# Add width: 100% to all Grid container instances
$content = $content -replace '<Grid container spacing=\{2\} sx=\{\{ mb: 2 \}\}>', '<Grid container spacing={2} sx={{ mb: 2, width: ''100%'' }}>'
Set-Content Dashboard.tsx $content
