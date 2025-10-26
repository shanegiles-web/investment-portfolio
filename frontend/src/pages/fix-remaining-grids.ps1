$content = Get-Content Dashboard.tsx -Raw
# Fix line 311 - nested Grid in Account Breakdown
$content = $content -replace '(<Grid container spacing=\{2\}>)(?!\s*\{allocation)', '<Grid container spacing={2} sx={{ width: ''100%'' }}>'
# Fix line 346 - Lists Row Grid
$content = $content -replace '(<!-- Lists Row[^>]*>\s*)<Grid container spacing=\{2\}>', '$1<Grid container spacing={2} sx={{ width: ''100%'' }}>'
Set-Content Dashboard.tsx $content
