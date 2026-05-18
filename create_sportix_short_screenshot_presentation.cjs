const pptxgen = require("pptxgenjs");
const fs = require("fs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Sportix Group";
pptx.title = "Sportix Short Group Presentation";
pptx.subject = "ICT372 Assessment 4";
pptx.lang = "en-AU";
pptx.theme = { headFontFace: "Aptos Display", bodyFontFace: "Aptos", lang: "en-AU" };

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

const logoPath = [
  "C:/Users/uzsan/Downloads/Logo.png",
  "C:/Users/uzsan/AndroidStudioProjects/Sportix App/app/src/main/res/drawable/sportix_logo.png",
  "C:/Users/uzsan/AndroidStudioProjects/Sportix/app/src/main/res/drawable/sportix_logo.png"
].find((p) => fs.existsSync(p));

function logo(slide, x, y, w, h) {
  if (logoPath) slide.addImage({ path: logoPath, x, y, w, h });
}

function header(slide, title, subtitle = "") {
  slide.background = { color: C.pale };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.18, fill: { color: C.orange }, line: { color: C.orange } });
  logo(slide, 0.55, 0.32, 0.68, 0.46);
  slide.addText("Sportix", { x: 1.32, y: 0.44, w: 1.5, h: 0.2, fontSize: 10, bold: true, color: C.orange, margin: 0 });
  slide.addText(title, { x: 0.65, y: 1.02, w: 10.7, h: 0.5, fontSize: 27, bold: true, color: C.text, margin: 0 });
  if (subtitle) slide.addText(subtitle, { x: 0.67, y: 1.55, w: 9.4, h: 0.25, fontSize: 12, color: C.muted, margin: 0 });
}

function bullets(slide, items, x, y, w) {
  items.forEach((item, i) => {
    const yy = y + i * 0.5;
    slide.addShape(pptx.ShapeType.ellipse, { x, y: yy + 0.1, w: 0.1, h: 0.1, fill: { color: C.orange }, line: { color: C.orange } });
    slide.addText(item, { x: x + 0.22, y: yy, w, h: 0.28, fontSize: 14.5, color: C.text, margin: 0, fit: "shrink" });
  });
}

function shot(slide, label, x, y, w, h) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.08,
    fill: { color: C.white },
    line: { color: C.line, width: 1.1, dash: "dash" }
  });
  slide.addText("Screenshot", { x: x + 0.2, y: y + 0.22, w: w - 0.4, h: 0.22, fontSize: 12, bold: true, color: C.muted, align: "center", margin: 0 });
  slide.addText(label, { x: x + 0.25, y: y + h / 2 - 0.15, w: w - 0.5, h: 0.3, fontSize: 14, bold: true, color: C.text, align: "center", margin: 0, fit: "shrink" });
}

function section(member, contribution, slideSpecs) {
  slideSpecs.forEach((spec, index) => {
    const s = pptx.addSlide();
    header(s, `${member} - ${spec.title}`, contribution);
    bullets(s, spec.points, 0.85, 2.25, 5.0);
    if (spec.shots.length === 1) {
      shot(s, spec.shots[0], 6.85, 2.05, 4.85, 3.6);
    } else {
      shot(s, spec.shots[0], 6.35, 2.05, 2.85, 2.1);
      shot(s, spec.shots[1], 9.55, 2.05, 2.85, 2.1);
      if (spec.shots[2]) shot(s, spec.shots[2], 7.95, 4.55, 2.85, 1.55);
    }
  });
}

// Cover
{
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.navy }, line: { color: C.navy } });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.2, fill: { color: C.orange }, line: { color: C.orange } });
  logo(s, 0.85, 0.82, 1.5, 1.15);
  s.addText("Sportix", { x: 0.85, y: 2.45, w: 5.2, h: 0.75, fontSize: 44, bold: true, color: C.white, margin: 0 });
  s.addText("Group Presentation", { x: 0.9, y: 3.35, w: 5.2, h: 0.35, fontSize: 18, color: "DDEBFA", margin: 0 });
  s.addText("ICT372 Mobile Computing | Assessment 4", { x: 0.92, y: 4.1, w: 5.8, h: 0.28, fontSize: 12.5, bold: true, color: C.orange, margin: 0 });
}

// Overview
{
  const s = pptx.addSlide();
  header(s, "Project Overview", "Sportix sports accessories ecommerce app");
  bullets(s, [
    "Customers browse sports gear and accessories.",
    "Login is required for cart and checkout.",
    "Main pages include home, products, detail, cart, checkout, profile, settings, and history."
  ], 0.9, 2.35, 5.8);
  shot(s, "Overall home screen", 7.05, 2.05, 4.75, 3.6);
}

// Contribution table
{
  const s = pptx.addSlide();
  header(s, "Contribution Summary", "Sandeep first, then each member page/feature");
  const rows = [
    ["Sandeep", "Main core development, Java/XML integration, navigation, login/register, cart, checkout, final testing, documentation review, and project coordination"],
    ["Subani KC", "Home page design, product category layout, product cards, branding, page testing and final screenshots for documentation"],
    ["Rabin", "Product detail page, search feature, quantity selector, add-to-cart testing"],
    ["Harshit", "Cart page, checkout page, order total testing, purchase flow checking"],
    ["Suman", "Profile page design, settings/privacy page UI and page testing"]
  ];
  rows.forEach((r, i) => {
    const y = 2.15 + i * 0.72;
    s.addShape(pptx.ShapeType.roundRect, { x: 0.8, y, w: 11.7, h: 0.5, rectRadius: 0.05, fill: { color: C.white }, line: { color: C.line } });
    s.addText(r[0], { x: 1.05, y: y + 0.14, w: 1.5, h: 0.18, fontSize: 11, bold: true, color: C.orange, margin: 0 });
    s.addText(r[1], { x: 2.55, y: y + 0.13, w: 9.5, h: 0.18, fontSize: 10.5, color: C.text, margin: 0, fit: "shrink" });
  });
}

// Overall app flow
{
  const s = pptx.addSlide();
  header(s, "Overall App Flow", "How a customer uses Sportix");
  bullets(s, [
    "Browse products first as a guest.",
    "Search or open a category to find an item.",
    "Open product detail and select quantity.",
    "Login/register before adding to cart or checkout.",
    "Place order and view it in purchase history."
  ], 0.9, 2.25, 5.8);
  shot(s, "App flow screenshot / diagram", 7.05, 2.05, 4.75, 3.6);
}

// Technology used
{
  const s = pptx.addSlide();
  header(s, "Technology Used", "Tools used to build the Android app");
  bullets(s, [
    "Android Studio for project setup and emulator testing.",
    "XML for designing each app page layout.",
    "Java for navigation, buttons, validation, and cart logic.",
    "Drawable resources for logo, product images, buttons, and backgrounds.",
    "SharedPreferences for simple local user/profile storage."
  ], 0.9, 2.25, 5.9);
  shot(s, "Android Studio / app structure screenshot", 7.05, 2.05, 4.75, 3.6);
}

// Intent, data, privacy
{
  const s = pptx.addSlide();
  header(s, "Intent, Data, and Privacy", "Privacy-aware app design");
  bullets(s, [
    "Intent: collect only details needed for account, delivery, and orders.",
    "Consent: users enter their details through registration, profile, and checkout forms.",
    "Data minimisation: no unnecessary sensitive information is requested.",
    "User control: profile page lets users update name, email, and password.",
    "Transparency: settings/privacy page explains how customer data is used."
  ], 0.9, 2.2, 6.25);
  shot(s, "Settings/privacy or profile screenshot", 7.25, 2.05, 4.45, 3.6);
}

section("Sandeep", "Main core development, Java/XML integration, navigation, login/register, cart, checkout, final testing, documentation review, and project coordination", [
  {
    title: "Main App Flow",
    points: ["Connected screens together.", "Kept navigation clear.", "Checked guest/login flow."],
    shots: ["Home page", "Navigation buttons"]
  },
  {
    title: "Login and Registration",
    points: ["Customers can create account.", "Registered users can log in.", "Login required for cart/checkout."],
    shots: ["Login screen", "Register screen"]
  },
  {
    title: "Cart and Checkout",
    points: ["Cart shows selected products.", "Checkout collects customer/payment details.", "Final testing and documentation completed."],
    shots: ["Cart screen", "Checkout screen", "Purchase history"]
  }
]);

section("Subani KC", "Home page design, product category layout, product cards, branding, page testing and final screenshots for documentation", [
  {
    title: "Home Page Design",
    points: ["Designed first screen.", "Highlighted products clearly.", "Used Sportix logo and colours."],
    shots: ["Home page screenshot"]
  },
  {
    title: "Categories and Product Cards",
    points: ["Grouped products by category.", "Cards show image, name, price.", "Tested page layout."],
    shots: ["Products/category page", "Product card layout"]
  }
]);

section("Rabin", "Product detail page, search feature, quantity selector, add-to-cart testing", [
  {
    title: "Product Detail Page",
    points: ["Shows product image and details.", "Displays price/category.", "Includes quantity selector."],
    shots: ["Product detail screenshot"]
  },
  {
    title: "Search and Add to Cart",
    points: ["Search gives suggestions while typing.", "Users can select product quickly.", "Add-to-cart flow was tested."],
    shots: ["Search suggestions", "Add-to-cart / quantity"]
  }
]);

section("Harshit", "Cart page, checkout page, order total testing, purchase flow checking", [
  {
    title: "Cart Page",
    points: ["Shows products in cart.", "Quantity can be updated.", "Total price is checked."],
    shots: ["Cart page screenshot"]
  },
  {
    title: "Checkout and Purchase Flow",
    points: ["Checkout form collects details.", "Order can be placed after required fields.", "Purchase history was checked."],
    shots: ["Checkout page", "Purchase history"]
  }
]);

section("Suman", "Profile page design, settings/privacy page UI and page testing", [
  {
    title: "Profile Page",
    points: ["Users can update name.", "Users can update email.", "Users can update password."],
    shots: ["Profile page screenshot"]
  },
  {
    title: "Settings and Testing Support",
    points: ["Settings/privacy page support.", "Helped with screenshots.", "Completed feature testing support."],
    shots: ["Settings/privacy page", "Testing screenshot/evidence"]
  }
]);

{
  const s = pptx.addSlide();
  header(s, "Conclusion", "Sportix meets the required ecommerce app features");
  bullets(s, [
    "The app includes required pages and a complete shopping flow.",
    "Each member worked on a clear page or feature.",
    "Screenshots can be added to each member slide before submission."
  ], 0.9, 2.35, 7.2);
  shot(s, "Final app screenshot / group evidence", 8.0, 2.1, 3.9, 3.2);
}

const out = "C:/Users/uzsan/Downloads/Sportix_Short_Screenshot_Presentation_UPDATED.pptx";
pptx.writeFile({ fileName: out });
console.log(out);
