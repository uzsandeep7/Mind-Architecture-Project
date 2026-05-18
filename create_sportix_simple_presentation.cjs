const pptxgen = require("pptxgenjs");
const fs = require("fs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Sportix Group";
pptx.title = "Sportix Simple Group Presentation";
pptx.subject = "ICT372 Assessment 4";
pptx.lang = "en-AU";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-AU"
};

const C = {
  navy: "07182E",
  orange: "FF4F00",
  light: "EAF6FF",
  pale: "F8FCFF",
  white: "FFFFFF",
  text: "0E1A2B",
  muted: "51627A",
  line: "B9CADB"
};

const logoCandidates = [
  "C:/Users/uzsan/Downloads/Logo.png",
  "C:/Users/uzsan/AndroidStudioProjects/Sportix App/app/src/main/res/drawable/sportix_logo.png",
  "C:/Users/uzsan/AndroidStudioProjects/Sportix/app/src/main/res/drawable/sportix_logo.png"
];
const logoPath = logoCandidates.find((p) => fs.existsSync(p));

function addLogo(slide, x, y, w, h) {
  if (logoPath) {
    slide.addImage({ path: logoPath, x, y, w, h });
  } else {
    slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: C.navy }, line: { color: C.navy } });
    slide.addText("S", { x, y: y + 0.05, w, h: h - 0.1, fontSize: 28, bold: true, color: C.white, align: "center", margin: 0 });
  }
}

function header(slide, title, subtitle = "") {
  slide.background = { color: C.pale };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.18, fill: { color: C.orange }, line: { color: C.orange } });
  addLogo(slide, 0.55, 0.32, 0.7, 0.48);
  slide.addText("Sportix", { x: 1.35, y: 0.44, w: 1.5, h: 0.22, fontSize: 10, bold: true, color: C.orange, margin: 0 });
  slide.addText(title, { x: 0.62, y: 1.02, w: 10.6, h: 0.55, fontSize: 27, bold: true, color: C.text, margin: 0 });
  if (subtitle) slide.addText(subtitle, { x: 0.65, y: 1.58, w: 9.4, h: 0.26, fontSize: 12.5, color: C.muted, margin: 0 });
}

function bullets(slide, items, x, y, w, fs = 16) {
  items.forEach((item, i) => {
    const yy = y + i * 0.58;
    slide.addShape(pptx.ShapeType.ellipse, { x, y: yy + 0.12, w: 0.11, h: 0.11, fill: { color: C.orange }, line: { color: C.orange } });
    slide.addText(item, { x: x + 0.24, y: yy, w, h: 0.34, fontSize: fs, color: C.text, margin: 0, fit: "shrink" });
  });
}

function placeholder(slide, text, x, y, w, h) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.08,
    fill: { color: C.white },
    line: { color: C.line, width: 1.1, dash: "dash" }
  });
  slide.addText("Screenshot Placeholder", { x: x + 0.25, y: y + 0.28, w: w - 0.5, h: 0.25, fontSize: 13, bold: true, color: C.muted, align: "center", margin: 0 });
  slide.addText(text, { x: x + 0.28, y: y + h / 2 - 0.18, w: w - 0.56, h: 0.34, fontSize: 14, bold: true, color: C.text, align: "center", margin: 0, fit: "shrink" });
}

function memberSlide(member, contribution, pageFocus, bulletsText, screenshotText) {
  const s = pptx.addSlide();
  header(s, member, pageFocus);
  s.addShape(pptx.ShapeType.roundRect, { x: 0.7, y: 2.12, w: 5.15, h: 0.68, rectRadius: 0.08, fill: { color: C.light }, line: { color: C.line } });
  s.addText("Contribution", { x: 0.95, y: 2.35, w: 1.6, h: 0.2, fontSize: 11, bold: true, color: C.orange, margin: 0 });
  s.addText(contribution, { x: 2.52, y: 2.28, w: 3.05, h: 0.3, fontSize: 10.5, color: C.text, margin: 0, fit: "shrink" });
  bullets(s, bulletsText, 0.88, 3.3, 4.9, 15);
  placeholder(s, screenshotText, 6.65, 2.1, 5.15, 3.55);
  s.addText("Keep this slide simple during the demo: show the page, explain what it does, then explain your testing.", {
    x: 6.75, y: 5.95, w: 4.95, h: 0.4, fontSize: 11.5, color: C.muted, align: "center", margin: 0, fit: "shrink"
  });
}

// Cover
{
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.navy }, line: { color: C.navy } });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.2, fill: { color: C.orange }, line: { color: C.orange } });
  addLogo(s, 0.85, 0.82, 1.5, 1.15);
  s.addText("Sportix", { x: 0.85, y: 2.45, w: 5.2, h: 0.75, fontSize: 44, bold: true, color: C.white, margin: 0 });
  s.addText("Android eCommerce App", { x: 0.9, y: 3.35, w: 5.2, h: 0.35, fontSize: 18, color: "DDEBFA", margin: 0 });
  s.addText("Group Presentation | ICT372 Assessment 4", { x: 0.92, y: 4.12, w: 5.6, h: 0.28, fontSize: 12.5, bold: true, color: C.orange, margin: 0 });
}

// Simple overview
{
  const s = pptx.addSlide();
  header(s, "Project Overview", "Sportix sports accessories shopping app");
  bullets(s, [
    "Customers can browse sports products and categories.",
    "Users can register/login before adding items to cart.",
    "The app includes cart, checkout, profile, settings, and purchase history.",
    "Designed using Android Studio, XML layouts, and Java logic."
  ], 0.85, 2.35, 5.7, 16);
  placeholder(s, "Overall app home screen", 7.0, 2.1, 4.8, 3.6);
}

// Contribution table
{
  const s = pptx.addSlide();
  header(s, "Group Contribution Summary", "Simple division of work");
  const rows = [
    ["Member", "Contribution"],
    ["Subani KC", "Home page design, product category layout, product cards, branding, and page testing"],
    ["Rabin", "Product detail page, search feature, quantity selector, add-to-cart testing"],
    ["Harshit", "Cart page, checkout page, order total testing, purchase flow checking"],
    ["Suman", "Profile page design, settings/privacy page UI, screenshot support, and feature testing"],
    ["Sandeep", "Main core development, Java/XML integration, navigation, login/register, cart, checkout, final testing, documentation, and project coordination"]
  ];
  s.addTable(rows, {
    x: 0.75, y: 2.05, w: 11.8, h: 4.25,
    colW: [1.55, 10.25],
    fontFace: "Aptos",
    fontSize: 10.3,
    color: C.text,
    border: { type: "solid", color: C.line, pt: 0.8 },
    fill: { color: C.white },
    margin: 0.08,
    autoFit: false
  });
  s.addShape(pptx.ShapeType.rect, { x: 0.75, y: 2.05, w: 11.8, h: 0.48, fill: { color: C.navy }, line: { color: C.navy } });
  s.addText("Member", { x: 0.9, y: 2.2, w: 1.2, h: 0.16, fontSize: 9.5, bold: true, color: C.white, margin: 0 });
  s.addText("Contribution", { x: 2.35, y: 2.2, w: 2.4, h: 0.16, fontSize: 9.5, bold: true, color: C.white, margin: 0 });
}

memberSlide(
  "Subani KC",
  "Home page, categories, product cards, branding, testing",
  "Pages: Home page and products layout",
  [
    "Designed the first screen users see.",
    "Organised products into clear categories.",
    "Kept Sportix branding consistent."
  ],
  "Home page / product card screenshot"
);

memberSlide(
  "Rabin",
  "Product detail, search, quantity selector, add-to-cart testing",
  "Pages: Product detail and search",
  [
    "Explained product details clearly.",
    "Added search support with suggestions.",
    "Tested quantity and add-to-cart flow."
  ],
  "Product detail / search screenshot"
);

memberSlide(
  "Harshit",
  "Cart, checkout, order total testing, purchase flow checking",
  "Pages: Cart and checkout",
  [
    "Checked cart items and quantities.",
    "Tested order total calculations.",
    "Checked checkout and purchase flow."
  ],
  "Cart / checkout screenshot"
);

memberSlide(
  "Suman",
  "Profile, settings/privacy UI, screenshot support, testing",
  "Pages: Profile and settings",
  [
    "Worked on profile edit options.",
    "Supported settings and privacy page.",
    "Helped with screenshots and testing."
  ],
  "Profile / settings screenshot"
);

memberSlide(
  "Sandeep",
  "Core development, navigation, login/register, cart, checkout, final testing, documentation, coordination",
  "Pages: Main app flow and core screens",
  [
    "Connected the main pages and navigation.",
    "Worked on login/register, cart, and checkout.",
    "Completed final testing and documentation."
  ],
  "Login / navigation / purchase flow screenshot"
);

// App features
{
  const s = pptx.addSlide();
  header(s, "Main App Features", "What the app demonstrates");
  bullets(s, [
    "Browse sports accessories by product and category.",
    "Search products with suggestions while typing.",
    "Add items to cart after login.",
    "Checkout with shipping and payment details.",
    "View past orders and update profile details."
  ], 0.9, 2.35, 5.8, 16);
  placeholder(s, "Feature screenshots collage", 7.05, 2.1, 4.75, 3.6);
}

// Conclusion
{
  const s = pptx.addSlide();
  s.background = { color: C.light };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.2, fill: { color: C.orange }, line: { color: C.orange } });
  addLogo(s, 0.85, 0.78, 1.35, 1.0);
  s.addText("Conclusion", { x: 0.85, y: 2.25, w: 4.6, h: 0.6, fontSize: 36, bold: true, color: C.text, margin: 0 });
  s.addText("Sportix is a basic Android ecommerce app that meets the required pages and shows clear teamwork. Each member contributed to a specific page or feature and helped test the final app.", {
    x: 0.9, y: 3.25, w: 7.6, h: 0.85, fontSize: 17, color: C.text, margin: 0, fit: "shrink"
  });
  s.addText("Thank you", { x: 9.3, y: 5.75, w: 2.5, h: 0.45, fontSize: 26, bold: true, color: C.orange, align: "center", margin: 0 });
}

const out = "C:/Users/uzsan/Downloads/Sportix_Simple_Group_Presentation.pptx";
pptx.writeFile({ fileName: out });
console.log(out);
