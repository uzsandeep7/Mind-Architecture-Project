const pptxgen = require("pptxgenjs");
const fs = require("fs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Sportix Group";
pptx.subject = "ICT372 Assessment 4 Sportix Group Presentation";
pptx.title = "Sportix App - Overall and Individual Contributions";
pptx.company = "KOI";
pptx.lang = "en-AU";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-AU"
};

const C = {
  navy: "06182F",
  orange: "FF4F00",
  blue: "E8F5FF",
  pale: "F8FCFF",
  white: "FFFFFF",
  text: "0D1B2F",
  muted: "53647A",
  line: "B9CADB",
  green: "0B7F6A"
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
    slide.addText("S", { x, y: y + 0.05, w, h: h - 0.1, fontSize: 30, bold: true, italic: true, align: "center", color: C.white, margin: 0 });
  }
}

function header(slide, title, subtitle = "") {
  slide.background = { color: C.pale };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.18, fill: { color: C.orange }, line: { color: C.orange } });
  addLogo(slide, 0.45, 0.34, 0.65, 0.45);
  slide.addText("Sportix Android App", { x: 1.18, y: 0.42, w: 3.0, h: 0.2, fontSize: 9, bold: true, color: C.orange, margin: 0 });
  slide.addText(title, { x: 0.58, y: 0.98, w: 10.8, h: 0.52, fontSize: 25, bold: true, color: C.text, margin: 0 });
  if (subtitle) slide.addText(subtitle, { x: 0.6, y: 1.47, w: 8.8, h: 0.26, fontSize: 11.5, color: C.muted, margin: 0 });
  slide.addShape(pptx.ShapeType.line, { x: 0.6, y: 1.85, w: 12.1, h: 0, line: { color: C.line, width: 1 } });
}

function bulletList(slide, items, x, y, w, fs = 13.5, gap = 0.43) {
  items.forEach((item, i) => {
    const yy = y + i * gap;
    slide.addShape(pptx.ShapeType.ellipse, { x, y: yy + 0.08, w: 0.09, h: 0.09, fill: { color: C.orange }, line: { color: C.orange } });
    slide.addText(item, { x: x + 0.18, y: yy, w, h: 0.25, fontSize: fs, color: C.text, margin: 0, fit: "shrink" });
  });
}

function label(slide, text, x, y, w, color = C.orange) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h: 0.34, rectRadius: 0.08, fill: { color }, line: { color } });
  slide.addText(text, { x, y: y + 0.065, w, h: 0.16, fontSize: 8.5, bold: true, align: "center", color: C.white, margin: 0 });
}

function screenshotPlaceholder(slide, text, x, y, w, h) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.08,
    fill: { color: C.white },
    line: { color: C.line, width: 1.1, dash: "dash" }
  });
  slide.addText("Screenshot Placeholder", { x: x + 0.18, y: y + 0.23, w: w - 0.36, h: 0.25, fontSize: 12.5, bold: true, color: C.muted, align: "center", margin: 0 });
  slide.addText(text, { x: x + 0.25, y: y + h / 2 - 0.18, w: w - 0.5, h: 0.38, fontSize: 12.5, bold: true, color: C.text, align: "center", margin: 0, fit: "shrink" });
  slide.addText("Add app screenshot here", { x: x + 0.2, y: y + h - 0.45, w: w - 0.4, h: 0.18, fontSize: 8.5, color: C.muted, align: "center", margin: 0 });
}

function twoColumnSlide(title, subtitle, leftTitle, leftItems, rightTitle, rightItems) {
  const s = pptx.addSlide();
  header(s, title, subtitle);
  s.addText(leftTitle, { x: 0.72, y: 2.17, w: 4.6, h: 0.3, fontSize: 16, bold: true, color: C.orange, margin: 0 });
  bulletList(s, leftItems, 0.78, 2.72, 5.15, 12.8, 0.48);
  s.addText(rightTitle, { x: 6.95, y: 2.17, w: 4.6, h: 0.3, fontSize: 16, bold: true, color: C.navy, margin: 0 });
  bulletList(s, rightItems, 7.0, 2.72, 5.2, 12.8, 0.48);
  return s;
}

function memberSlides(member) {
  let s = pptx.addSlide();
  header(s, `${member.name}: Role and Contribution`, member.role);
  s.addText("Main responsibilities", { x: 0.72, y: 2.08, w: 4.2, h: 0.3, fontSize: 16, bold: true, color: C.orange, margin: 0 });
  bulletList(s, member.responsibilities, 0.78, 2.55, 5.7, 12.5, 0.45);
  s.addText("Why this part matters", { x: 7.0, y: 2.08, w: 4.2, h: 0.3, fontSize: 16, bold: true, color: C.navy, margin: 0 });
  bulletList(s, member.impact, 7.05, 2.55, 4.8, 12.5, 0.45);
  s.addShape(pptx.ShapeType.roundRect, { x: 7.0, y: 5.35, w: 4.95, h: 0.6, rectRadius: 0.06, fill: { color: C.blue }, line: { color: C.line } });
  s.addText(member.summary, { x: 7.2, y: 5.55, w: 4.55, h: 0.18, fontSize: 10.5, bold: true, color: C.text, align: "center", margin: 0, fit: "shrink" });

  s = pptx.addSlide();
  header(s, `${member.name}: Screen / Feature Explanation`, "Explain the main app feature connected to this contribution");
  s.addText(member.featureTitle, { x: 0.72, y: 2.08, w: 4.8, h: 0.35, fontSize: 18, bold: true, color: C.orange, margin: 0 });
  bulletList(s, member.featurePoints, 0.78, 2.63, 5.55, 12.8, 0.45);
  screenshotPlaceholder(s, member.shots[0], 7.0, 2.15, 4.85, 3.1);
  s.addText(member.featureNote, { x: 7.05, y: 5.62, w: 4.75, h: 0.45, fontSize: 11.5, color: C.muted, align: "center", margin: 0, fit: "shrink" });

  s = pptx.addSlide();
  header(s, `${member.name}: Files, Testing, and Evidence`, "Mention file names and how the part was tested");
  s.addText("Files / screens explained", { x: 0.72, y: 2.08, w: 4.5, h: 0.3, fontSize: 16, bold: true, color: C.orange, margin: 0 });
  bulletList(s, member.files, 0.78, 2.55, 5.6, 12.5, 0.45);
  s.addText("Testing checks", { x: 7.0, y: 2.08, w: 4.2, h: 0.3, fontSize: 16, bold: true, color: C.navy, margin: 0 });
  bulletList(s, member.testing, 7.05, 2.55, 4.9, 12.5, 0.45);

  s = pptx.addSlide();
  header(s, `${member.name}: Demonstration Explanation`, "Use these points while presenting your part");
  screenshotPlaceholder(s, member.shots[0], 0.75, 2.15, 3.55, 2.0);
  screenshotPlaceholder(s, member.shots[1], 4.85, 2.15, 3.55, 2.0);
  screenshotPlaceholder(s, member.shots[2], 8.95, 2.15, 3.55, 2.0);
  s.addText("What to say in demo", { x: 0.82, y: 4.65, w: 3.2, h: 0.28, fontSize: 15.5, bold: true, color: C.orange, margin: 0 });
  bulletList(s, member.demo, 0.9, 5.08, 11.3, 12.2, 0.36);
}

// Cover
{
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.navy }, line: { color: C.navy } });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.2, fill: { color: C.orange }, line: { color: C.orange } });
  addLogo(s, 0.85, 0.75, 1.55, 1.25);
  s.addText("Sportix", { x: 0.85, y: 2.38, w: 5.2, h: 0.75, fontSize: 42, bold: true, color: C.white, margin: 0 });
  s.addText("Overall App Presentation and Individual Contributions", { x: 0.88, y: 3.22, w: 8.1, h: 0.4, fontSize: 18, color: "DDEBFA", margin: 0 });
  s.addText("ICT372 Mobile Computing | Assessment 4", { x: 0.9, y: 4.05, w: 5.2, h: 0.3, fontSize: 12.5, bold: true, color: C.orange, margin: 0 });
  label(s, "Android Studio", 7.0, 6.15, 1.5, C.orange);
  label(s, "Java", 8.75, 6.15, 0.9, C.green);
  label(s, "XML", 9.9, 6.15, 0.9, C.orange);
  label(s, "eCommerce", 11.05, 6.15, 1.25, C.green);
}

twoColumnSlide(
  "Overall App Overview",
  "Sportix is a sports accessories ecommerce app for smartphone/tablet users.",
  "Business idea",
  [
    "Sportix sells sports gear and accessories in one mobile store.",
    "The app is inspired by real sports retailers such as Rebel.",
    "Customers can browse products before logging in.",
    "Login is required before adding to cart or placing an order."
  ],
  "Assessment feature coverage",
  [
    "Registration and login pages",
    "Home and products browsing pages",
    "Product detail page with quantity selector",
    "Type-ahead search suggestions",
    "Cart, checkout, and purchase history",
    "Profile and settings/privacy options"
  ]
);

{
  const s = pptx.addSlide();
  header(s, "Overall App Flow", "How customers move through the Sportix app");
  const steps = ["Browse products", "Search or filter", "Open detail page", "Login / register", "Add to cart", "Checkout", "Past orders"];
  steps.forEach((step, i) => {
    const x = 0.65 + i * 1.72;
    const color = i % 2 === 0 ? C.orange : C.navy;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 2.45, w: 1.35, h: 0.82, rectRadius: 0.08, fill: { color }, line: { color } });
    s.addText(step, { x: x + 0.08, y: 2.68, w: 1.19, h: 0.22, fontSize: 8.8, bold: true, align: "center", color: C.white, margin: 0, fit: "shrink" });
    if (i < steps.length - 1) s.addShape(pptx.ShapeType.line, { x: x + 1.38, y: 2.86, w: 0.32, h: 0, line: { color: C.line, width: 2, beginArrowType: "none", endArrowType: "triangle" } });
  });
  bulletList(s, [
    "Guest users can explore products without account friction.",
    "Secure actions such as cart and checkout require login.",
    "Order placement creates a clear purchase history for demonstration.",
    "The flow supports smooth individual demonstration in Week 12."
  ], 1.0, 4.35, 10.7, 13.5, 0.45);
}

twoColumnSlide(
  "Tools and Development Method",
  "Traditional Android Studio project using Java and XML.",
  "Tools used",
  [
    "Android Studio for project setup, preview, emulator testing, and source files",
    "Java for activity logic, navigation, validation, cart, checkout, and state",
    "XML for separate page layouts and reusable drawable styles",
    "Drawable resources for logo, buttons, backgrounds, inputs, and product images"
  ],
  "Design approach",
  [
    "Sportix orange/navy branding across screens",
    "Top navigation for Home, Products, Cart, Profile, Orders, and Settings",
    "Card-based products for a clean ecommerce feel",
    "Simple privacy-aware profile and checkout data handling"
  ]
);

const members = [
  {
    name: "Sandeep",
    role: "Main core development, Java/XML integration, navigation, login/register, cart, checkout, final testing, documentation, and coordination",
    responsibilities: [
      "Created the main application structure and connected pages together.",
      "Implemented navigation between home, products, detail, cart, checkout, history, login, register, profile, and settings.",
      "Integrated Java activity logic with XML layouts.",
      "Managed final testing, documentation, and project coordination."
    ],
    impact: [
      "Core integration makes the app behave like one complete system.",
      "Navigation helps users move smoothly between shopping steps.",
      "Login protection supports cart and checkout requirements.",
      "Final testing reduces errors before demonstration."
    ],
    featureTitle: "Core navigation and full purchase flow",
    featurePoints: [
      "The app begins with browsing so customers can view products first.",
      "Login and registration are used before cart and checkout actions.",
      "Intent navigation connects the main pages in a traditional Android style.",
      "Cart, checkout, and history work together as the main purchase flow."
    ],
    featureNote: "This is the main structure that connects all other member contributions.",
    files: [
      "MainActivity.java and activity_home.xml",
      "LoginActivity.java and RegisterActivity.java",
      "CartActivity.java and CheckoutActivity.java",
      "BaseActivity.java, SportixStore.java, and navigation logic"
    ],
    testing: [
      "Checked page navigation from every top menu button.",
      "Tested login/register before cart and checkout actions.",
      "Verified cart total, checkout validation, and order history.",
      "Reviewed final app flow for demonstration readiness."
    ],
    summary: "Core integration and final project coordination.",
    shots: ["Home/navigation screen", "Login or register screen", "Cart and checkout screen"],
    demo: [
      "Explain that the app opens for browsing first, then requires login for cart and checkout.",
      "Show how Java activities use Intent navigation between each screen.",
      "Demonstrate cart updates, checkout validation, order placement, and past order flow.",
      "Mention final testing and documentation work completed for submission."
    ]
  },
  {
    name: "Subani KC",
    role: "Home page design, product category layout, product cards, branding, and page testing",
    responsibilities: [
      "Designed the home page layout and first user impression.",
      "Organised product categories for easier browsing.",
      "Helped create the reusable product card style.",
      "Applied consistent Sportix branding, logo, colours, and visual presentation."
    ],
    impact: [
      "The home page gives users a clear first impression.",
      "Categories reduce messy scrolling and improve browsing.",
      "Product cards make prices and items easy to compare.",
      "Branding makes the app look consistent and commercial."
    ],
    featureTitle: "Home page, product categories, and cards",
    featurePoints: [
      "The home page highlights products and sale items.",
      "Categories are arranged so users can find sports gear quickly.",
      "Each card shows product image, product name, category, and price.",
      "The visual design follows the Sportix logo colours."
    ],
    featureNote: "This part focuses on user interface design and product presentation.",
    files: [
      "activity_home.xml",
      "activity_products.xml",
      "row_product.xml",
      "sportix_card.xml, sportix_button.xml, sportix_background.xml"
    ],
    testing: [
      "Checked home page spacing and product card readability.",
      "Reviewed product category names and ordering.",
      "Checked logo, colours, and button style consistency.",
      "Tested that the design remains readable on a phone screen."
    ],
    summary: "Home page, categories, cards, branding, and UI testing.",
    shots: ["Home page design", "Category/product browsing layout", "Product card and branding evidence"],
    demo: [
      "Explain how the home page shows featured and sale products clearly.",
      "Show how categories help customers find items faster.",
      "Describe how product cards show image, name, category, and price.",
      "Mention drawable image organisation and consistency across pages."
    ]
  },
  {
    name: "Rabin",
    role: "Product detail page, search feature, quantity selector, and add-to-cart testing",
    responsibilities: [
      "Worked on the product detail screen and product information display.",
      "Supported the search feature and type-ahead suggestion behaviour.",
      "Checked the quantity selector for increasing and decreasing product quantity.",
      "Tested add-to-cart behaviour from the product detail page."
    ],
    impact: [
      "Product detail helps customers understand an item before buying.",
      "Type-ahead search makes products easier and faster to find.",
      "Quantity selection supports realistic ecommerce behaviour.",
      "Add-to-cart testing proves the product flow works."
    ],
    featureTitle: "Product detail and type-ahead search",
    featurePoints: [
      "Users can search by product name, category, or product information.",
      "Suggestions appear while typing so users can select faster.",
      "The detail page shows image, name, category, price, and description.",
      "Quantity buttons let users choose how many items to add."
    ],
    featureNote: "This part directly supports the search and product detail requirements.",
    files: [
      "DetailActivity.java and activity_detail.xml",
      "ProductsActivity.java and activity_products.xml",
      "Search box and suggestion handling",
      "Quantity plus/minus button testing"
    ],
    testing: [
      "Typed product names to check suggestions appear.",
      "Selected product suggestions and checked detail navigation.",
      "Tested plus and minus quantity buttons.",
      "Checked add-to-cart behaviour with login requirement."
    ],
    summary: "Product detail, search, quantity, and add-to-cart testing.",
    shots: ["Product detail screen", "Type-ahead search suggestion", "Quantity selector and add-to-cart"],
    demo: [
      "Search for a product and select a suggestion.",
      "Open the product detail page and explain the product information shown.",
      "Use the plus and minus buttons to change quantity.",
      "Attempt add-to-cart and explain why login is required for purchase actions."
    ]
  },
  {
    name: "Harshit",
    role: "Cart page, checkout page, order total testing, and purchase flow checking",
    responsibilities: [
      "Worked on cart page display and item quantity checks.",
      "Supported checkout page layout and required customer information fields.",
      "Tested order totals after quantity changes.",
      "Checked the full purchase flow from cart to past orders."
    ],
    impact: [
      "Cart display lets users review products before buying.",
      "Quantity updates make order totals accurate.",
      "Checkout validation prevents incomplete orders.",
      "Purchase flow testing proves the app meets ecommerce requirements."
    ],
    featureTitle: "Cart, checkout, and order total",
    featurePoints: [
      "The cart shows selected products with image, price, and quantity.",
      "Users can increase or decrease quantity before checkout.",
      "Checkout requires shipping and card information before placing order.",
      "After order placement, the order is shown in purchase history."
    ],
    featureNote: "This part demonstrates the main buying process of the app.",
    files: [
      "CartActivity.java and activity_cart.xml",
      "CheckoutActivity.java and activity_checkout.xml",
      "row_cart_item.xml",
      "Order total and place order testing"
    ],
    testing: [
      "Added products to cart and checked item display.",
      "Changed quantity and verified total cost update.",
      "Submitted checkout with missing fields to test validation.",
      "Placed order and checked purchase history."
    ],
    summary: "Cart, checkout, totals, and purchase flow checking.",
    shots: ["Cart with product items", "Checkout form and payment fields", "Order total / purchase history result"],
    demo: [
      "Show cart items with product image, price, quantity, and total.",
      "Update quantity and explain how the total changes.",
      "Open checkout and explain required shipping and card fields.",
      "Place an order and show that it appears in purchase history."
    ]
  },
  {
    name: "Suman",
    role: "Profile page design, settings/privacy page UI, screenshot support, and feature testing",
    responsibilities: [
      "Worked on profile page design and customer detail editing.",
      "Supported settings and privacy page UI.",
      "Assisted with screenshot collection for the report and presentation.",
      "Completed light coding support, layout checks, and feature testing."
    ],
    impact: [
      "Profile editing gives customers control over account details.",
      "Settings/privacy page supports the rubric privacy requirement.",
      "Screenshot support helps the final report and presentation evidence.",
      "Feature testing improves demonstration confidence."
    ],
    featureTitle: "Profile editing and settings/privacy",
    featurePoints: [
      "The profile page allows users to edit name, email, and password.",
      "Each update action is separated so it is easy to explain.",
      "Settings page explains privacy and customer data handling.",
      "Screenshots and checks support the final submission."
    ],
    featureNote: "This part supports account management, privacy, and report evidence.",
    files: [
      "ProfileActivity.java and activity_profile.xml",
      "SettingsActivity.java and activity_settings.xml",
      "Profile update buttons for name, email, and password",
      "Screenshot and feature testing notes"
    ],
    testing: [
      "Checked profile update fields and buttons.",
      "Reviewed settings/privacy page text and layout.",
      "Collected screenshots for evidence.",
      "Completed light feature testing and formatting checks."
    ],
    summary: "Profile, settings/privacy, screenshot support, and testing.",
    shots: ["Profile page edit options", "Settings/privacy screen", "Testing/screenshot evidence"],
    demo: [
      "Show profile page and explain separate edit/update options.",
      "Explain settings/privacy page and why privacy matters for customer data.",
      "Mention screenshot collection and support work for submission.",
      "Summarise light coding support and testing contribution."
    ]
  }
];

members.forEach(memberSlides);

{
  const s = pptx.addSlide();
  header(s, "Final Demonstration Plan", "What the group should show in the individual demo");
  bulletList(s, [
    "Start on the home page and explain Sportix business idea.",
    "Use search suggestions and category browsing to find a product.",
    "Open product detail, change quantity, and add item to cart after login.",
    "Show cart quantity update, total cost, checkout required fields, and card payment logic.",
    "Place order and open purchase history.",
    "Show profile edit options and settings/privacy page.",
    "Each member explains their own two slides and their practical app contribution."
  ], 0.9, 2.15, 11.2, 13.2, 0.43);
}

{
  const s = pptx.addSlide();
  s.background = { color: C.blue };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.18, fill: { color: C.orange }, line: { color: C.orange } });
  addLogo(s, 0.85, 0.78, 1.25, 1.0);
  s.addText("Conclusion", { x: 0.85, y: 2.22, w: 5.0, h: 0.62, fontSize: 36, bold: true, color: C.text, margin: 0 });
  s.addText("Sportix meets the Assessment 4 requirements by presenting a complete ecommerce Android prototype with browsing, search, account access, cart, checkout, purchase history, profile editing, and privacy-aware settings.", {
    x: 0.9, y: 3.18, w: 7.9, h: 1.0, fontSize: 16.5, color: C.text, fit: "shrink", margin: 0
  });
  bulletList(s, [
    "The app demonstrates functionality, design quality, privacy awareness, and teamwork.",
    "Individual slides show each member's contribution clearly for marking evidence.",
    "Screenshot placeholders can be replaced with final app screenshots before submission."
  ], 0.95, 4.75, 9.0, 13.2, 0.42);
  s.addText("Thank you", { x: 9.75, y: 5.85, w: 2.4, h: 0.36, fontSize: 23, bold: true, color: C.orange, align: "center", margin: 0 });
}

const out = "C:/Users/uzsan/Downloads/Sportix_All_Members_App_Presentation.pptx";
pptx.writeFile({ fileName: out });
console.log(out);
