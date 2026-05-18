$ErrorActionPreference = "Stop"

$template = "C:\Users\uzsan\Downloads\Final Presentation Template_updated (2).pptx"
$outDir = "C:\Users\uzsan\OneDrive\Documents\GitHub\innergrowth-forge\outputs\final-presentation-work"
$zipOut = "C:\Users\uzsan\OneDrive\Documents\GitHub\innergrowth-forge\outputs\MIND_Architecture_Final_Presentation_Demo.zip"
$pptxOut = "C:\Users\uzsan\OneDrive\Documents\GitHub\innergrowth-forge\outputs\MIND_Architecture_Final_Presentation_Demo.pptx"
$tempZip = "C:\Users\uzsan\OneDrive\Documents\GitHub\innergrowth-forge\outputs\final-presentation-template.zip"

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

function Add-TextBox {
  param(
    [int]$SlideNo,
    [string]$Name,
    [int]$X,
    [int]$Y,
    [int]$W,
    [int]$H,
    [string[]]$Lines,
    [int]$FontSize = 2000
  )

  $path = Join-Path $outDir "ppt\slides\slide$SlideNo.xml"
  [xml]$xml = Get-Content $path -Raw
  $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
  $ns.AddNamespace("p", "http://schemas.openxmlformats.org/presentationml/2006/main")
  $spTree = $xml.SelectSingleNode("//p:cSld/p:spTree", $ns)
  $id = 5000 + $SlideNo

  $paragraphs = ($Lines | ForEach-Object {
    $escaped = [System.Security.SecurityElement]::Escape($_)
    "<a:p><a:r><a:rPr lang=`"en-US`" sz=`"$FontSize`" dirty=`"0`"><a:solidFill><a:srgbClr val=`"FFFFFF`"/></a:solidFill></a:rPr><a:t>$escaped</a:t></a:r></a:p>"
  }) -join ""

  $fragment = @"
<p:sp xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:nvSpPr>
    <p:cNvPr id="$id" name="$Name"/>
    <p:cNvSpPr txBox="1"/>
    <p:nvPr/>
  </p:nvSpPr>
  <p:spPr>
    <a:xfrm>
      <a:off x="$X" y="$Y"/>
      <a:ext cx="$W" cy="$H"/>
    </a:xfrm>
    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
    <a:noFill/>
    <a:ln><a:noFill/></a:ln>
  </p:spPr>
  <p:txBody>
    <a:bodyPr wrap="square" rtlCol="0">
      <a:spAutoFit/>
    </a:bodyPr>
    <a:lstStyle/>
    $paragraphs
  </p:txBody>
</p:sp>
"@

  $node = $xml.CreateDocumentFragment()
  $node.InnerXml = $fragment
  [void]$spTree.AppendChild($node)

  $settings = New-Object System.Xml.XmlWriterSettings
  $settings.Encoding = New-Object System.Text.UTF8Encoding($false)
  $settings.Indent = $false
  $writer = [System.Xml.XmlWriter]::Create($path, $settings)
  $xml.Save($writer)
  $writer.Close()
}

Set-SlideText 1 @(
  "MIND Architecture Web Application",
  "Final Presentation and Demonstration",
  "Student ID",
  "Student Name",
  "Team Role",
  "Sandeep Pun",
  "Lead Developer / Integration",
  "Ahmed Malik",
  "Documentation Support",
  "Dipesh Shahi",
  "Documentation and Report Support",
  "Rabin Shrestha",
  "Testing and Evaluation",
  "Harshit Shrestha",
  "Testing and Validation"
)

Set-SlideText 2 @(
  "Presentation Topics",
  "Project overview and client problem",
  "Target users and core requirements",
  "Implementation summary and technology stack",
  "Testing and evaluation results",
  "Client feedback and handover status",
  "Team reflection and member contributions",
  "Product demonstration walkthrough",
  "Recording link and Q and A",
  "",
  ""
)

Set-SlideText 3 @(
  "Project Overview",
  "Client",
  "Mind Architecture needed a professional digital platform for services, resources, events, consultations, memberships, and admin management.",
  "Problem Description",
  "The client did not have one complete system for public content, account-based features, ordering, consultation requests, and internal admin control.",
  "Functional Requirements",
  "Register/login, browse content, buy books, book events, request consultations, manage membership, view dashboard, and manage admin operations.",
  "Use Case Diagram",
  "PLACEHOLDER: Insert overall use case diagram here.",
  "Solution Design",
  "React frontend with Supabase backend/auth/database and Stripe test-mode payment integration.",
  "Sitemap / Architecture / ERD",
  "PLACEHOLDER: Insert sitemap, architecture diagram, and ERD screenshots if required.",
  "Prototype / Screenshots",
  "PLACEHOLDER: Add key screenshots: home, dashboard, admin, checkout, consultations.",
  "Technology and Platform",
  "React, TypeScript, Vite, Tailwind CSS, Supabase, Stripe, Vercel-ready deployment.",
  "How It Works",
  "Public users browse. Registered users book/order. Premium users access member features. Admin manages content and operations.",
  "Languages and Tools",
  "TypeScript, SQL/Supabase, Stripe Checkout, GitHub, VS Code, testing spreadsheets.",
  "Patterns",
  "Role-based access, reusable components, Supabase functions, protected dashboard/admin routes.",
  "Project Planning",
  "Weekly progress through requirements, design, implementation, testing, documentation, and demonstration preparation.",
  "Schedule / WBS / Gantt",
  "PLACEHOLDER: Insert schedule or Gantt chart summary if needed.",
  ""
)

Set-SlideText 4 @(
  "Testing and Evaluation",
  "Test Plan",
  "Around 60 test cases were prepared across authentication, dashboard, books, cart, checkout, events, membership, consultations, contact messages, and admin features.",
  "Key Functional Tests",
  "Login/signup, role access, book checkout, pending orders, event booking, consultation approval, contact message flow, admin updates.",
  "Evaluation Approach",
  "The system was evaluated through functional testing, role-based walkthroughs, responsiveness checks, and client/demo readiness review.",
  "Results Summary",
  "Core implemented workflows passed in the development/test environment. Stripe remains in test mode until the client is ready for live setup.",
  "PLACEHOLDER: Insert test summary chart or screenshot of Requirements / Test Cases / Traceability Matrix."
)

Add-TextBox 4 "Testing Summary" 760000 1700000 10600000 3900000 @(
  "Test plan covered authentication, dashboards, books, cart, checkout, events, membership, consultations, messages, and admin features.",
  "Around 60 test cases were prepared with requirement IDs, test case IDs, expected results, and pass/fail status.",
  "Evaluation used role-based walkthroughs, functional testing, responsiveness review, and demo-readiness checks.",
  "Result: core workflows passed in test/development mode; Stripe live activation remains client-dependent.",
  "PLACEHOLDER: Insert screenshot of Requirements, Test Cases, or Traceability Matrix."
)

Set-SlideText 5 @(
  "Client Feedback",
  "PLACEHOLDER: Upload screenshot of client email or message feedback here.",
  "Current client position: the client likes the product and wants to use it, but needs time and support to understand hosting, ownership, Stripe, Supabase, and future maintenance.",
  "The project is being treated as a handover-ready system with code, design, backend setup details, test artifacts, user manual, and documentation prepared.",
  "Live deployment is not completed yet because client-side readiness, ownership accounts, and Stripe live configuration are still pending."
)

Add-TextBox 5 "Client Feedback Notes" 760000 1850000 10600000 3600000 @(
  "Client feedback will be inserted as a screenshot or direct summary after the final handover meeting.",
  "Current status: client wants to use the product but needs clarity on hosting, Supabase ownership, Stripe, and maintenance.",
  "The website is complete for handover, with live deployment planned later when client accounts and payment setup are ready.",
  "PLACEHOLDER: Add client message/email screenshot."
)

Set-SlideText 6 @(
  "Retrospective",
  "Lesson Learnt:",
  "A real client project needs both technical delivery and clear handover communication. Ownership, hosting, payments, and maintenance must be explained in simple language.",
  "What went well?",
  "The team delivered a working website with public pages, dashboards, admin tools, consultation flow, ordering, membership, testing artifacts, and user manual support.",
  "What could be improved?",
  "Earlier decisions around live hosting, Stripe ownership, and backend handover could have reduced uncertainty near the final week.",
  "What can we do?",
  "Complete final demo, collect client feedback for marking, hand over all documentation, and prepare clear next-step guidance for future launch."
)

Set-SlideText 7 @(
  "Product Demonstration",
  "Demo Scenarios",
  "1. Anonymous user browses public pages, resources, programs, contact, and consultation pages.",
  "2. Registered user logs in, views dashboard, adds a book to cart, and completes Stripe test checkout.",
  "3. Admin views the order, updates tracking/status, and the user sees the updated order information.",
  "4. User requests consultation; admin confirms date/status; user sees pending or confirmed consultation details.",
  "5. User sends contact message; admin sees unread message and can reply by email.",
  "6. Admin manages events/programs and views booked users for each event.",
  "7. Premium account shows membership status and member pricing.",
  "DEMO VIDEO LINK PLACEHOLDER: paste final recording folder/video link here."
)

Set-SlideText 8 @(
  "Conclusion",
  "The MIND Architecture Web Application has been completed to a functional handover stage with frontend, backend integration, dashboards, admin management, documentation, and test artifacts prepared.",
  "The system supports the client's main business needs: public visibility, user accounts, resources/books, events, consultations, membership, messages, and admin control.",
  "Stripe has been integrated and tested in developer test mode. Live launch can be completed later when the client finalises domain, hosting, Supabase ownership, and Stripe live setup.",
  "Recommendation: hand over the complete project now and allow the client to launch later with a developer or managed setup when ready."
)

Add-TextBox 8 "Conclusion Details" 760000 1700000 10600000 3700000 @(
  "The project reached a functional handover stage with frontend, backend integration, dashboards, admin features, documentation, and testing artifacts.",
  "The solution supports public browsing, user accounts, books/orders, events, consultations, memberships, messages, and admin operations.",
  "Stripe is implemented in test mode. Live launch can happen later after domain, hosting, Supabase ownership, and Stripe live setup are finalised.",
  "Recommendation: hand over the complete package now and support future launch through a managed developer setup."
)

Set-SlideText 9 @(
  "Group Members / Roles",
  "Sandeep Pun - Lead developer, integration, feature refinement, Stripe/test payment flow, admin/user dashboards, final technical coordination.",
  "Ahmed Malik - Documentation support, user manual content, report drafting support, project evidence organisation.",
  "Dipesh Shahi - Documentation and report support, conclusion/recommendations, activity log and formatting support.",
  "Rabin Shrestha - Testing and evaluation support, feature validation, test evidence and usability observations.",
  "Harshit Shrestha - Test plan and test case support, validation of user-facing workflows and demonstration preparation."
)

Add-TextBox 9 "Roles Summary" 760000 1650000 10600000 3900000 @(
  "Sandeep Pun - Lead developer, integration, feature refinement, Stripe/test payment flow, admin/user dashboards, technical coordination.",
  "Ahmed Malik - Documentation support, user manual content, report drafting support, project evidence organisation.",
  "Dipesh Shahi - Documentation and report support, conclusion/recommendations, activity log and formatting support.",
  "Rabin Shrestha - Testing and evaluation support, feature validation, test evidence and usability observations.",
  "Harshit Shrestha - Test plan and test case support, validation of user-facing workflows and demonstration preparation."
)

Set-SlideText 10 @(
  "Member Contribution",
  "Sandeep Pun: guided the overall project development and final report integration; implemented and refined major website features and demonstration-ready flows.",
  "Ahmed Malik: supported written documentation and user manual preparation under project guidance.",
  "Dipesh Shahi: supported report writing, structure, conclusion, recommendations, and activity log preparation.",
  "Rabin Shrestha: contributed to testing, evaluation review, and validation of completed features.",
  "Harshit Shrestha: contributed to test case preparation, feature checking, and recording/demo support.",
  "PLACEHOLDER: Add individual speaking responsibility or contribution percentage if required."
)

Add-TextBox 10 "Contribution Summary" 760000 1650000 10600000 3900000 @(
  "Sandeep guided the project development and final integration, including technical implementation and demo readiness.",
  "Ahmed and Dipesh supported documentation, report writing, user manual preparation, and organising project evidence.",
  "Rabin and Harshit supported testing, test case review, validation of core workflows, and demonstration preparation.",
  "The group worked together to prepare the final report, testing artifacts, user manual, presentation, and recorded demo."
)

Set-SlideText 11 @(
  "Recording Link",
  "Complete Project Demonstration Recording",
  "PLACEHOLDER: Paste Google Drive / OneDrive / Moodle-accessible demo recording link here.",
  "Suggested folder contents: final demo video, short walkthrough clips, test evidence, final report, user manual, and handover materials.",
  "Q and A"
)

Add-TextBox 11 "Recording Placeholder" 760000 1800000 10600000 3300000 @(
  "Complete Project Demonstration Recording:",
  "PLACEHOLDER: Paste final Google Drive / OneDrive / Moodle-accessible link here.",
  "Recommended contents: final edited demo video, short raw clips, final report, user manual, test artifacts, and handover notes.",
  "End of presentation - Questions and Answers."
)

Push-Location $outDir
Compress-Archive -Path * -DestinationPath $zipOut -Force
Pop-Location
Rename-Item -LiteralPath $zipOut -NewName "MIND_Architecture_Final_Presentation_Demo.pptx"

Write-Output $pptxOut
