$content = Get-Content index.css -Raw
$content = $content -replace '#root \{[^}]+\}', @'
#root {
  width: 100%;
  min-height: 100vh;
}
'@
Set-Content index.css $content
