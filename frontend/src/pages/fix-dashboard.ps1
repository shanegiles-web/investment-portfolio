$content = Get-Content Dashboard.tsx -Raw
# Fix bar chart margins - need to escape the curly braces properly
$content = $content -replace 'margin=\{\{ top: 20, right: 50, left: 40, bottom: 30 \}\}', 'margin={{ top: 10, right: 20, left: 20, bottom: 20 }}'
# Fix CardContent padding
$content = $content -replace 'p: 3', 'p: 2'
Set-Content Dashboard.tsx $content
