$content = Get-Content MainLayout.tsx -Raw
# Remove the width constraint - flexGrow: 1 is enough in a flex container
$content = $content -replace "width: \{ xs: '100%', md: ``calc\(100% - \`\${drawerWidth}px\)`` \},", ""
Set-Content MainLayout.tsx $content
