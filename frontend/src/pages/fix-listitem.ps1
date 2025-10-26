$content = Get-Content Dashboard.tsx -Raw
$content = $content -replace '<ListItemText\s+primary=', '<ListItemText disableTypography primary='
Set-Content Dashboard.tsx $content
