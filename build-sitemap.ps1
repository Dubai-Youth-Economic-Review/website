# Regenerates sitemap.xml from articles.json + legacy.json.
# Run this after adding or removing articles:  ./build-sitemap.ps1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$base = 'https://dubaiyoutheconomicsreview.app'
$today = (Get-Date).ToString('yyyy-MM-dd')

$articles = Get-Content (Join-Path $root 'articles.json') -Raw | ConvertFrom-Json
$legacy   = Get-Content (Join-Path $root 'legacy.json')   -Raw | ConvertFrom-Json

$lines = @()
$lines += '<?xml version="1.0" encoding="UTF-8"?>'
$lines += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

function Add-Url([string]$loc) {
  $script:lines += '  <url>'
  $script:lines += "    <loc>$loc</loc>"
  $script:lines += "    <lastmod>$today</lastmod>"
  $script:lines += '  </url>'
}

# Static pages
'/','/articles','/legacy','/about' | ForEach-Object { Add-Url ($base + $_) }

# Articles (slug-based; & escaped for XML)
foreach ($a in $articles) {
  if ($a.slug) { Add-Url ($base + '/article?slug=' + $a.slug) }
}
foreach ($a in $legacy) {
  if ($a.slug) { Add-Url ($base + '/article?slug=' + $a.slug + '&amp;legacy=1') }
}

$lines += '</urlset>'

$xml = ($lines -join "`r`n") + "`r`n"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path $root 'sitemap.xml'), $xml, $utf8NoBom)
Write-Host "Wrote sitemap.xml with $($articles.Count + $legacy.Count + 4) URLs" -ForegroundColor Green
