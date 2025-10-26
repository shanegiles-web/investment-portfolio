$content = Get-Content MainLayout.tsx -Raw
$content = $content -replace "flexGrow: 1, width: '100%', height: 'calc\(100vh - 64px\)', overflow: 'hidden'", "flexGrow: 1, width: '100%', height: 'calc(100vh - 64px)'"
Set-Content MainLayout.tsx $content
