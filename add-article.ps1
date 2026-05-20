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

$title = Read-Host "1/9 Title"
$author = Read-Host "2/9 Author"
$position = Read-Host "3/9 Position (optional)"
$date = Read-Host "4/9 Date (YYYY-MM-DD)"
$category = Read-Host "5/9 Category"
$excerpt = Read-Host "6/9 Excerpt (optional)"
$image = Read-Host "7/9 Image URL (optional)"

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

if (-not $title) { Write-Error "Title is required." }
if (-not $author) { Write-Error "Author is required." }
if (-not $date) { Write-Error "Date is required." }
if (-not $category) { Write-Error "Category is required." }

$article = [ordered]@{
  title = $title.Trim()
  author = $author.Trim()
  position = $position
  date = $date.Trim()
  category = $category.Trim()
  excerpt = $excerpt
  image = $image
  body = $body
  special_report = $specialBool
  editors_pick = $editorsBool
}

$jsonRaw = Get-Content -Path $articlesPath -Raw
$articles = $jsonRaw | ConvertFrom-Json
if (-not ($articles -is [System.Collections.IEnumerable])) {
  Write-Error "articles.json must contain an array."
}

$articles += $article
$articles | ConvertTo-Json -Depth 20 | Set-Content -Path $articlesPath -Encoding utf8

Write-Host "Added article: $($article.title)" -ForegroundColor Green

if ($Commit) {
  git add $articlesPath
  git commit -m "Add article: $($article.title)"
  if ($Push) {
    git push
  }
}
