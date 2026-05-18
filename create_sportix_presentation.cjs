const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Sportix Group";
pptx.subject = "Assessment 4 Sportix Android eCommerce Application";
pptx.title = "Sportix Assessment 4 Presentation";
pptx.company = "KOI ICT372";
pptx.lang = "en-AU";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-AU"
};
pptx.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });

const C = {
  navy: "07182E",
  orange: "FF4F00",
  light: "EAF6FF",
  pale: "F6FBFF",
  text: "0E1A2B",
  muted: "53627A",
  line: "B8C9D9",
  white: "FFFFFF",
  green: "0F8B6F"
};

const logoCandidates = [
  "C:/Users/uzsan/Downloads/Logo.png",
  "C:/Users/uzsan/AndroidStudioProjects/Sportix App/app/src/main/res/drawable/sportix_logo.png",
  "C:/Users/uzsan/AndroidStudioProjects/Sportix/app/src/main/res/drawable/sportix_logo.png"
];
const logoPath = logoCandidates.find((p) => fs.existsSync(p));

function addBg(slide, title, kicker) {
  slide.background = { color: C.pale };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.18, fill: { color: C.orange }, line: { color: C.orange } });
  slide.addText("SPORTIX", { x: 0.45, y: 0.32, w: 1.6, h: 0.28, fontSize: 8, bold: true, color: C.orange, charSpace: 1.5, margin: 0 });
  if (kicker) slide.addText(kicker, { x: 0.45, y: 0.58, w: 4.2, h: 0.25, fontSize: 8.5, color: C.muted, margin: 0 });
  slide.addText(title, { x: 0.45, y: 0.9, w: 8.8, h: 0.62, fontSize: 25, bold: true, color: C.text, margin: 0 });
  slide.addShape(pptx.ShapeType.line, { x: 0.45, y: 1.64, w: 12.4, h: 0, line: { color: C.line, width: 1 } });
}

function addLogo(slide, x, y, w, h) {
  if (logoPath) {
    slide.addImage({ path: logoPath, x, y, w, h });
  } else {
    slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.06, fill: { color: C.navy }, line: { color: C.navy } });
    slide.addText("S", { x, y: y + h * 0.06, w, h: h * 0.7, fontSize: 34, bold: true, italic: true, align: "center", color: C.white, margin: 0 });
  }
}

function bullet(slide, items, x, y, w, fs = 14, gap = 0.38, color = C.text) {
  items.forEach((item, i) => {
    const yy = y + i * gap;
    slide.addShape(pptx.ShapeType.ellipse, { x, y: yy + 0.08, w: 0.09, h: 0.09, fill: { color: C.orange }, line: { color: C.orange } });
    slide.addText(item, { x: x + 0.18, y: yy, w, h: 0.25, fontSize: fs, color, margin: 0, breakLine: false });
  });
}

function tag(slide, text, x, y, w, color = C.orange) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h: 0.34, rectRadius: 0.08, fill: { color }, line: { color } });
  slide.addText(text, { x, y: y + 0.065, w, h: 0.16, fontSize: 8.5, bold: true, align: "center", color: C.white, margin: 0 });
}

function screenshotBox(slide, label, x, y, w, h) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.08,
    fill: { color: C.white, transparency: 0 },
    line: { color: C.line, width: 1.2, dash: "dash" }
  });
  slide.addText("Screenshot Placeholder", { x: x + 0.25, y: y + 0.25, w: w - 0.5, h: 0.3, fontSize: 13, bold: true, color: C.muted, align: "center", margin: 0 });
  slide.addText(label, { x: x + 0.25, y: y + h / 2 - 0.12, w: w - 0.5, h: 0.3, fontSize: 12, color: C.text, align: "center", margin: 0 });
  slide.addText("Replace with app screen capture", { x: x + 0.25, y: y + h - 0.52, w: w - 0.5, h: 0.24, fontSize: 8.5, color: C.muted, align: "center", margin: 0 });
}

function featurePillRow(slide, labels, x, y) {
  labels.forEach((l, i) => tag(slide, l, x + i * 1.52, y, 1.34, i % 2 ? C.navy : C.orange));
}

function contributionSlide(name, role, tasks, placeholders) {
  const slide = pptx.addSlide();
  addBg(slide, `${name}'s Contribution`, role);
  slide.addText("Allocated work", { x: 0.55, y: 1.9, w: 3.5, h: 0.28, fontSize: 15, bold: true, color: C.orange, margin: 0 });
  bullet(slide, tasks, 0.58, 2.32, 4.25, 12.5, 0.44);
  if (placeholders.length === 1) {
    screenshotBox(slide, placeholders[0], 5.25, 1.95, 6.85, 4.55);
  } else {
    screenshotBox(slide, placeholders[0], 5.05, 1.9, 3.45, 2.05);
    screenshotBox(slide, placeholders[1], 8.75, 1.9, 3.45, 2.05);
    if (placeholders[2]) screenshotBox(slide, placeholders[2], 5.05, 4.25, 3.45, 2.05);
    if (placeholders[3]) screenshotBox(slide, placeholders[3], 8.75, 4.25, 3.45, 2.05);
  }
  return slide;
}

// Slide 1
{
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.navy }, line: { color: C.navy } });
  s.addShape(pptx.ShapeType.arc, { x: 7.6, y: -0.9, w: 5.3, h: 5.3, line: { color: C.orange, width: 6, transparency: 10 }, adjustPoint: 0.65, rotate: 20 });
  addLogo(s, 0.75, 0.82, 1.5, 1.5);
  s.addText("Sportix", { x: 0.75, y: 2.55, w: 7.8, h: 0.8, fontSize: 42, bold: true, color: C.white, margin: 0 });
  s.addText("Android eCommerce Application", { x: 0.78, y: 3.42, w: 6.1, h: 0.4, fontSize: 18, color: "DDEBFA", margin: 0 });
  s.addText("Assessment 4 Group Presentation", { x: 0.78, y: 4.05, w: 5.2, h: 0.28, fontSize: 11.5, bold: true, color: C.orange, margin: 0 });
  s.addText("All sports. All gear. One store.", { x: 0.78, y: 6.55, w: 4.5, h: 0.25, fontSize: 11, color: "B9C9DD", margin: 0 });
  featurePillRow(s, ["Java", "XML", "Android Studio", "eCommerce"], 7.15, 6.35);
}

// Slide 2
{
  const s = pptx.addSlide();
  addBg(s, "Project Overview", "Business idea and purpose");
  s.addText("Sportix is a sports accessories shopping app inspired by Australian retail stores such as Rebel. The app allows customers to browse products, search by category, view product details, add items to a cart, checkout, and view previous orders.", {
    x: 0.55, y: 1.95, w: 6.05, h: 1.2, fontSize: 17, color: C.text, fit: "shrink", margin: 0
  });
  bullet(s, [
    "Commercial app concept for smartphone/tablet users",
    "Medium-sized Android app using Java, XML, and Android Studio",
    "Focus on product browsing, order flow, privacy, and usability",
    "Designed to meet Assessment 4 feature requirements"
  ], 0.65, 3.55, 5.6, 13.5, 0.43);
  s.addShape(pptx.ShapeType.roundRect, { x: 7.25, y: 1.85, w: 4.8, h: 3.95, rectRadius: 0.1, fill: { color: C.white }, line: { color: C.line } });
  s.addText("Core App Flow", { x: 7.55, y: 2.15, w: 2.3, h: 0.3, fontSize: 16, bold: true, color: C.text, margin: 0 });
  ["Browse", "Product Detail", "Cart", "Checkout", "Purchase History"].forEach((t, i) => {
    const y = 2.75 + i * 0.55;
    s.addShape(pptx.ShapeType.roundRect, { x: 7.65, y, w: 2.55, h: 0.34, rectRadius: 0.08, fill: { color: i === 0 ? C.orange : C.light }, line: { color: i === 0 ? C.orange : C.line } });
    s.addText(t, { x: 7.7, y: y + 0.07, w: 2.45, h: 0.15, fontSize: 8.5, bold: true, align: "center", color: i === 0 ? C.white : C.text, margin: 0 });
    if (i < 4) s.addShape(pptx.ShapeType.line, { x: 8.92, y: y + 0.36, w: 0, h: 0.18, line: { color: C.orange, width: 1.2 } });
  });
}

// Slide 3
{
  const s = pptx.addSlide();
  addBg(s, "Assessment Requirements Coverage", "Required app pages");
  const rows = [
    ["Registration", "Customer account creation"],
    ["Login", "Email/username and password access"],
    ["Home", "Product cards, search, cart, settings access"],
    ["Detail", "Quantity selection and add-to-cart"],
    ["Search", "Type-ahead product/category suggestions"],
    ["Cart", "Items, quantity update, total cost"],
    ["Checkout", "Shipping and payment form validation"],
    ["Purchase History", "Past order display for customer review"]
  ];
  rows.forEach((r, i) => {
    const x = i < 4 ? 0.7 : 6.85;
    const y = 1.95 + (i % 4) * 0.9;
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.35, h: 0.58, rectRadius: 0.05, fill: { color: C.white }, line: { color: C.line } });
    s.addText(r[0], { x: x + 0.2, y: y + 0.12, w: 1.8, h: 0.22, fontSize: 12, bold: true, color: C.orange, margin: 0 });
    s.addText(r[1], { x: x + 2.0, y: y + 0.13, w: 3.15, h: 0.22, fontSize: 10.5, color: C.text, margin: 0 });
  });
  s.addText("The presentation evidence is organised around these functions and the individual group responsibilities.", { x: 0.75, y: 6.15, w: 11, h: 0.3, fontSize: 13, color: C.muted, margin: 0 });
}

// Slide 4
{
  const s = pptx.addSlide();
  addBg(s, "Tools and Implementation Approach", "Development setup");
  const cols = [
    ["Android Studio", "Project creation, preview, emulator testing, source organisation"],
    ["Java", "Activity logic, navigation, validation, cart updates, order placement"],
    ["XML", "Separate layout files for each page and preview-friendly UI design"],
    ["SharedPreferences", "Simple local login state and profile storage for demonstration"]
  ];
  cols.forEach((c, i) => {
    const x = 0.65 + (i % 2) * 6.15;
    const y = 2.05 + Math.floor(i / 2) * 1.85;
    s.addText(c[0], { x, y, w: 4.8, h: 0.35, fontSize: 18, bold: true, color: i % 2 ? C.orange : C.navy, margin: 0 });
    s.addText(c[1], { x, y: y + 0.45, w: 5.3, h: 0.58, fontSize: 12.5, color: C.text, fit: "shrink", margin: 0 });
  });
  s.addText("Design direction: clean ecommerce navigation, Sportix branding, category browsing, product cards, and basic commercial checkout logic.", { x: 0.65, y: 6.35, w: 11.7, h: 0.35, fontSize: 13, bold: true, color: C.text, margin: 0 });
}

// Slide 5
{
  const s = pptx.addSlide();
  addBg(s, "Group Contribution Overview", "Fair distribution of work");
  const table = [
    ["Member", "Contribution"],
    ["Subani KC", "Home page, category layout, product cards, branding, page testing"],
    ["Rabin", "Product detail, search feature, quantity selector, add-to-cart testing"],
    ["Harshit", "Cart page, checkout page, order total testing, purchase flow checking"],
    ["Suman", "Profile page, settings/privacy UI, screenshot support, feature testing"],
    ["Sandeep", "Core development, Java/XML integration, navigation, login/register, cart, checkout, final testing, documentation, coordination"]
  ];
  s.addTable(table, {
    x: 0.62, y: 1.92, w: 12.0, h: 4.35,
    border: { type: "solid", color: C.line, pt: 0.8 },
    fontFace: "Aptos",
    fontSize: 10.3,
    color: C.text,
    fill: { color: C.white },
    margin: 0.07,
    colW: [1.65, 10.35],
    autoFit: false,
    valign: "mid",
    bold: false
  });
  s.addShape(pptx.ShapeType.rect, { x: 0.62, y: 1.92, w: 12.0, h: 0.48, fill: { color: C.navy, transparency: 0 }, line: { color: C.navy } });
  s.addText("Member", { x: 0.75, y: 2.07, w: 1.2, h: 0.15, fontSize: 9.5, bold: true, color: C.white, margin: 0 });
  s.addText("Contribution", { x: 2.35, y: 2.07, w: 2.2, h: 0.15, fontSize: 9.5, bold: true, color: C.white, margin: 0 });
}

contributionSlide("Sandeep", "Core development, integration, coordination", [
  "Built the main Java/XML structure and navigation flow",
  "Implemented login, registration, cart, checkout, and purchase flow logic",
  "Connected screens with Intent-based navigation and app state handling",
  "Completed final testing, report documentation, and project coordination"
], ["Home / navigation screen", "Login or registration screen", "Cart or checkout logic", "Final testing evidence"]);

contributionSlide("Harshit", "Cart, checkout, totals, purchase flow", [
  "Worked on cart page layout and product quantity controls",
  "Checked order total calculations and cart item display",
  "Supported checkout page testing and purchase flow validation",
  "Verified that placed orders move into purchase history"
], ["Cart page with product items", "Checkout form with shipping details", "Order total / place order flow", "Purchase confirmation"]);

contributionSlide("Rabin", "Product detail, search, quantity selector", [
  "Worked on product detail screen structure",
  "Supported type-ahead search feature and filtering behavior",
  "Checked quantity selector and add-to-cart testing",
  "Helped test product browsing and navigation from product cards"
], ["Product detail page", "Search suggestions dropdown", "Quantity selector", "Add-to-cart testing"]);

contributionSlide("Suman", "Profile, privacy/settings, support testing", [
  "Worked on profile page design and edit options",
  "Supported settings/privacy page UI and simple privacy explanation",
  "Assisted with screenshot collection and layout checks",
  "Completed light coding support and feature testing"
], ["Profile edit screen", "Settings / privacy screen", "Screenshot collection evidence", "Feature testing notes"]);

// Subani slide without screenshot placeholders as requested
{
  const s = pptx.addSlide();
  addBg(s, "Subani KC's Contribution", "Home page design and product browsing");
  bullet(s, [
    "Designed the home page structure and product category layout",
    "Worked on product card presentation and branding consistency",
    "Supported product browsing page testing",
    "Checked that the first screen clearly communicates the Sportix store identity"
  ], 0.8, 2.1, 6.2, 15, 0.55);
  s.addShape(pptx.ShapeType.roundRect, { x: 8.25, y: 2.05, w: 3.25, h: 2.7, rectRadius: 0.12, fill: { color: C.light }, line: { color: C.line } });
  addLogo(s, 9.13, 2.38, 1.5, 1.05);
  s.addText("Home Page and Branding", { x: 8.45, y: 3.82, w: 2.85, h: 0.38, fontSize: 16, bold: true, align: "center", color: C.text, margin: 0 });
  s.addText("Screenshot section intentionally left for later Subani update.", { x: 7.55, y: 5.55, w: 4.6, h: 0.38, fontSize: 12, color: C.muted, align: "center", margin: 0 });
}

// Slide 11
{
  const s = pptx.addSlide();
  addBg(s, "Search and Product Browsing", "Key ecommerce feature");
  s.addText("The app includes product browsing with category navigation and a type-ahead search field. As the user types, matching product and category suggestions appear, allowing faster access to items.", {
    x: 0.62, y: 1.95, w: 5.6, h: 0.9, fontSize: 16, color: C.text, margin: 0, fit: "shrink"
  });
  bullet(s, [
    "Search by product name, category, or product information",
    "Typed suggestions support faster product discovery",
    "Selecting a product can open the product detail screen",
    "Product page filtering reduces messy scrolling"
  ], 0.7, 3.25, 5.3, 12.8, 0.44);
  screenshotBox(s, "Type-ahead search suggestions", 6.9, 1.92, 5.1, 2.0);
  screenshotBox(s, "Filtered product browsing page", 6.9, 4.25, 5.1, 2.0);
}

// Slide 12
{
  const s = pptx.addSlide();
  addBg(s, "Privacy, Consent, and Data Handling", "Rubric alignment");
  const items = [
    ["Intent", "Collect only details needed for account, checkout, and order history."],
    ["Consent", "Customer enters information knowingly through registration/profile/checkout forms."],
    ["Minimisation", "No unnecessary sensitive data is requested for the assessment prototype."],
    ["User control", "Profile screen supports editing name, email, and password."],
    ["Retention", "Purchase history is shown for recent orders to meet the six-month requirement."]
  ];
  items.forEach((it, i) => {
    const y = 1.92 + i * 0.82;
    s.addText(it[0], { x: 0.7, y, w: 1.65, h: 0.28, fontSize: 13, bold: true, color: C.orange, margin: 0 });
    s.addText(it[1], { x: 2.25, y, w: 9.2, h: 0.28, fontSize: 12.5, color: C.text, margin: 0 });
  });
  s.addText("This supports the rubric requirement for intent, data sharing, consent, GDPR awareness, and privacy-by-design thinking.", { x: 0.75, y: 6.35, w: 11.4, h: 0.3, fontSize: 12.5, bold: true, color: C.navy, margin: 0 });
}

// Slide 13
{
  const s = pptx.addSlide();
  addBg(s, "Testing and Demonstration Readiness", "Individual demonstration focus");
  const checks = [
    "Navigate home, product, cart, checkout, profile, settings, and history pages",
    "Explain personal contribution and how each page meets the assessment requirements",
    "Demonstrate login/register before adding items to cart or placing an order",
    "Show cart quantity updates, order total, checkout validation, and purchase history",
    "Answer questions about Java/XML implementation, Intents, privacy, and data handling"
  ];
  bullet(s, checks, 0.75, 2.05, 10.8, 14, 0.52);
  s.addShape(pptx.ShapeType.roundRect, { x: 0.75, y: 5.45, w: 11.5, h: 0.7, rectRadius: 0.08, fill: { color: C.navy }, line: { color: C.navy } });
  s.addText("Demonstration goal: navigate smoothly, explain clearly, and connect every screen back to the rubric.", { x: 1.0, y: 5.68, w: 11.0, h: 0.22, fontSize: 13.5, bold: true, color: C.white, align: "center", margin: 0 });
}

// Slide 14
{
  const s = pptx.addSlide();
  s.background = { color: C.light };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.18, fill: { color: C.orange }, line: { color: C.orange } });
  addLogo(s, 0.8, 0.85, 1.35, 1.1);
  s.addText("Conclusion", { x: 0.8, y: 2.35, w: 5.0, h: 0.65, fontSize: 36, bold: true, color: C.text, margin: 0 });
  s.addText("Sportix demonstrates a complete ecommerce Android prototype with product browsing, account access, cart management, checkout, purchase history, and privacy-aware customer data handling.", {
    x: 0.85, y: 3.25, w: 7.2, h: 1.05, fontSize: 17, color: C.text, fit: "shrink", margin: 0
  });
  bullet(s, [
    "Meets the required pages and core assessment functions",
    "Shows individual contribution across design, coding, testing, and reporting",
    "Ready for demonstration with screenshots and user manual evidence"
  ], 0.9, 4.75, 6.5, 13.5, 0.44);
  s.addText("Thank you", { x: 9.35, y: 5.85, w: 2.5, h: 0.42, fontSize: 24, bold: true, color: C.orange, align: "center", margin: 0 });
}

const out = "C:/Users/uzsan/Downloads/Sportix_Assessment_4_Presentation.pptx";
pptx.writeFile({ fileName: out });
console.log(out);
