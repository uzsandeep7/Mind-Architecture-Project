$ErrorActionPreference = "Stop"

$template = "C:\Users\uzsan\Downloads\Final Presentation Template_updated (2).pptx"
$outRoot = "C:\Users\uzsan\OneDrive\Documents\GitHub\innergrowth-forge\outputs"
$outDir = Join-Path $outRoot "final-presentation-openable-work"
$zipOut = Join-Path $outRoot "MIND_Architecture_Final_Presentation_Openable.zip"
$pptxOut = Join-Path $outRoot "MIND_Architecture_Final_Presentation_Openable.pptx"
$tempZip = Join-Path $outRoot "final-presentation-openable-template.zip"

if (Test-Path $outDir) { Remove-Item -Recurse -Force $outDir }
if (Test-Path $zipOut) { Remove-Item -Force $zipOut }
if (Test-Path $pptxOut) { Remove-Item -Force $pptxOut }
if (Test-Path $tempZip) { Remove-Item -Force $tempZip }

Copy-Item -LiteralPath $template -Destination $tempZip
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
Expand-Archive -LiteralPath $tempZip -DestinationPath $outDir -Force

function Set-SlideText {
  param(
    [int]$SlideNo,
    [string[]]$Texts
  )

  $path = Join-Path $outDir "ppt\slides\slide$SlideNo.xml"
  [xml]$xml = Get-Content $path -Raw
  $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
  $ns.AddNamespace("a", "http://schemas.openxmlformats.org/drawingml/2006/main")
  $nodes = @($xml.SelectNodes("//a:t", $ns))

  for ($i = 0; $i -lt $nodes.Count; $i++) {
    if ($i -lt $Texts.Count) {
      $nodes[$i].InnerText = $Texts[$i]
    } else {
      $nodes[$i].InnerText = ""
    }
  }

  $settings = New-Object System.Xml.XmlWriterSettings
  $settings.Encoding = New-Object System.Text.UTF8Encoding($false)
  $settings.Indent = $false
  $writer = [System.Xml.XmlWriter]::Create($path, $settings)
  $xml.Save($writer)
  $writer.Close()
}

Set-SlideText 1 @(
  "MIND Architecture Web Application",
  "Final Presentation and Product Demonstration",
  "Team Members",
  "Sandeep Pun",
  "Lead Developer / Integration",
  "Ahmed Malik",
  "Documentation Support",
  "Dipesh Shahi",
  "Report Support",
  "Rabin Shrestha",
  "Testing and Evaluation",
  "Harshit Shrestha",
  "Testing and Validation",
  "ICT302 Final Presentation",
  ""
)

Set-SlideText 2 @(
  "Presentation Topics",
  "Project overview and client problem",
  "Target users and functional requirements",
  "Implementation summary and technology stack",
  "Testing, evaluation, and results",
  "Client feedback and handover status",
  "Product demonstration walkthrough",
  "Group roles and contribution",
  "Recording link and Q and A",
  "",
  ""
)

Set-SlideText 3 @(
  "Project Overview",
  "Client Problem",
  "MIND Architecture needed one professional digital platform for services, events, consultations, resources, books, membership, and admin management.",
  "Target Users",
  "Anonymous visitors, registered users, premium members, admin users, and the owner.",
  "Core Requirements",
  "Browse content, sign up/login, buy books, book programs/events, request consultations, send messages, manage membership, and admin control.",
  "Technology Stack",
  "React, TypeScript, Vite, Tailwind CSS, Supabase, Stripe test mode, and Vercel-ready deployment.",
  "Placeholder",
  "Insert use case diagram or system screenshot here.",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
)

Set-SlideText 4 @(
  "Testing and Evaluation`n`n- Around 60 test cases were prepared across authentication, dashboards, books, checkout, events, membership, consultations, contact messages, and admin features.`n`n- Traceability matrix links requirement IDs to test case IDs and pass/fail status.`n`n- Core workflows passed in development and Stripe test mode.`n`nPLACEHOLDER: Insert test case or traceability matrix screenshot."
)

Set-SlideText 5 @(
  "Client Feedback",
  "PLACEHOLDER: Insert client feedback screenshot or meeting note summary.`n`nCurrent status: the client likes the product and wants to use it, but needs clarity on hosting, Supabase ownership, Stripe, and future maintenance.`n`nThe team will hand over code, design, backend setup details, user manual, testing files, final report, and demo recording.`n`nLive launch is pending client readiness and Stripe live account setup."
)

Set-SlideText 6 @(
  "Retrospective",
  "Lesson Learnt:",
  "A real client project needs technical delivery and clear handover communication. Hosting, payments, ownership, and maintenance should be explained simply.",
  "What went well?",
  "The team delivered a working website with public pages, user dashboard, admin dashboard, books, events, consultation flow, membership, messages, and documentation.",
  "What could be improved?",
  "Hosting, Stripe ownership, and backend transfer decisions could have been finalised earlier.",
  "What can we do?",
  "Collect final feedback, complete demo recording, submit documentation, and hand over the full project package."
)

Set-SlideText 7 @(
  "Product Demonstration",
  "Demo Walkthrough",
  "1. Anonymous visitor browses public pages, programs, resources, membership, and contact.",
  "2. Registered user logs in, views dashboard, books events, and requests consultations.",
  "3. User adds book to cart and completes Stripe test checkout.",
  "4. Admin views order, updates status/tracking, confirms consultation, views booked users, and replies to messages.",
  "5. Premium user flow shows membership status and member pricing.",
  "DEMO VIDEO LINK PLACEHOLDER: paste final recording link here.",
  "",
  ""
)

Set-SlideText 8 @(
  "Conclusion`n`n- The MIND Architecture website is complete to handover-ready stage with frontend, backend integration, dashboards, documentation, and testing artifacts.`n`n- The system supports public browsing, user accounts, books/orders, events, consultations, membership, messages, and admin management.`n`n- Stripe is integrated in test mode. Live deployment can be completed later with client-owned domain, hosting, Supabase, and Stripe live setup.`n`nRecommendation: hand over the full project now and launch later when the client is ready."
)

Set-SlideText 9 @(
  "Group Members / Roles`n`nSandeep Pun - Lead developer, integration, feature refinement, dashboards, Stripe test flow, and final technical coordination.`n`nAhmed Malik - Documentation support, user manual, and project evidence support.`n`nDipesh Shahi - Report writing support, conclusion/recommendations, formatting, and activity log support.`n`nRabin Shrestha - Testing and evaluation support, feature validation, and usability observations.`n`nHarshit Shrestha - Test case support, validation, and demo preparation support."
)

Set-SlideText 10 @(
  "Member Contribution`n`n- Sandeep guided development and final integration, including implementation and demo readiness.`n`n- Ahmed and Dipesh supported documentation, report writing, user manual preparation, and evidence organisation.`n`n- Rabin and Harshit supported testing, workflow validation, and demonstration preparation.`n`nPLACEHOLDER: Add contribution percentages or individual speaking responsibilities if required."
)

Set-SlideText 11 @(
  "Recording Link",
  "Complete Project Demonstration Recording",
  "PLACEHOLDER: Paste Google Drive / OneDrive / Moodle-accessible demo recording link here.`n`nSuggested folder contents: final demo video, short walkthrough clips, final report, user manual, testing files, and handover notes.`n`nQ and A"
)

Push-Location $outDir
Compress-Archive -Path * -DestinationPath $zipOut -Force
Pop-Location
Rename-Item -LiteralPath $zipOut -NewName "MIND_Architecture_Final_Presentation_Openable.pptx"

Write-Output $pptxOut
