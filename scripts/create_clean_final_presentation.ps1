$ErrorActionPreference = "Stop"

$outDir = "C:\Users\uzsan\OneDrive\Documents\GitHub\innergrowth-forge\outputs"
$pptxOut = Join-Path $outDir "MIND_Architecture_Final_Presentation_Clean.pptx"
$pdfOut = Join-Path $outDir "MIND_Architecture_Final_Presentation_Clean.pdf"

if (Test-Path $pptxOut) { Remove-Item -Force $pptxOut }
if (Test-Path $pdfOut) { Remove-Item -Force $pdfOut }

$ppLayoutBlank = 12
$ppSaveAsOpenXMLPresentation = 24
$ppSaveAsPDF = 32
$msoFalse = 0
$msoTrue = -1

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = $msoTrue
$presentation = $ppt.Presentations.Add($msoTrue)
$presentation.PageSetup.SlideSize = 16

function Add-ShapeText {
  param(
    [object]$Slide,
    [float]$Left,
    [float]$Top,
    [float]$Width,
    [float]$Height,
    [string]$Text,
    [int]$FontSize = 24,
    [string]$ColorHex = "FFFFFF",
    [switch]$Bold
  )

  $shape = $Slide.Shapes.AddTextbox(1, $Left, $Top, $Width, $Height)
  $shape.TextFrame.TextRange.Text = $Text
  $shape.TextFrame.WordWrap = $msoTrue
  $shape.TextFrame.TextRange.Font.Name = "Aptos"
  $shape.TextFrame.TextRange.Font.Size = $FontSize
  $shape.TextFrame.TextRange.Font.Bold = $(if ($Bold) { $msoTrue } else { $msoFalse })
  $r = [Convert]::ToInt32($ColorHex.Substring(0, 2), 16)
  $g = [Convert]::ToInt32($ColorHex.Substring(2, 2), 16)
  $b = [Convert]::ToInt32($ColorHex.Substring(4, 2), 16)
  $shape.TextFrame.TextRange.Font.Color.RGB = ($r + ($g * 256) + ($b * 65536))
  return $shape
}

function Add-DeckSlide {
  param(
    [string]$Title,
    [string[]]$Bullets,
    [string]$Footer = "MIND Architecture Web Application - Final Presentation"
  )

  $slide = $presentation.Slides.Add($presentation.Slides.Count + 1, $ppLayoutBlank)
  $bg = $slide.Shapes.AddShape(1, 0, 0, 960, 540)
  $bg.Fill.ForeColor.RGB = 1315860
  $bg.Line.Visible = $msoFalse

  $accent = $slide.Shapes.AddShape(1, 0, 0, 960, 12)
  $accent.Fill.ForeColor.RGB = 52991
  $accent.Line.Visible = $msoFalse

  Add-ShapeText -Slide $slide -Left 42 -Top 34 -Width 760 -Height 56 -Text $Title -FontSize 32 -ColorHex "FFFFFF" -Bold | Out-Null

  $body = ($Bullets | ForEach-Object { "- $_" }) -join "`r`n"
  Add-ShapeText -Slide $slide -Left 58 -Top 118 -Width 835 -Height 330 -Text $body -FontSize 21 -ColorHex "F2F2F2" | Out-Null

  Add-ShapeText -Slide $slide -Left 58 -Top 486 -Width 620 -Height 22 -Text $Footer -FontSize 10 -ColorHex "B8B8B8" | Out-Null
  Add-ShapeText -Slide $slide -Left 814 -Top 472 -Width 92 -Height 30 -Text ("{0}" -f $presentation.Slides.Count) -FontSize 18 -ColorHex "FFC300" -Bold | Out-Null
}

Add-DeckSlide "MIND Architecture Web Application" @(
  "Final Presentation and Product Demonstration",
  "Client: MIND Architecture",
  "Team: Sandeep Pun, Ahmed Malik, Dipesh Shahi, Rabin Shrestha, Harshit Shrestha",
  "Demo link placeholder will be added before submission"
)

Add-DeckSlide "Presentation Topics" @(
  "Project overview and client problem",
  "Target users and functional requirements",
  "Implementation summary and technology stack",
  "Testing, evaluation, and results",
  "Client feedback and handover status",
  "Product demonstration walkthrough",
  "Group roles, contributions, and Q and A"
)

Add-DeckSlide "Project Overview" @(
  "The client needed one professional website for services, resources, events, consultations, books, membership, and admin control.",
  "The solution provides public pages, authenticated user features, admin dashboard features, and test-mode payment flow.",
  "Main users are anonymous visitors, registered users, premium members, admin users, and the owner.",
  "PLACEHOLDER: Insert system/use case diagram or key website screenshot."
)

Add-DeckSlide "Implementation Summary" @(
  "Frontend built with React, TypeScript, Vite, Tailwind CSS, and reusable components.",
  "Backend uses Supabase for authentication, database tables, storage-ready backend services, and edge functions.",
  "Stripe Checkout is integrated in test mode for books and membership upgrade flow.",
  "Admin dashboard manages events, books, orders, blog, users, consultations, and messages.",
  "Deployment is Vercel-ready, but live launch depends on client-owned accounts and Stripe live setup."
)

Add-DeckSlide "Testing and Evaluation" @(
  "Around 60 test cases were prepared for login, signup, dashboard, books, checkout, events, membership, consultations, messages, and admin features.",
  "Traceability matrix links requirement IDs to related test cases and pass/fail status.",
  "Evaluation included role-based walkthroughs, responsive checks, checkout tests, and admin/user workflow validation.",
  "Core workflows passed in the development and Stripe test environment.",
  "PLACEHOLDER: Insert test case or traceability matrix screenshot."
)

Add-DeckSlide "Client Feedback and Handover" @(
  "Client feedback will be added after the Tuesday meeting and final review.",
  "Current position: client likes the product but needs clarity on hosting, Supabase ownership, Stripe, and future maintenance.",
  "The team will hand over code, design, backend setup details, user manual, test cases, final report, and demo recording.",
  "Live deployment is pending client readiness, domain/hosting decision, and Stripe live account setup."
)

Add-DeckSlide "Product Demonstration Plan" @(
  "Anonymous visitor browses Home, About, Programs, Resources, Gallery, Testimonials, Insights, Membership, and Contact.",
  "User signs in, views dashboard, books events, requests consultations, and checks status.",
  "User adds a book to cart and completes Stripe test checkout.",
  "Admin views order, updates status/tracking, manages messages, confirms consultations, and checks booked users.",
  "Premium member flow shows upgraded membership and member pricing."
)

Add-DeckSlide "Retrospective" @(
  "What went well: the team delivered a working full-stack website with real client-focused features.",
  "Lesson learnt: technical completion and client handover planning are both important.",
  "What could improve: hosting, Stripe ownership, and backend transfer decisions should be finalised earlier.",
  "Next step: collect feedback, complete final recording, submit documentation, and hand over the project package."
)

Add-DeckSlide "Group Members and Roles" @(
  "Sandeep Pun: lead developer, integration, dashboards, Stripe test flow, feature fixes, and final technical coordination.",
  "Ahmed Malik: documentation support, user manual, and report evidence support.",
  "Dipesh Shahi: report writing support, conclusion/recommendations, formatting, and activity log support.",
  "Rabin Shrestha: testing and evaluation support, feature validation, and usability observations.",
  "Harshit Shrestha: test case support, validation, and demo preparation support."
)

Add-DeckSlide "Member Contribution" @(
  "Sandeep guided development and final integration, including implementation and demo readiness.",
  "Ahmed and Dipesh supported documentation, report writing, user manual preparation, and evidence organisation.",
  "Rabin and Harshit supported testing, validation of workflows, and demonstration preparation.",
  "PLACEHOLDER: Add contribution percentages or individual speaking responsibilities if required."
)

Add-DeckSlide "Recording Link and Q and A" @(
  "Complete project demonstration recording: PLACEHOLDER - paste Google Drive, OneDrive, or Moodle-accessible link.",
  "Suggested folder contents: final edited demo video, short raw clips, final report, user manual, testing files, and handover notes.",
  "End of presentation.",
  "Questions and Answers."
)

$presentation.SaveAs($pptxOut, $ppSaveAsOpenXMLPresentation)
$presentation.SaveAs($pdfOut, $ppSaveAsPDF)
$presentation.Close()
$ppt.Quit()

[System.Runtime.InteropServices.Marshal]::ReleaseComObject($presentation) | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null

Write-Output $pptxOut
Write-Output $pdfOut
