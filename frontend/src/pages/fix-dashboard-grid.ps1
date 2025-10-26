$content = Get-Content Dashboard.tsx -Raw
# Change lg={7.5} to lg={8} for bar chart
$content = $content -replace 'xs=\{12\} lg=\{7\.5\}', 'xs={12} lg={8}'
# Change lg={4.5} to lg={4} for pie chart
$content = $content -replace 'xs=\{12\} lg=\{4\.5\}', 'xs={12} lg={4}'
Set-Content Dashboard.tsx $content
