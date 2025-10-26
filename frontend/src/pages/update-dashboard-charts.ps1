$content = Get-Content Dashboard.tsx -Raw
# Reduce bar chart margins
$content = $content -replace 'margin=\{ top: 20, right: 50, left: 40, bottom: 30 \}', 'margin={{ top: 10, right: 20, left: 20, bottom: 20 }}'
# Reduce CardContent padding
$content = $content -replace '<CardContent sx=\{ p: 3 \}>', '<CardContent sx={{ p: 2 }}>'
Set-Content Dashboard.tsx $content
