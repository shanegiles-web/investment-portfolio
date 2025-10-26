$content = Get-Content index.css -Raw
$content = $content -replace '(?s)body \{[^}]+\}', @'
body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  overflow-x: hidden;
}
'@
Set-Content index.css $content
