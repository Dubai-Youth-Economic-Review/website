param(
  [switch]$Commit,
  [switch]$Push
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$articlesPath = Join-Path $root 'articles.json'

if (-not (Test-Path $articlesPath)) {
  Write-Error "articles.json not found at $articlesPath"
}

function Read-YesNo($label) {
  $raw = Read-Host $label
  if (-not $raw) { return $false }
  $norm = $raw.Trim().ToLower()
  return ($norm -eq 'true' -or $norm -eq 'yes' -or $norm -eq 'y')
}

Write-Host "Enter article fields one by one. Press Enter to leave optional fields blank." -ForegroundColor Cyan

$title     = Read-Host "1/9 Title"
$author    = Read-Host "2/9 Author"
$position  = Read-Host "3/9 Position (optional)"
$date      = Read-Host "4/9 Date (YYYY-MM-DD)"
$category  = Read-Host "5/9 Category"
$excerpt   = Read-Host "6/9 Excerpt (optional)"
$imageFile = Read-Host "7/9 Image filename in article_images (optional)"

Write-Host "8/9 Body: paste HTML or markdown. End with a single line containing EOF." -ForegroundColor Cyan
$bodyLines = @()
while ($true) {
  $line = Read-Host
  if ($line -eq 'EOF') { break }
  $bodyLines += $line
}
$body = ($bodyLines -join "`n").Trim()

$specialBool = Read-YesNo "9/9 Special report? (y/n)"
$editorsBool = Read-YesNo "Editor's pick? (y/n)"

if (-not $title)    { Write-Error "Title is required." }
if (-not $author)   { Write-Error "Author is required." }
if (-not $date)     { Write-Error "Date is required." }
if (-not $category) { Write-Error "Category is required." }

$imagePath = ''
if ($imageFile) {
  $imagePath = "article_images/$($imageFile.Trim())"
}

function New-Slug($text, $existing) {
  $s = ([string]$text).ToLower()
  $s = $s -replace "['`u{2018}`u{2019}`"]", ''   # drop apostrophes / smart quotes
  $s = $s -replace '[^a-z0-9]+', '-'             # any other run -> single hyphen
  $s = $s.Trim('-')
  if (-not $s) { $s = 'article' }
  $base = $s; $n = 2
  while ($existing -contains $s) { $s = "$base-$n"; $n++ }
  return $s
}

$jsonRaw  = Get-Content -Path $articlesPath -Raw
$articles = $jsonRaw | ConvertFrom-Json
if (-not ($articles -is [System.Collections.IEnumerable])) {
  Write-Error "articles.json must contain an array."
}

$existingSlugs = @($articles | ForEach-Object { $_.slug })
$slug = New-Slug $title $existingSlugs

$article = [ordered]@{
  title          = $title.Trim()
  slug           = $slug
  author         = $author.Trim()
  position       = $position
  date           = $date.Trim()
  category       = $category.Trim()
  excerpt        = $excerpt
  image          = $imagePath
  body           = $body
  special_report = $specialBool
  editors_pick   = $editorsBool
}

$articles += $article
$articles | ConvertTo-Json -Depth 20 | Set-Content -Path $articlesPath -Encoding utf8

Write-Host "Added article: $($article.title)" -ForegroundColor Green

$shouldPush = Read-YesNo "Should I push and deploy? (y/n)"
if ($shouldPush) {
  git add $articlesPath

  if ($imagePath) {
    $imageFullPath = Join-Path $root $imagePath
    if (Test-Path $imageFullPath) {
      git add $imageFullPath
    }
  }

  git commit -m "Add article: $($article.title)"
  git push
}
