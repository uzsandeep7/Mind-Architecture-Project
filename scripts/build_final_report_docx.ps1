param(
  [Parameter(Mandatory = $true)]
  [string]$ContentPath,
  [Parameter(Mandatory = $true)]
  [string]$OutputPath
)

$ErrorActionPreference = "Stop"

function Release-ComObject {
  param([Parameter(ValueFromPipeline = $true)]$ComObject)
  process {
    if ($null -ne $ComObject) {
      [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($ComObject)
    }
  }
}

function Add-Paragraph {
  param(
    $Document,
    [string]$Text,
    [string]$StyleName = "Normal",
    [switch]$Center,
    [switch]$Italic,
    [switch]$Bullet
  )

  $paragraph = $Document.Paragraphs.Add()
  $paragraph.Range.Text = $Text
  $paragraph.Range.Style = $StyleName
  if ($Center) { $paragraph.Alignment = 1 }
  if ($Italic) { $paragraph.Range.Italic = 1 }
  if ($Bullet) { $paragraph.Range.ListFormat.ApplyBulletDefault() | Out-Null }
  $paragraph.Range.InsertParagraphAfter() | Out-Null
  Release-ComObject $paragraph
}

function Add-PageBreak {
  param($Document)
  $range = $Document.Range()
  $range.Collapse(0)
  $range.InsertBreak(7) | Out-Null
  Release-ComObject $range
}

$content = Get-Content $ContentPath

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
  $document = $word.Documents.Add()

  $selection = $word.Selection
  $selection.Font.Name = "Calibri"
  $selection.Font.Size = 11
  Release-ComObject $selection

  $firstHeadingSeen = $false
  $coverCompleted = $false

  $lineNumber = 0
  foreach ($line in $content) {
    $lineNumber++
    $trimmed = $line.TrimEnd()
    $plain = $trimmed -replace '\*\*', ''

    try {
      if ([string]::IsNullOrWhiteSpace($trimmed)) {
        continue
      }

      if ($trimmed -eq "[Insert automatic table of contents in Word]") {
        $range = $document.Range()
        $range.Collapse(0)
        $document.TablesOfContents.Add($range, $true, 1, 3) | Out-Null
        $range.InsertParagraphAfter() | Out-Null
        Release-ComObject $range
        continue
      }

      if ($trimmed.StartsWith("# ")) {
        $headingText = $trimmed.Substring(2)

        if (-not $firstHeadingSeen) {
          Add-Paragraph -Document $document -Text $headingText -StyleName "Title" -Center
          $firstHeadingSeen = $true
          continue
        }

        if (-not $coverCompleted -and $headingText -eq "Executive Summary") {
          Add-PageBreak -Document $document
          $coverCompleted = $true
        } elseif ($headingText -like "Chapter *" -or $headingText -eq "References" -or $headingText -eq "Appendices") {
          Add-PageBreak -Document $document
        }

        Add-Paragraph -Document $document -Text $headingText -StyleName "Heading 1"
        continue
      }

      if ($trimmed.StartsWith("## ")) {
        Add-Paragraph -Document $document -Text $trimmed.Substring(3) -StyleName "Heading 2"
        continue
      }

      if ($trimmed.StartsWith("### ")) {
        Add-Paragraph -Document $document -Text $trimmed.Substring(4) -StyleName "Heading 3"
        continue
      }

      if ($trimmed.StartsWith("- ")) {
        Add-Paragraph -Document $document -Text $trimmed.Substring(2) -StyleName "Normal" -Bullet
        continue
      }

      if ($trimmed.StartsWith("[Insert ")) {
        Add-Paragraph -Document $document -Text $plain -StyleName "Normal" -Italic
        continue
      }

      if ($plain.StartsWith("Prepared by:") -or $plain.StartsWith("Client:") -or $plain.StartsWith("Submission:") -or $plain.StartsWith("Note:")) {
        Add-Paragraph -Document $document -Text $plain -StyleName "Normal" -Center
        continue
      }

      Add-Paragraph -Document $document -Text $plain -StyleName "Normal"
    }
    catch {
      throw "Line $lineNumber failed: $trimmed -- $($_.Exception.Message)"
    }
  }

  foreach ($section in $document.Sections) {
    $footer = $section.Footers.Item(1)
    $footer.PageNumbers.Add(1) | Out-Null
    Release-ComObject $footer
    Release-ComObject $section
  }

  foreach ($toc in $document.TablesOfContents) {
    $toc.Update() | Out-Null
    Release-ComObject $toc
  }

  $fullOutputPath = [System.IO.Path]::GetFullPath($OutputPath)
  $directory = Split-Path $fullOutputPath -Parent
  if (-not (Test-Path $directory)) {
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
  }

  $document.SaveAs([ref]$fullOutputPath, [ref]16)
  $document.Close()
  Release-ComObject $document
}
finally {
  $word.Quit()
  Release-ComObject $word
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
