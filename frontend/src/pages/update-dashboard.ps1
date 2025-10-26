$content = Get-Content Dashboard.tsx -Raw
$content = $content -replace '<Box sx=\{\{ width: ''100%'' \}\}>', '<PageContainer>'
$content = $content -replace 'mb: 3', 'mb: 2'
$content = $content -replace 'spacing=\{3\}', 'spacing={2}'
$content = $content -replace 'height: 550', 'height: 400'
$content = $content -replace 'outerRadius=\{160\}', 'outerRadius={120}'
$content = $content -replace '</Box>\s*\);[\s]*\};[\s]*$', '</PageContainer>\n  );\n};\n'
Set-Content Dashboard.tsx $content
