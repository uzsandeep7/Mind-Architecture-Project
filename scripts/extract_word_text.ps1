param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,
  [Parameter(Mandatory = $true)]
  [string]$OutputPath
)

$ErrorActionPreference = "Stop"

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
  $document = $word.Documents.Open($InputPath, $false, $true)
  $text = $document.Content.Text
  Set-Content -Path $OutputPath -Value $text -Encoding UTF8
  $document.Close()
}
finally {
  if ($document) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($document) }
  $word.Quit()
  [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word)
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
