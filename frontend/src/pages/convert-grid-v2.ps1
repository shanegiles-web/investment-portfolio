$content = Get-Content Dashboard.tsx -Raw

# Convert Grid item with xs, sm, lg props to size prop
$content = $content -replace '<Grid item xs=\{12\} sm=\{6\} lg=\{3\}>', '<Grid size={{ xs: 12, sm: 6, lg: 3 }}>'
$content = $content -replace '<Grid item xs=\{12\} lg=\{8\}>', '<Grid size={{ xs: 12, lg: 8 }}>'
$content = $content -replace '<Grid item xs=\{12\} lg=\{4\}>', '<Grid size={{ xs: 12, lg: 4 }}>'
$content = $content -replace '<Grid item xs=\{12\} sm=\{6\} md=\{4\} lg=\{3\}', '<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}'
$content = $content -replace '<Grid item xs=\{12\} md=\{4\}>', '<Grid size={{ xs: 12, md: 4 }}>'

Set-Content Dashboard.tsx $content
