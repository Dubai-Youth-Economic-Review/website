param(
  [switch]$Commit,
  [switch]$Push
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$legacyPath = Join-Path $root 'legacy.json'

if (-not (Test-Path $legacyPath)) {
  Write-Error "legacy.json not found at $legacyPath"
}

function Read-YesNo($label) {
  $raw = Read-Host $label
  if (-not $raw) { return $false }
  $norm = $raw.Trim().ToLower()
  return ($norm -eq 'true' -or $norm -eq 'yes' -or $norm -eq 'y')
}

Write-Host "Adding article to legacy.json. Press Enter to leave optional fields blank." -ForegroundColor Cyan

$title     = Read-Host "1/8 Title"
$author    = Read-Host "2/8 Author"
$position  = Read-Host "3/8 Position (optional)"
$date      = Read-Host "4/8 Date (YYYY-MM-DD)"
$category  = Read-Host "5/8 Category"
$excerpt   = Read-Host "6/8 Excerpt (optional)"
$imageFile = Read-Host "7/8 Image filename in article_images (optional, leave blank to add later)"

Write-Host "8/8 Body: paste HTML or markdown. End with a single line containing EOF." -ForegroundColor Cyan
$bodyLines = @()
while ($true) {
  $line = Read-Host
  if ($line -eq 'EOF') { break }
  $bodyLines += $line
}
$body = ($bodyLines -join "`n").Trim()

if (-not $title)    { Write-Error "Title is required." }
if (-not $author)   { Write-Error "Author is required." }
if (-not $date)     { Write-Error "Date is required." }
if (-not $category) { Write-Error "Category is required." }

$imagePath = ''
if ($imageFile) {
  $imagePath = "article_images/$($imageFile.Trim())"
}

$article = [ordered]@{
  title          = $title.Trim()
  author         = $author.Trim()
  position       = $position
  date           = $date.Trim()
  category       = $category.Trim()
  excerpt        = $excerpt
  image          = $imagePath
  body           = $body
  special_report = $false
  editors_pick   = $false
}

$jsonRaw  = Get-Content -Path $legacyPath -Raw
$articles = $jsonRaw | ConvertFrom-Json
if (-not ($articles -is [System.Collections.IEnumerable])) {
  Write-Error "legacy.json must contain an array."
}

$articles += $article
$articles | ConvertTo-Json -Depth 20 | Set-Content -Path $legacyPath -Encoding utf8

Write-Host "Added to legacy.json: $($article.title)" -ForegroundColor Green

$shouldPush = Read-YesNo "Push and deploy? (y/n)"
if ($shouldPush) {
  git add $legacyPath

  if ($imagePath) {
    $imageFullPath = Join-Path $root $imagePath
    if (Test-Path $imageFullPath) {
      git add $imageFullPath
    }
  }

  git commit -m "Add legacy article: $($article.title)"
  git push
}