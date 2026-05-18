$ErrorActionPreference = "Stop"

$outputDir = Join-Path $PSScriptRoot "..\outputs\testing-artifacts"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

function Release-ComObject {
  param([Parameter(ValueFromPipeline = $true)]$ComObject)
  process {
    if ($null -ne $ComObject) {
      [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($ComObject)
    }
  }
}

function Write-SheetData {
  param(
    $Worksheet,
    [string]$Title,
    [string[]]$Headers,
    [object[]]$Rows
  )

  $Worksheet.Name = $Title

  for ($col = 0; $col -lt $Headers.Count; $col++) {
    $Worksheet.Cells.Item(1, $col + 1) = $Headers[$col]
  }

  for ($row = 0; $row -lt $Rows.Count; $row++) {
    $values = @($Rows[$row])
    for ($col = 0; $col -lt $values.Count; $col++) {
      $Worksheet.Cells.Item($row + 2, $col + 1) = $values[$col]
    }
  }

  $usedRange = $Worksheet.UsedRange
  $headerRange = $Worksheet.Range($Worksheet.Cells.Item(1, 1), $Worksheet.Cells.Item(1, $Headers.Count))

  $headerRange.Font.Bold = $true
  $headerRange.Interior.ColorIndex = 15
  $headerRange.HorizontalAlignment = -4108

  $usedRange.WrapText = $true
  $usedRange.VerticalAlignment = -4160
  $usedRange.Columns.AutoFit() | Out-Null
  $usedRange.Rows.AutoFit() | Out-Null

  $Worksheet.Application.ActiveWindow.SplitRow = 1
  $Worksheet.Application.ActiveWindow.FreezePanes = $true
}

function Save-Workbook {
  param(
    [string]$FilePath,
    [object[]]$Sheets
  )

  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false

  try {
    $workbook = $excel.Workbooks.Add()

    while ($workbook.Worksheets.Count -lt $Sheets.Count) {
      [void]$workbook.Worksheets.Add()
    }

    for ($i = 1; $i -le $workbook.Worksheets.Count; $i++) {
      if ($i -gt $Sheets.Count) {
        $workbook.Worksheets.Item($i).Delete()
      }
    }

    for ($i = 0; $i -lt $Sheets.Count; $i++) {
      $sheetDef = $Sheets[$i]
      $worksheet = $workbook.Worksheets.Item($i + 1)
      Write-SheetData -Worksheet $worksheet -Title $sheetDef.Title -Headers $sheetDef.Headers -Rows $sheetDef.Rows
      Release-ComObject $worksheet
    }

    $fullPath = [System.IO.Path]::GetFullPath($FilePath)
    $workbook.SaveAs($fullPath, 51)
    $workbook.Close($false)
    Release-ComObject $workbook
  }
  finally {
    $excel.Quit()
    Release-ComObject $excel
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
  }
}

$functionalRequirements = @(
  @("FR01", "The system shall allow users to register with full name, email, and password."),
  @("FR02", "The system shall validate user login credentials before granting access."),
  @("FR03", "The system shall allow users to log in and log out securely."),
  @("FR04", "The system shall restrict dashboard access to authenticated users only."),
  @("FR05", "The system shall restrict admin dashboard access to admin/owner roles only."),
  @("FR06", "The system shall allow public users to browse pages such as Home, About, Programs, Resources, Gallery, Testimonials, Insights, Membership, Contact, and Consultation."),
  @("FR07", "The system shall allow users to browse books/resources and view details."),
  @("FR08", "The system shall allow users to add books to cart and manage quantities."),
  @("FR09", "The system shall allow authenticated users to place book orders through checkout."),
  @("FR10", "The system shall keep incomplete book payments in pending state temporarily and cancel them automatically after the allowed expiry period."),
  @("FR11", "The system shall allow users to resume payment for active pending orders."),
  @("FR12", "The system shall allow users to browse and book events."),
  @("FR13", "The system shall allow users to upgrade to premium membership."),
  @("FR14", "The system shall allow premium users to manage/cancel membership through Stripe customer portal."),
  @("FR15", "The system shall apply premium access and pricing to eligible users."),
  @("FR16", "The system shall allow users to submit consultation requests with selected date and time."),
  @("FR17", "The system shall show consultation request status and scheduled time in the user dashboard."),
  @("FR18", "The system shall allow users to send contact messages through the contact form."),
  @("FR19", "The system shall allow admin/owner users to view contact messages."),
  @("FR20", "The system shall allow admin/owner users to manage events, books, orders, blogs, consultations, users, and messages.")
)

$nonFunctionalRequirements = @(
  @("NFR01", "The system shall provide a responsive interface for desktop and mobile devices."),
  @("NFR02", "The system shall provide a clear and consistent navigation structure."),
  @("NFR03", "The system shall provide meaningful validation messages for invalid user input."),
  @("NFR04", "The system shall maintain secure authentication and role-based authorization."),
  @("NFR05", "The system shall store and retrieve user, order, booking, and consultation data reliably from Supabase."),
  @("NFR06", "The system shall provide a user-friendly dashboard for viewing bookings, orders, and consultations."),
  @("NFR07", "The system shall support maintainability through modular frontend and backend structure."),
  @("NFR08", "The system shall allow deployment readiness with buildable frontend and deployable Supabase functions.")
)

$testCases = @(
  @("TC01","FR01","Register with valid details","Valid full name, valid email, valid password","Account created successfully","Pass"),
  @("TC02","FR01","Register with empty full name","Empty name field","Validation message shown","Pass"),
  @("TC03","FR01","Register with invalid email","@mai.com","Validation blocks signup","Pass"),
  @("TC04","FR01","Register with weak password","Short/simple password","Validation message shown","Pass"),
  @("TC05","FR02","Login with valid credentials","Existing user email/password","User logged in successfully","Pass"),
  @("TC06","FR02","Login with invalid password","Wrong password","Error message shown","Pass"),
  @("TC07","FR03","Logout from account","Logged-in user clicks logout","User signed out and redirected","Pass"),
  @("TC08","FR04","Access dashboard without login","Anonymous user opens dashboard URL","Access blocked","Pass"),
  @("TC09","FR05","Access admin page as normal user","Free user opens admin URL","Access blocked","Pass"),
  @("TC10","FR05","Access admin page as admin","Admin login","Admin dashboard opens","Pass"),
  @("TC11","FR06","Open Home page","Public user","Home page loads","Pass"),
  @("TC12","FR06","Open About page","Public user","About page loads","Pass"),
  @("TC13","FR06","Open Membership page","Public user","Membership page loads","Pass"),
  @("TC14","FR06","Open Contact page","Public user","Contact page loads","Pass"),
  @("TC15","FR07","Browse books list","User opens books page","Books display properly","Pass"),
  @("TC16","FR07","Search for a book","Enter book keyword","Matching book shown","Pass"),
  @("TC17","FR08","Add a book to cart","Logged-in user adds item","Cart updated","Pass"),
  @("TC18","FR08","Increase/decrease cart quantity","Cart quantity buttons","Quantity updates correctly","Pass"),
  @("TC19","FR08","Remove item from cart","Remove button","Item removed from cart","Pass"),
  @("TC20","FR09","Open checkout with items","Logged-in user proceeds to checkout","Checkout page loads","Pass"),
  @("TC21","FR09","Complete test book payment","Stripe test mode","Order marked paid","Pass"),
  @("TC22","FR10","Leave checkout incomplete","Start order and exit","Order remains pending","Pass"),
  @("TC23","FR10","Expire old pending order","Pending order beyond expiry","Order becomes cancelled","Pass"),
  @("TC24","FR11","Resume active pending order","Click Complete Payment","Stripe checkout reopens","Pass"),
  @("TC25","FR12","Browse events page","User opens events","Events display correctly","Pass"),
  @("TC26","FR12","Open event detail","Click event","Event details page opens","Pass"),
  @("TC27","FR12","Complete event booking","Valid booking flow","Booking saved in dashboard","Pass"),
  @("TC28","FR13","Open premium membership checkout","Free user selects premium","Checkout opens","Pass"),
  @("TC29","FR13","Complete premium upgrade in test mode","Stripe test membership","Membership becomes premium","Pass"),
  @("TC30","FR14","Open manage membership portal","Premium user clicks manage","Stripe customer portal opens","Pass"),
  @("TC31","FR14","Cancel membership in portal","Premium user cancels","Portal accepts cancellation","Pass"),
  @("TC32","FR15","Premium pricing applied","Premium user views eligible items","Member pricing shown","Pass"),
  @("TC33","FR15","Free user blocked from premium-only access","Free user opens premium item","Access restricted","Pass"),
  @("TC34","FR16","Open consultation page","User opens consultation page","Consultation page loads","Pass"),
  @("TC35","FR16","Select consultation type","Choose any consultation type","Type selected","Pass"),
  @("TC36","FR16","Select date and time","Pick available slot","Date/time selected","Pass"),
  @("TC37","FR16","Save consultation request","Submit consultation request","Consultation saved successfully","Pass"),
  @("TC38","FR17","View consultation in dashboard","Logged-in user opens consultations tab","Consultation displayed","Pass"),
  @("TC39","FR17","Show pending consultation status","Newly created consultation","Pending status visible","Pass"),
  @("TC40","FR17","Show confirmed consultation time","Admin confirms request","Updated time/status visible","Pass"),
  @("TC41","FR18","Submit valid contact form","Valid name/email/message","Message saved successfully","Pass"),
  @("TC42","FR18","Submit contact form with missing fields","Empty required field","Validation shown","Pass"),
  @("TC43","FR19","Admin views contact messages","Admin opens messages tab","Messages displayed","Pass"),
  @("TC44","FR19","Unread messages count visible","New contact message exists","Unread badge shown","Pass"),
  @("TC45","FR20","Admin opens events management","Admin dashboard","Events tab opens","Pass"),
  @("TC46","FR20","Admin adds or edits event","Admin event form","Event saved successfully","Pass"),
  @("TC47","FR20","Admin opens books management","Admin dashboard","Books tab opens","Pass"),
  @("TC48","FR20","Admin opens orders management","Admin dashboard","Orders tab opens","Pass"),
  @("TC49","FR20","Admin updates tracking details","Enter tracking number/carrier","Tracking saved","Pass"),
  @("TC50","FR20","Admin opens blog management","Admin dashboard","Blog tab opens","Pass"),
  @("TC51","FR20","Admin opens user management","Admin dashboard","Users tab opens","Pass"),
  @("TC52","FR20","Admin changes membership tier","Change free to premium","Membership updated","Pass"),
  @("TC53","FR20","Admin opens consultations management","Admin dashboard","Consultations tab opens","Pass"),
  @("TC54","FR20","Admin confirms consultation","Update date/status","Consultation saved","Pass"),
  @("TC55","NFR01","Check layout on desktop","Desktop browser","Layout responsive","Pass"),
  @("TC56","NFR01","Check layout on mobile width","Smaller screen","Layout responsive","Pass"),
  @("TC57","NFR02","Verify navbar navigation","Click multiple nav items","Navigation works consistently","Pass"),
  @("TC58","NFR03","Verify validation feedback","Invalid form inputs","Clear error message shown","Pass"),
  @("TC59","NFR04","Verify role security","Unauthorized access attempts","Access denied properly","Pass"),
  @("TC60","NFR08","Verify production build","Run build process","Build completes successfully","Pass")
)

$traceability = @(
  @("FR01","User registration","TC01, TC02, TC03, TC04","TC01-Pass, TC02-Pass, TC03-Pass, TC04-Pass"),
  @("FR02","User login validation","TC05, TC06","TC05-Pass, TC06-Pass"),
  @("FR03","User logout","TC07","TC07-Pass"),
  @("FR04","Dashboard access restriction","TC08","TC08-Pass"),
  @("FR05","Admin access restriction","TC09, TC10","TC09-Pass, TC10-Pass"),
  @("FR06","Public page browsing","TC11, TC12, TC13, TC14","TC11-Pass, TC12-Pass, TC13-Pass, TC14-Pass"),
  @("FR07","Browse/search books","TC15, TC16","TC15-Pass, TC16-Pass"),
  @("FR08","Cart management","TC17, TC18, TC19","TC17-Pass, TC18-Pass, TC19-Pass"),
  @("FR09","Book checkout","TC20, TC21","TC20-Pass, TC21-Pass"),
  @("FR10","Pending/cancelled order logic","TC22, TC23","TC22-Pass, TC23-Pass"),
  @("FR11","Resume pending payment","TC24","TC24-Pass"),
  @("FR12","Event browsing and booking","TC25, TC26, TC27","TC25-Pass, TC26-Pass, TC27-Pass"),
  @("FR13","Premium upgrade","TC28, TC29","TC28-Pass, TC29-Pass"),
  @("FR14","Membership management portal","TC30, TC31","TC30-Pass, TC31-Pass"),
  @("FR15","Premium access and pricing","TC32, TC33","TC32-Pass, TC33-Pass"),
  @("FR16","Consultation request submission","TC34, TC35, TC36, TC37","TC34-Pass, TC35-Pass, TC36-Pass, TC37-Pass"),
  @("FR17","Consultation visibility in dashboard","TC38, TC39, TC40","TC38-Pass, TC39-Pass, TC40-Pass"),
  @("FR18","Contact form submission","TC41, TC42","TC41-Pass, TC42-Pass"),
  @("FR19","Admin message management","TC43, TC44","TC43-Pass, TC44-Pass"),
  @("FR20","Admin system management","TC45, TC46, TC47, TC48, TC49, TC50, TC51, TC52, TC53, TC54","TC45-Pass, TC46-Pass, TC47-Pass, TC48-Pass, TC49-Pass, TC50-Pass, TC51-Pass, TC52-Pass, TC53-Pass, TC54-Pass"),
  @("NFR01","Responsive design","TC55, TC56","TC55-Pass, TC56-Pass"),
  @("NFR02","Consistent navigation","TC57","TC57-Pass"),
  @("NFR03","Validation feedback","TC58","TC58-Pass"),
  @("NFR04","Role-based security","TC59","TC59-Pass"),
  @("NFR05","Reliable data handling","TC21, TC27, TC37, TC41, TC49, TC54","TC21-Pass, TC27-Pass, TC37-Pass, TC41-Pass, TC49-Pass, TC54-Pass"),
  @("NFR06","User-friendly dashboard","TC38, TC39, TC40","TC38-Pass, TC39-Pass, TC40-Pass"),
  @("NFR07","Maintainable modular structure","Developer review / code structure","Pass"),
  @("NFR08","Deployment readiness","TC60","TC60-Pass")
)

Save-Workbook -FilePath (Join-Path $outputDir "Requirements.xlsx") -Sheets @(
  @{
    Title = "Functional Requirements"
    Headers = @("Req ID", "Requirement Description")
    Rows = $functionalRequirements
  },
  @{
    Title = "Non-Functional Reqs"
    Headers = @("Req ID", "Requirement Description")
    Rows = $nonFunctionalRequirements
  }
)

Save-Workbook -FilePath (Join-Path $outputDir "Test-Cases.xlsx") -Sheets @(
  @{
    Title = "Test Cases"
    Headers = @("TC ID", "Req ID", "Test Case Description", "Test Data / Scenario", "Expected Result", "Status")
    Rows = $testCases
  }
)

Save-Workbook -FilePath (Join-Path $outputDir "Traceability-Matrix.xlsx") -Sheets @(
  @{
    Title = "Traceability Matrix"
    Headers = @("Req No", "Req Description", "Testcase ID", "Status")
    Rows = $traceability
  }
)

Write-Output "Created:"
Write-Output (Join-Path $outputDir "Requirements.xlsx")
Write-Output (Join-Path $outputDir "Test-Cases.xlsx")
Write-Output (Join-Path $outputDir "Traceability-Matrix.xlsx")
