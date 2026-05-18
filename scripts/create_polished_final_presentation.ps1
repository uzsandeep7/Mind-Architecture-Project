$ErrorActionPreference = "Stop"

$template = "C:\Users\uzsan\Downloads\Final Presentation Template_updated (2).pptx"
$workspaceOut = "C:\Users\uzsan\OneDrive\Documents\GitHub\innergrowth-forge\outputs"
$downloadsOut = "C:\Users\uzsan\Downloads"
$workDir = Join-Path $workspaceOut "final-presentation-polished-work"
$tempZip = Join-Path $workspaceOut "final-presentation-polished-template.zip"
$zipOut = Join-Path $workspaceOut "MIND_Architecture_Final_Presentation_Polished.zip"
$pptxWorkspace = Join-Path $workspaceOut "MIND_Architecture_Final_Presentation_Polished.pptx"
$pptxDownloads = Join-Path $downloadsOut "MIND_Architecture_Final_Presentation_Polished.pptx"

if (Test-Path $workDir) { Remove-Item -Recurse -Force $workDir }
if (Test-Path $tempZip) { Remove-Item -Force $tempZip }
if (Test-Path $zipOut) { Remove-Item -Force $zipOut }
if (Test-Path $pptxWorkspace) { Remove-Item -Force $pptxWorkspace }
if (Test-Path $pptxDownloads) { Remove-Item -Force $pptxDownloads }

Copy-Item -LiteralPath $template -Destination $tempZip
New-Item -ItemType Directory -Force -Path $workDir | Out-Null
Expand-Archive -LiteralPath $tempZip -DestinationPath $workDir -Force

function Convert-Inch {
  param([double]$Value)
  return [int]($Value * 914400)
}

function Escape-Xml {
  param([string]$Text)
  return [System.Security.SecurityElement]::Escape($Text)
}

function Add-TextShapeXml {
  param(
    [int]$Id,
    [string]$Name,
    [double]$X,
    [double]$Y,
    [double]$W,
    [double]$H,
    [string[]]$Lines,
    [int]$FontSize = 2100,
    [string]$Color = "F7F4EA",
    [string]$Typeface = "Aptos",
    [bool]$Bold = $false,
    [bool]$IsTitle = $false
  )

  $xEmu = Convert-Inch $X
  $yEmu = Convert-Inch $Y
  $wEmu = Convert-Inch $W
  $hEmu = Convert-Inch $H
  $boldAttr = if ($Bold) { ' b="1"' } else { "" }
  $paragraphs = New-Object System.Collections.Generic.List[string]

  foreach ($line in $Lines) {
    $escaped = Escape-Xml $line
    $paragraphs.Add(@"
<a:p>
  <a:pPr marL="0" indent="0"/>
  <a:r>
    <a:rPr lang="en-US" sz="$FontSize"$boldAttr dirty="0">
      <a:solidFill><a:srgbClr val="$Color"/></a:solidFill>
      <a:latin typeface="$Typeface"/>
    </a:rPr>
    <a:t>$escaped</a:t>
  </a:r>
  <a:endParaRPr lang="en-US" sz="$FontSize" dirty="0"/>
</a:p>
"@)
  }

  $paras = $paragraphs -join "`n"
  $autoFit = if ($IsTitle) { "<a:normAutofit/>" } else { "<a:spAutoFit/>" }

  return @"
<p:sp>
  <p:nvSpPr>
    <p:cNvPr id="$Id" name="$Name"/>
    <p:cNvSpPr txBox="1"/>
    <p:nvPr/>
  </p:nvSpPr>
  <p:spPr>
    <a:xfrm>
      <a:off x="$xEmu" y="$yEmu"/>
      <a:ext cx="$wEmu" cy="$hEmu"/>
    </a:xfrm>
    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
    <a:noFill/>
    <a:ln><a:noFill/></a:ln>
  </p:spPr>
  <p:txBody>
    <a:bodyPr wrap="square" rtlCol="0" anchor="t">$autoFit</a:bodyPr>
    <a:lstStyle/>
    $paras
  </p:txBody>
</p:sp>
"@
}

function Add-RectXml {
  param(
    [int]$Id,
    [string]$Name,
    [double]$X,
    [double]$Y,
    [double]$W,
    [double]$H,
    [string]$Fill = "1A1A1A",
    [string]$Line = "333333"
  )

  $xEmu = Convert-Inch $X
  $yEmu = Convert-Inch $Y
  $wEmu = Convert-Inch $W
  $hEmu = Convert-Inch $H

  return @"
<p:sp>
  <p:nvSpPr>
    <p:cNvPr id="$Id" name="$Name"/>
    <p:cNvSpPr/>
    <p:nvPr/>
  </p:nvSpPr>
  <p:spPr>
    <a:xfrm>
      <a:off x="$xEmu" y="$yEmu"/>
      <a:ext cx="$wEmu" cy="$hEmu"/>
    </a:xfrm>
    <a:prstGeom prst="roundRect"><a:avLst/></a:prstGeom>
    <a:solidFill><a:srgbClr val="$Fill"/></a:solidFill>
    <a:ln w="12700"><a:solidFill><a:srgbClr val="$Line"/></a:solidFill></a:ln>
  </p:spPr>
</p:sp>
"@
}

function Build-SlideXml {
  param(
    [int]$SlideNo,
    [string]$Section,
    [string]$Title,
    [string]$Subtitle,
    [string[]]$Bullets,
    [string]$Callout = ""
  )

  $shapes = New-Object System.Collections.Generic.List[string]
  $id = 10

  $shapes.Add((Add-RectXml -Id ($id++) -Name "Background" -X 0 -Y 0 -W 13.333 -H 7.5 -Fill "111111" -Line "111111"))
  $shapes.Add((Add-RectXml -Id ($id++) -Name "Top Gold Bar" -X 0 -Y 0 -W 13.333 -H 0.11 -Fill "FFC300" -Line "FFC300"))
  $shapes.Add((Add-RectXml -Id ($id++) -Name "Title Card" -X 0.48 -Y 0.42 -W 12.35 -H 1.28 -Fill "1D1D1D" -Line "393939"))
  $shapes.Add((Add-TextShapeXml -Id ($id++) -Name "Section" -X 0.72 -Y 0.56 -W 4.0 -H 0.26 -Lines @($Section.ToUpper()) -FontSize 1150 -Color "FFC300" -Typeface "Aptos" -Bold $true))
  $shapes.Add((Add-TextShapeXml -Id ($id++) -Name "Title" -X 0.72 -Y 0.82 -W 11.3 -H 0.55 -Lines @($Title) -FontSize 2850 -Color "FFFFFF" -Typeface "Georgia" -Bold $true -IsTitle $true))
  if ($Subtitle -ne "") {
    $shapes.Add((Add-TextShapeXml -Id ($id++) -Name "Subtitle" -X 0.74 -Y 1.34 -W 11.1 -H 0.28 -Lines @($Subtitle) -FontSize 1250 -Color "C8C8C8" -Typeface "Aptos"))
  }

  $bodyLines = @()
  foreach ($bullet in $Bullets) {
    $bodyLines += "- $bullet"
  }

  $shapes.Add((Add-RectXml -Id ($id++) -Name "Body Card" -X 0.72 -Y 2.02 -W 8.45 -H 4.55 -Fill "1B1B1B" -Line "333333"))
  $shapes.Add((Add-TextShapeXml -Id ($id++) -Name "Body" -X 1.02 -Y 2.32 -W 7.85 -H 3.98 -Lines $bodyLines -FontSize 1750 -Color "F4F4F4" -Typeface "Aptos"))

  $shapes.Add((Add-RectXml -Id ($id++) -Name "Side Accent" -X 9.55 -Y 2.02 -W 2.95 -H 4.55 -Fill "231F12" -Line "6C5500"))
  $calloutLines = if ($Callout -ne "") { $Callout -split "`n" } else { @("PLACEHOLDER", "Add screenshot, diagram, or demo link here.") }
  $shapes.Add((Add-TextShapeXml -Id ($id++) -Name "Callout" -X 9.88 -Y 2.38 -W 2.35 -H 3.75 -Lines $calloutLines -FontSize 1550 -Color "FFE08A" -Typeface "Aptos" -Bold $true))
  $shapes.Add((Add-TextShapeXml -Id ($id++) -Name "Footer" -X 0.72 -Y 7.02 -W 8.0 -H 0.2 -Lines @("MIND Architecture Web Application | ICT302 Final Presentation") -FontSize 850 -Color "8F8F8F" -Typeface "Aptos"))
  $shapes.Add((Add-TextShapeXml -Id ($id++) -Name "Page" -X 11.96 -Y 6.92 -W 0.6 -H 0.25 -Lines @("$SlideNo") -FontSize 1200 -Color "FFC300" -Typeface "Aptos" -Bold $true))

  $shapeXml = $shapes -join "`n"
  return @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      $shapeXml
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>
"@
}

$slides = @(
  @{
    Section = "Final Presentation"
    Title = "MIND Architecture Web Application"
    Subtitle = "A full-stack client website with user features, admin management, test-mode payments, and handover documentation."
    Bullets = @(
      "Client: MIND Architecture",
      "Full-stack website and admin system",
      "Final demo, testing evidence, and handover status"
    )
    Callout = "DEMO LINK`nPaste final recorded walkthrough link before submission."
  },
  @{
    Section = "Agenda"
    Title = "Presentation Roadmap"
    Subtitle = "A concise structure aligned with the Week 12 presentation and demonstration marking criteria."
    Bullets = @(
      "Project overview",
      "Key requirements",
      "Implementation summary",
      "Testing and evaluation",
      "Demo walkthrough",
      "Handover and Q and A"
    )
    Callout = "20 MIN PLAN`nPresentation first, then recorded/systematic product demo."
  },
  @{
    Section = "Problem"
    Title = "Client Need and Project Goal"
    Subtitle = "The client needed a professional and maintainable digital platform, not only a brochure website."
    Bullets = @(
      "One platform for services, books, events, and consultations",
      "User journey from browsing to booking/order",
      "Admin dashboard for client management",
      "Handover-ready code and documentation"
    )
    Callout = "PLACEHOLDER`nInsert client logo or homepage screenshot."
  },
  @{
    Section = "Users"
    Title = "Target Audience and Requirements"
    Subtitle = "The system supports different users with different access levels."
    Bullets = @(
      "Visitors browse public pages",
      "Users book events and consultations",
      "Customers buy books through Stripe test checkout",
      "Premium members access member benefits",
      "Admin manages content, orders, users, and messages"
    )
    Callout = "FR COVERAGE`nAuthentication, dashboard, commerce, booking, content, and admin management."
  },
  @{
    Section = "Implementation"
    Title = "Technology Stack and Architecture"
    Subtitle = "Modern frontend, Supabase backend services, and Stripe test integration."
    Bullets = @(
      "React + TypeScript frontend",
      "Tailwind responsive UI",
      "Supabase auth and database",
      "Stripe Checkout in test mode",
      "Vercel-ready deployment"
    )
    Callout = "ARCHITECTURE`nReact + Supabase + Stripe + Vercel-ready deployment."
  },
  @{
    Section = "Features"
    Title = "Implemented Website Features"
    Subtitle = "The build covers both customer-facing and admin-facing workflows."
    Bullets = @(
      "Public website pages",
      "Login and user dashboard",
      "Books, cart, and checkout",
      "Events and consultation requests",
      "Admin dashboard and message handling"
    )
    Callout = "DEMO FLOW`nVisitor -> user -> premium/order -> admin follow-up."
  },
  @{
    Section = "Testing"
    Title = "Testing and Evaluation"
    Subtitle = "Testing evidence was prepared to support the final report and presentation."
    Bullets = @(
      "Around 60 test cases prepared",
      "Requirements mapped to test cases",
      "Role-based walkthrough testing",
      "Responsive and checkout checks",
      "Core workflows passed in test mode"
    )
    Callout = "PLACEHOLDER`nInsert test case or traceability matrix screenshot."
  },
  @{
    Section = "Client Status"
    Title = "Feedback, Handover, and Live Status"
    Subtitle = "The website is ready for handover, while live launch depends on client-owned accounts."
    Bullets = @(
      "Client feedback pending final meeting",
      "Website is handover-ready",
      "Hosting and Stripe live setup pending",
      "Code, manual, tests, and report will be handed over"
    )
    Callout = "NOT LIVE YET`nReady for handover now; deploy later when client accounts are ready."
  },
  @{
    Section = "Demonstration"
    Title = "Product Demonstration Walkthrough"
    Subtitle = "The demo is planned to avoid repeated logins and show connected workflows clearly."
    Bullets = @(
      "Anonymous visitor browsing",
      "User login and dashboard",
      "Book purchase with Stripe test checkout",
      "Event and consultation flow",
      "Admin order, booking, and message management"
    )
    Callout = "RECORDING LINK`nPaste final edited demo video link here."
  },
  @{
    Section = "Team"
    Title = "Group Roles and Contribution"
    Subtitle = "Each member contributed to delivery, documentation, testing, or validation."
    Bullets = @(
      "Sandeep: development and integration",
      "Ahmed: user manual and documentation",
      "Dipesh: report and activity log support",
      "Rabin: testing and evaluation",
      "Harshit: test cases and demo validation"
    )
    Callout = "TEAM EVIDENCE`nActivity log, report sections, test files, and demo roles."
  },
  @{
    Section = "Conclusion"
    Title = "Conclusion and Recommendations"
    Subtitle = "The project has reached a functional handover-ready stage."
    Bullets = @(
      "Functional website completed",
      "Admin and user workflows tested",
      "Stripe ready in test mode",
      "Handover now, live launch later",
      "Next: feedback, recording, and submission"
    )
    Callout = "Q AND A`nThank you."
  }
)

for ($i = 0; $i -lt $slides.Count; $i++) {
  $slideNo = $i + 1
  $slideXml = Build-SlideXml -SlideNo $slideNo -Section $slides[$i].Section -Title $slides[$i].Title -Subtitle $slides[$i].Subtitle -Bullets $slides[$i].Bullets -Callout $slides[$i].Callout
  $path = Join-Path $workDir "ppt\slides\slide$slideNo.xml"
  Set-Content -Path $path -Value $slideXml -Encoding UTF8
}

Push-Location $workDir
Compress-Archive -Path * -DestinationPath $zipOut -Force
Pop-Location
Rename-Item -LiteralPath $zipOut -NewName "MIND_Architecture_Final_Presentation_Polished.pptx"
Copy-Item -LiteralPath $pptxWorkspace -Destination $pptxDownloads -Force

Write-Output $pptxDownloads
