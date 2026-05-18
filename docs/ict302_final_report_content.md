# MIND Architecture Web Application
## ICT302 Information Technology Project 2 - Final Report

**Prepared by:**  
Sandeep Pun (20027341)  
Harshit Shrestha (20027088)  
Rabin Shrestha (20027307)  
Ahmed Malik (12301292)  
Dipesh Shahi (20028547)

**Client:** Dima Istambouli, MIND Architecture  
**Submission:** Week 11 Final Report  
**Note:** Replace the cover page details, tutor name, contribution percentages, and signature placeholders in the final submission copy.

# Executive Summary

The MIND Architecture Web Application project was undertaken as an industry-based capstone-style web development project for a real external client. The purpose of the project was to design, implement, test, and prepare for handover a professional digital platform that supports MIND Architecture’s services, including events, membership, resources, consultations, contact enquiries, and administrative management. The project was completed across two academic phases. Phase I focused on discovery, planning, analysis, and design, while Phase II focused on implementation, integration, testing, refinement, and deployment readiness.

The final implemented system was developed using React, TypeScript, Vite, Tailwind CSS, and Supabase. Stripe was integrated in developer test mode for books, premium membership, and event booking, allowing the project team to verify full payment workflows without requiring the client’s live account during development. The system now supports role-based access for public users, registered users, premium users, administrators, and the site owner. It also provides an admin dashboard for managing events, books, blog posts, users, contact messages, consultations, and order tracking. In addition, the system includes a customer-facing dashboard where users can view bookings, orders, membership status, and consultation updates.

The implementation phase involved progressively building and connecting the frontend and backend components, applying row-level security policies, deploying Supabase Edge Functions for payment-related workflows, and refining the application based on repeated testing and client updates. Particular attention was given to authentication, membership security, order handling, consultation management, and reducing placeholder or mock functionality before handover. Throughout the project, the team also maintained supporting documentation, including functional requirements, test cases, a traceability matrix, user manual materials, and weekly progress reporting.

Testing was planned and carried out using scenario-based and role-based validation. The team verified public page access, protected route behaviour, membership logic, admin restrictions, event booking, consultation handling, dashboard visibility, order management, contact messages, and Stripe test-mode flows. Most core functional areas passed testing and are ready for handover. The major remaining external dependency is the client’s live Stripe account access, which is required only to switch the already implemented payment system from test mode to live mode.

Overall, the project demonstrates a complete and practical full-stack web application outcome. The platform is functionally mature, documented, and prepared for handover. The report concludes that the project objectives were substantially achieved and that the remaining work consists mainly of client-controlled live payment activation, final content approval, and optional post-handover refinement.

# Table of Contents

[Insert automatic table of contents in Word]

# Chapter 1 - Introduction

## 1.1 Background of the Project

MIND Architecture is a leadership, resilience, and personal growth platform led by Dima Istambouli. The business focuses on emotional resilience, belonging, self-awareness, intentional growth, and professional development. Its services include consultations, events, workshops, memberships, digital resources, and educational content. Prior to this project, MIND Architecture did not have a fully integrated website capable of supporting these activities in a unified and scalable way.

The client required a digital platform that could communicate the brand professionally while also supporting operational workflows such as event promotion, consultation requests, member-only content, book purchasing, and administrative content management. The challenge was not simply to build a visually attractive website, but to create a usable system that could support real business processes and future growth.

The project was therefore defined as both a design and implementation challenge. It required understanding the client’s services and audience, turning these into technical requirements, implementing the application using a modern full-stack architecture, and preparing the result for practical handover.

## 1.2 Project Purpose

The purpose of the MIND Architecture Web Application project was to deliver a complete website solution that supports both public-facing engagement and internal management. From the user perspective, the site needed to allow visitors to explore the organisation’s services, browse resources, view events, submit enquiries, request consultations, and manage membership-related activity. From the administrative perspective, the site needed to support content control, booking oversight, order management, consultation updates, and user oversight.

The second phase of the project, which is the focus of this final report, moved from planning and design into implementation and validation. Therefore, the purpose of this phase was to build the designed solution, connect it to a secure backend, test the critical functions, and prepare the system for deployment and handover.

## 1.3 Problem Statement

Before this project, the client did not have a single cohesive platform that could combine branding, communication, booking, purchasing, and administration in one place. Manual handling of services and disconnected tools would create inefficiencies, increase administrative overhead, and reduce the overall quality of the user experience. The project had to address the following main problems:

- the lack of a unified online presence for MIND Architecture
- the absence of integrated workflows for books, events, consultations, and memberships
- the need for role-based administration and protected user areas
- the need for a scalable structure that could be activated for live payment later
- the need for a user-friendly system that the client could manage after handover

## 1.4 Project Objectives

The objectives of the project were established during Phase I and continued into Phase II. The implementation-related objectives relevant to this report were:

- to implement the core public website pages and user journeys
- to create secure authentication and role-based access control
- to implement books, events, membership, and consultation modules
- to connect the application to Supabase for real data storage and management
- to integrate Stripe in test mode for payment flows
- to build an administrative dashboard for managing system content and records
- to perform testing against functional and non-functional expectations
- to document the implementation, testing, evaluation, and handover readiness of the project

## 1.5 Scope of the Final Implementation

The scope of this final implementation phase included:

- public website pages and content presentation
- authentication and protected routes
- user dashboard
- event browsing and event booking
- books, cart, checkout, and order handling
- membership upgrade and membership management
- consultation request flow
- contact form submission and admin message viewing
- order tracking data entry and dashboard visibility
- admin content and user management
- test-mode Stripe payment integration
- final testing and deployment readiness review

The scope did not include final live payment activation, because that depends on the client’s live Stripe account access. It also did not include final professional photography or all final client branding assets, as the client indicated those would be completed closer to launch.

## 1.6 Stakeholders

The main stakeholders in the project were:

- **Client:** Dima Istambouli, representing MIND Architecture
- **End users:** public visitors, registered users, and premium members
- **Administrative users:** admin and owner roles within the system
- **Project team:** the five student group members
- **Academic stakeholders:** tutor/supervisor responsible for project evaluation

Each stakeholder group influenced different aspects of the project. The client informed business goals, content direction, and branding expectations. End users influenced usability and feature prioritisation. Admin users required maintainable management interfaces. The academic context required structured planning, documentation, testing, and traceability.

## 1.7 Report Structure

This report is organised to align with the final report rubric. Following the introduction, the report presents the implementation details in a systematic way, followed by the test plan, evaluation plan, test and evaluation results, and then the conclusion and recommendations. References and appendices are included at the end. Placeholder locations are also included where additional screenshots, meeting minutes, or externally maintained supporting files should be inserted.

# Chapter 2 - Project Implementation Details

## 2.1 Implementation Approach

The implementation phase followed an incremental and modular approach. Rather than attempting to build all site features at once, the system was developed in layers. Public-facing interfaces were established first, followed by backend connectivity, then secured role-based flows, and finally administrative and testing refinements. This approach reduced complexity and made it easier to identify and isolate bugs during development.

Although the project was academically organised across weekly milestones and sprint-like stages, the technical implementation itself was also iterative. Features were built, tested, adjusted, and retested as new client feedback or backend dependencies emerged. This reflects Agile principles of incremental delivery and feedback-driven refinement (Agile Manifesto, 2001).

The implementation process can be summarised in the following steps:

1. establish the frontend structure and reusable layout components  
2. implement the public pages and navigation system  
3. connect the application to Supabase for authentication and data storage  
4. implement protected user and admin areas  
5. add Stripe test-mode workflows through Supabase Edge Functions  
6. refine the system using testing, debugging, and client-driven changes  
7. prepare the application for deployment and handover

## 2.2 Technology Stack

The system was built using a modern web technology stack chosen for speed of development, maintainability, and suitability for a client-facing full-stack application.

### Frontend Technologies

- **React** was used as the main user interface framework because it supports component-based development and reusable UI structure (React, 2026).
- **TypeScript** was used to improve code safety, maintainability, and development clarity through typed structures.
- **Vite** was used as the frontend build and development environment because of its fast local development cycle and modern tooling support (Vite, 2026).
- **Tailwind CSS** and reusable UI components were used to create a consistent visual system and responsive layout.
- **React Router** was used for navigation and route protection across public, user, and admin pages.

### Backend Technologies

- **Supabase** was used as the backend platform to provide authentication, PostgreSQL database storage, row-level security, and serverless functions (Supabase, 2026a).
- **Supabase Edge Functions** were used to manage secure payment-related workflows, including Stripe Checkout session creation and membership portal session handling (Supabase, 2026b).

### Payment Integration

- **Stripe** was used in developer test mode to implement book checkout, event booking payments, and premium membership subscription flows (Stripe, 2026a).
- Stripe customer portal support was added for premium membership management and cancellation.

### Supporting Libraries

The project also used several supporting libraries for form handling, schema validation, notifications, animation, charts, icons, and date formatting. These included `zod`, `react-hook-form`, `date-fns`, `framer-motion`, `recharts`, `lucide-react`, and `sonner`.

## 2.3 System Architecture Overview

At a high level, the system follows a client-server structure:

- the React frontend handles user interaction and page rendering
- Supabase authentication manages login, session state, and role-aware access
- the PostgreSQL database stores content, orders, consultations, bookings, profiles, and messages
- Edge Functions handle server-side payment and membership operations
- Stripe provides external payment processing in test mode

[Insert Figure 1 here: High-level system architecture diagram]

This architecture was appropriate for the project because it enabled rapid implementation while still supporting secure server-side operations for sensitive payment and membership tasks.

## 2.4 Frontend Implementation

### 2.4.1 Public Website Pages

The frontend includes a complete public website structure designed around the client’s brand and service offering. The main public pages include:

- Home
- About
- Programs / Events
- Resources / Books
- Gallery
- Testimonials
- Insights / Blog
- Membership
- Contact
- Consultation

The public site was designed to be visually consistent and easy to navigate. Shared layout elements such as the navigation bar, footer, section containers, call-to-action buttons, and card designs were reused across pages to maintain consistency.

The Home page provides a branded introduction to MIND Architecture and routes visitors toward programs, resources, membership, consultations, and testimonials. The About page presents the founder’s mission, philosophy, and core values. The Contact and Consultation pages provide practical engagement paths rather than simply static information.

[Insert Figure 2 here: Home page screenshot]  
[Insert Figure 3 here: About page screenshot]

### 2.4.2 Authentication Page

The authentication page was implemented to support both sign-in and sign-up. The page includes:

- full name input for account creation
- email validation
- password validation with minimum complexity rules
- sign-in / sign-up switching
- Google login support when configured

During refinement, email validation was strengthened so clearly invalid values such as incomplete formats are rejected before the request reaches Supabase. This helps improve data quality and user feedback.

[Insert Figure 4 here: Authentication page screenshot]

### 2.4.3 User Dashboard

The dashboard provides a central location for authenticated users to view and manage their activity. The dashboard includes tabbed sections for:

- event bookings
- orders
- consultations
- profile settings

This area went through multiple rounds of refinement. For example:

- users can now see consultation status and time more clearly
- order tracking links appear where available
- pending book orders can be resumed if still active
- premium users can view relevant membership status information

[Insert Figure 5 here: User dashboard screenshot]

### 2.4.4 Admin Dashboard

The admin panel was built as a protected management interface for admin and owner roles. It includes separate tabs and management areas for:

- events
- books
- orders
- blog posts
- users
- messages
- consultations

The admin dashboard originally contained mock analytics and placeholder summaries during earlier development, but these were replaced or reduced as the project matured. The final structure focuses on practical administration rather than decorative placeholder content. Specific usability improvements included:

- grouping orders by meaningful statuses
- adding unread message indicators
- adding consultation management controls
- hiding tracking input for cancelled orders

[Insert Figure 6 here: Admin dashboard screenshot]  
[Insert Figure 7 here: Admin orders management screenshot]

## 2.5 Backend and Database Implementation

Supabase was used to implement the backend data layer. The database design from Phase I was adapted into working tables and relationships that support the implemented features.

Key data entities in the final system include:

- `profiles`
- `user_roles`
- `events`
- `event_bookings`
- `books`
- `cart_items`
- `orders`
- `order_items`
- `consultations`
- `contact_messages`
- `blog_posts`
- `gallery_items`

Additional migration work was completed during development to support:

- owner role handling
- admin assets bucket support
- membership fields
- order tracking fields
- membership security improvements

These migrations reflect the reality that implementation often reveals requirements more precisely than design alone. For example, order tracking and membership security were strengthened after the core purchase and premium workflows were working.

## 2.6 Authentication, Roles, and Security

Authentication and role-based access control were central to the project because the platform supports different user types with different permissions.

### 2.6.1 User Roles

The system supports:

- anonymous/public visitors
- registered free users
- premium users
- admin users
- owner users

Role restrictions were applied to:

- dashboard access
- admin dashboard access
- premium content visibility
- membership management
- admin-level updates

### 2.6.2 Row-Level Security

Supabase row-level security (RLS) policies were used to protect user data and restrict access to appropriate records. These policies ensure, for example, that:

- users can view only their own bookings, orders, and consultations
- public users cannot access restricted content records
- admins can manage contact messages and consultation updates
- only approved backend paths can change sensitive membership fields

One important security refinement involved `membership_tier`. During pre-launch review, it became clear that a normal user should not be able to self-upgrade membership through direct profile modification. This was addressed by updating the database policy design so that normal users cannot change their own `membership_tier`, while paid upgrades through the server-side Stripe flow still work correctly.

This was a significant improvement in production readiness because it moved premium access control from a mostly UI-level assumption to an enforced backend rule.

## 2.7 Books, Cart, and Order Flow

The books and orders module became one of the most substantial features in the system. It includes:

- public browsing of books/resources
- search and filtering
- cart management
- checkout
- pending order handling
- tracking support
- dashboard visibility
- admin tracking updates

### 2.7.1 Books Page

The books/resources page allows users to browse available resources, search by keyword, and see book details. Premium pricing can also be shown where relevant.

### 2.7.2 Cart and Checkout

Authenticated users can add items to cart and proceed to checkout. Checkout creates a pending order first, then directs the user to Stripe test checkout. If the payment succeeds, the order is marked paid. If payment is abandoned, the order remains pending until the expiry logic cancels it.

### 2.7.3 Pending Order Logic

An important real-world improvement was the implementation of pending order expiry and recovery:

- incomplete orders remain pending temporarily
- users can resume active pending orders
- expired pending orders are cancelled automatically
- admin views reflect the same status behaviour

This makes the ordering workflow more realistic and operationally cleaner.

### 2.7.4 Tracking

For physical book orders, tracking fields were added so admin users can save:

- tracking number
- carrier
- tracking URL

The user dashboard then presents the tracking link if it exists. Australia Post was used as the default carrier model for the initial implementation.

[Insert Figure 8 here: Books page screenshot]  
[Insert Figure 9 here: Checkout and order dashboard screenshot]

## 2.8 Events and Event Booking

The events module supports both promotion and booking workflows. It includes:

- events listing
- event detail pages
- event categories
- booking flow
- member pricing or members-only logic where applicable
- dashboard visibility for completed bookings

Stripe test mode was integrated for event booking payment. The frontend and backend work together so that the event booking is saved only when the correct payment flow is completed.

The event booking area also required row-level security and server-side handling because bookings involve user identity, event relationship data, and payment-linked status changes.

## 2.9 Membership and Subscription Management

The membership system was built around a free versus premium model. It includes:

- membership plan display
- premium upgrade flow
- member pricing logic
- premium feature access
- membership portal management
- dashboard membership status display

### 2.9.1 Upgrade Flow

The premium upgrade flow uses Stripe test-mode subscription checkout. After successful payment verification, the user’s membership is upgraded in the system.

### 2.9.2 Membership Management

A customer portal session function was added so premium users can manage their subscription through Stripe’s portal. This supports cancellation and billing management in a more professional way than building a fragile custom cancellation flow under time constraints.

### 2.9.3 Membership Status Display

The dashboard and profile flow were also improved to show relevant membership timing information. This gives users clearer visibility into their premium status and renewal/end timing when available.

[Insert Figure 10 here: Membership page screenshot]

## 2.10 Consultation and Contact Workflows

### 2.10.1 Consultation Workflow

The consultation workflow changed significantly during refinement. Earlier versions relied on an embedded Google Calendar link, but cross-browser iframe issues made that approach less reliable and less suitable for quick finalisation. The final flow was simplified into a built-in request-based model:

- the user chooses a consultation type
- the user selects a date and time block
- the user optionally adds topic and notes
- the request is saved into the system as pending
- admin can later confirm or update the consultation
- the user can then view consultation status and timing through the dashboard

This simplified flow is cleaner, more controllable, and better suited to handover when the client’s future operational preferences are still evolving.

### 2.10.2 Contact Messages

The contact form now saves messages to the backend instead of merely simulating success. Admin and owner users can view these messages through the admin panel, and unread counts help highlight new items requiring attention.

The consultation and contact modules together help support real engagement with users without requiring heavy external tooling.

[Insert Figure 11 here: Consultation page screenshot]  
[Insert Figure 12 here: Contact page screenshot]

## 2.11 Stripe Integration in Developer Test Mode

Stripe integration was implemented in test mode so that the team could build and validate payment workflows without needing the client’s live account during development. The implemented payment functions cover:

- book checkout
- event booking checkout
- premium membership subscription checkout
- membership customer portal access
- membership status lookup

This design decision was practical because it separated system development from the client’s later live-account setup. It also enabled safe end-to-end validation during the project.

The only remaining Stripe-related step before live operation is replacing test-mode configuration with the client’s live Stripe account keys and webhook details. This dependency lies with the client rather than the development work itself.

## 2.12 Consultation of Client Content and Branding

The client provided updated content progressively during the project, including founder biography details, contact details, and revised wording. The team updated these areas while leaving unprovided sections unchanged, as requested by the client. The client also indicated that some branding and professional photography work would occur closer to launch. As a result, the implementation was structured so that content and styling can still be adjusted after handover without rewriting core system logic.

## 2.13 Group Work and Role Execution During Implementation

The project was completed as a group, but the technical contributions were not identical in type. Roles became more specialised as the project progressed:

- **Sandeep Pun** led the main development, backend integration, system refinement, Stripe test-mode flows, consultation workflow improvements, admin functionality, and overall technical direction.
- **Harshit Shrestha** focused on user-side testing, access review, and checking visible frontend behaviour.
- **Rabin Shrestha** focused on testing, display review, layout checking, and supporting validation of visible features.
- **Ahmed Malik** supported documentation, report structure, and user manual preparation.
- **Dipesh Shahi** supported documentation, report alignment, and user manual preparation.

This division of labour allowed the team to capitalise on technical development, testing, and documentation strengths in parallel. It also reflects the practical reality that full-stack implementation tasks required sustained technical ownership while other members contributed to quality assurance and reporting.

## 2.14 Deployment Readiness and Remaining Dependencies

By the final stage, the project had reached a strong handover-ready state. The major implemented modules were in place, and the main remaining items were largely external or operational:

- the client’s live Stripe account access
- final approved testimonials/content
- optional post-handover branding refinement
- live deployment configuration on the chosen hosting platform

Therefore, from a development standpoint, the project was substantially complete. The site can be handed over in test-ready form, and live payments can be activated later when the client is ready.

# Chapter 3 - Test Plan

## 3.1 Purpose of the Test Plan

The purpose of the test plan was to verify that the implemented system behaves correctly across its major functional areas and user roles. Because the project combines public content, role-based access, bookings, checkout, membership, and admin management, testing had to confirm not just isolated page rendering but end-to-end workflows.

The test plan was also intended to support deployment readiness. In other words, testing was not only used to find bugs, but also to determine whether the system had reached a sufficiently stable state for handover and future live activation.

## 3.2 Testing Objectives

The main testing objectives were:

- to verify that core public pages load correctly
- to verify that authentication works correctly
- to verify that unauthorized access is blocked
- to verify that the books/cart/order flow behaves as intended
- to verify that the event booking flow behaves as intended
- to verify that the premium membership flow behaves as intended
- to verify that consultation requests and contact messages are saved correctly
- to verify that admin-side management functions reflect user activity and stored data

## 3.3 Testing Strategy

The project used a practical combination of:

- **black-box functional testing**, where the testers checked visible behaviour without modifying internal logic
- **scenario-based workflow testing**, where testers completed realistic user journeys such as booking, checkout, dashboard review, and admin management
- **role-based access testing**, where different user roles were tested separately
- **deployment-oriented smoke testing**, where build and route protection checks were performed

This strategy was appropriate because the project is a full-stack application that depends on both visible UI behaviour and secure backend interactions.

## 3.4 Test Environment

Testing was conducted in the development environment using:

- modern browsers on Windows and macOS
- the local Vite development server
- Supabase backend services
- Stripe test-mode credentials and test cards

Where relevant, different browser behaviours were also observed. For example, the earlier consultation iframe issue on one machine confirmed that browser and embedding behaviour should be considered as part of validation.

## 3.5 Key Functional Test Areas

At least eight major functional areas were deliberately targeted for testing. In practice, testing covered far more than eight cases, but the following categories formed the core test plan:

### Test Area 1 - Registration and Authentication

The team tested:

- account creation with valid details
- invalid login credentials
- session-based redirect behaviour
- restricted dashboard access when logged out

### Test Area 2 - Role-Based Access

The team tested:

- normal user blocked from admin dashboard
- admin and owner access to management features
- premium and non-premium access differences where relevant

### Test Area 3 - Books, Cart, and Checkout

The team tested:

- book browsing
- add to cart
- quantity management
- checkout flow
- pending order behaviour
- order resumption
- cancellation after expiry

### Test Area 4 - Event Browsing and Event Booking

The team tested:

- event listing visibility
- event detail routing
- booking creation
- Stripe test-mode event payment flow
- dashboard booking visibility

### Test Area 5 - Membership Upgrade and Management

The team tested:

- premium checkout
- membership update after payment
- customer portal access
- premium/non-premium UI behaviour
- protection against manual self-upgrade

### Test Area 6 - Consultation Requests

The team tested:

- consultation type selection
- date/time slot selection
- request saving
- user dashboard consultation visibility
- admin-side consultation updates
- visible pending/confirmed state behaviour

### Test Area 7 - Contact Messages

The team tested:

- contact form submission
- message persistence in the backend
- unread count visibility in admin
- admin message review

### Test Area 8 - Admin Management and Operational Control

The team tested:

- events management
- books management
- orders grouping and tracking updates
- user membership changes
- consultation updates
- blog management visibility

## 3.6 Test Cases and Supporting Artifacts

In addition to narrative testing, detailed testing artefacts were prepared separately, including:

- a requirements workbook
- a test case workbook
- a traceability matrix workbook

These artefacts provide structured evidence of the relationship between requirements, test cases, and status outcomes.

[Insert Appendix reference here: Requirements.xlsx, Test-Cases.xlsx, Traceability-Matrix.xlsx]

## 3.7 Acceptance Criteria

The system was considered acceptable for handover when:

- the core public and protected routes worked
- authentication and role restrictions behaved correctly
- key user workflows were functioning end to end
- the admin dashboard could manage operational data
- build output was successful
- any remaining gaps were external dependencies rather than missing core development

# Chapter 4 - Evaluation Plan

## 4.1 Purpose of Evaluation

Testing confirms whether a feature works; evaluation considers whether the implemented solution is suitable, usable, and aligned with the project objectives. Therefore, the evaluation plan aimed to assess the quality of the solution more broadly than simple functional correctness.

The evaluation focused on whether the final system:

- aligns with the client’s service model
- supports the required user roles
- provides coherent user journeys
- can be handed over in a realistic business-ready state

## 4.2 Evaluation Criteria

The project was evaluated against the following criteria:

- **functional completeness**: whether the major planned modules were implemented
- **usability**: whether the system is understandable and navigable for users
- **role suitability**: whether user, premium, admin, and owner paths make sense operationally
- **security and integrity**: whether sensitive flows are appropriately protected
- **maintainability**: whether the system structure supports future updates
- **handover readiness**: whether the system can be delivered even if final live activation is postponed

These criteria also reflect general web engineering concerns and accessibility/usability expectations. Accessibility and usability were considered especially important because the project is intended for broad public engagement and needs to avoid confusing or inaccessible interactions (W3C WAI, 2026).

## 4.3 Evaluation Methods

The evaluation used four complementary methods.

### 4.3.1 Workflow Review

The team manually evaluated full workflows from a user perspective and an admin perspective. This helped determine whether individual working features also formed a coherent user journey.

### 4.3.2 Role-Based Review

The system was evaluated for behavioural differences across anonymous, free, premium, admin, and owner users. This was particularly important because the platform depends on role restrictions for premium access, dashboard visibility, and admin management.

### 4.3.3 Client Alignment Review

The team reviewed the implemented outcome against the client’s content updates and business needs, especially for books, memberships, consultations, and contact pathways. Even where live business activation was not yet complete, the structure needed to reflect the client’s intended operational model.

### 4.3.4 Technical Readiness Review

The team also evaluated the system from a launch-readiness perspective, asking:

- is the system buildable?
- are the major flows stable?
- are the remaining gaps internal or external?
- can the solution reasonably be handed over now?

This method was especially useful because the client’s live Stripe access remained pending, meaning the team needed to distinguish between incomplete development and incomplete client onboarding.

## 4.4 Evaluation Data Sources

Evaluation evidence came from:

- direct use of the application
- admin and user-side observations
- dashboard behaviour
- Stripe test mode outcomes
- test case results
- backend and policy refinements
- weekly progress records

These sources together allowed the team to evaluate not only isolated features, but also the maturity of the system as a whole.

## 4.5 Limitations of the Evaluation

The evaluation had some limitations:

- final live Stripe setup could not be evaluated without the client’s live account
- final branding and photography were not complete
- consultation confirmation remained an internal admin-managed workflow rather than a fully automated calendar sync
- some client-provided final content remained pending at the time of review

These limitations do not invalidate the project, but they do affect the boundary between “development complete” and “business fully launched.”

# Chapter 5 - Test and Evaluation Results

## 5.1 Overview of Results

The combined testing and evaluation process showed that the project achieved strong functional completion across its main modules. Most core user and admin features passed scenario-based testing, and the overall system can be described as handover-ready in test-mode form. The remaining major dependency is the live Stripe account setup controlled by the client.

## 5.2 Functional Testing Results

### 5.2.1 Authentication and Access

Authentication behaved correctly in the tested user scenarios. Registered users could sign in and reach the dashboard, while anonymous users were blocked from protected areas. Normal users were also prevented from accessing the admin dashboard. Admin and owner users could access the appropriate management pages.

Email validation and password validation were also strengthened during refinement. This improved data quality and reduced the chance of obviously invalid signup details being accepted.

### 5.2.2 Books, Orders, and Checkout

The books and order flow achieved a strong result overall. Users could:

- browse books
- add items to cart
- proceed to checkout
- complete Stripe test payments
- view resulting orders in the dashboard

The pending order logic was also improved successfully. Orders left incomplete remain pending for a limited time, can be resumed, and then expire to cancelled status if abandoned. This reflects a realistic e-commerce flow and improved both user experience and admin clarity.

### 5.2.3 Events and Event Booking

The event workflow was functionally successful. Events could be displayed, opened individually, booked, and linked to Stripe test-mode checkout. Successful bookings appeared in the user dashboard. This confirmed that the event module works not just as static content, but as an interactive service feature.

### 5.2.4 Premium Membership

The premium membership system also produced strong results in test mode. Users could:

- open premium upgrade
- complete Stripe test-mode subscription flow
- become premium
- access membership management through the customer portal

The project also addressed a key security issue by preventing normal users from manually changing their own membership tier through direct profile updates. This significantly improved confidence in the integrity of the premium access model.

### 5.2.5 Consultation Workflow

The consultation feature initially involved Google Calendar embedding, but this was later simplified to a direct request-based flow because the embedded approach introduced cross-browser inconsistency and unnecessary complexity at a late stage. The final result is more stable:

- users select a consultation type
- users choose date and time blocks
- users submit the request
- admin can confirm the request and adjust timing if needed
- users can see consultation status and timing in the dashboard

From an evaluation perspective, this is a successful simplification rather than a downgrade. It improves reliability and makes handover easier.

### 5.2.6 Contact Messages

The contact form now saves real data to the backend and surfaces that data in the admin dashboard. Unread indicators further improved the operational usefulness of the feature. This corrected an earlier issue where the form appeared successful but did not persist messages.

## 5.3 Evaluation Against Objectives

The implemented outcome was evaluated against the project objectives defined earlier.

### Objective: Implement the core public website

This objective was achieved. The system includes all required public-facing pages and coherent navigation across the site.

### Objective: Implement backend-connected functionality

This objective was achieved. Major features such as orders, bookings, contact messages, consultations, membership, and admin content are now backend-driven.

### Objective: Support multiple user roles

This objective was achieved. The system supports public, registered, premium, admin, and owner roles with meaningful differences in access and control.

### Objective: Prepare payment workflows

This objective was achieved in test mode. The payment system is implemented and working in Stripe developer mode, but live activation depends on the client’s Stripe account details.

### Objective: Prepare the system for handover

This objective was largely achieved. The system can be handed over as a complete application with test-mode payment support and later live activation.

## 5.4 Non-Functional Evaluation Outcomes

### Usability

The site structure is readable and consistent, with clear major pathways between public content, dashboard functions, and admin management. The consultation flow was notably improved by replacing the fragile iframe experience with a clearer time-block request flow.

### Responsiveness

The interface was tested and refined across desktop and smaller widths. Navigation and page structure generally behave well, though ongoing visual checks remain recommended for final deployment.

### Security

Role restrictions and row-level security represent a strong outcome for a student full-stack project. The later membership security fix is especially important evidence of system maturity and responsible refinement.

### Maintainability

The system uses a modular structure with reusable components and a clearly separated backend layer. This should make post-handover maintenance and future iteration easier than a monolithic design would have.

## 5.5 Remaining Limitations

Despite strong results, some limitations remain:

- live Stripe mode is still waiting on client access
- final client content and testimonials may still require updates
- professional photography and branding refinement are not fully complete
- some earlier accessibility features were removed for usability clarity during late refinement and could be revisited later

These limitations are meaningful, but they do not prevent the project from being handed over as a functionally complete system.

# Chapter 6 - Conclusion and Recommendations

## 6.1 Conclusion

The MIND Architecture Web Application project successfully progressed from a Phase I design foundation into a practical Phase II implementation. The final system provides a coherent digital platform that supports public engagement, user accounts, premium membership, books, event booking, consultation requests, contact enquiries, and administrative management. The implementation demonstrates that the original project purpose was not only technically feasible but also achievable within the scope of the academic project.

The most significant success of the project is that the system is now more than a prototype. It is a functioning full-stack web application with secure authentication, backend-connected records, structured payment workflows in test mode, and a usable admin management interface. The development process also shows evidence of iterative improvement, especially in areas such as order handling, membership security, consultation workflow simplification, and message visibility.

The project also achieved a realistic and professional balance between ideal completeness and practical delivery. Rather than leaving fragile or misleading functionality in place, the team simplified features where necessary, strengthened important security rules, and clearly separated client-controlled dependencies from development-owned work. This improved the quality of the final handover outcome.

## 6.2 Recommendations

The following recommendations are proposed for post-handover completion and improvement:

1. **Activate live Stripe** as soon as the client provides the required live account access, products, pricing, and webhook details.
2. **Finalise content and branding** by replacing any remaining temporary text, testimonials, or imagery with client-approved material.
3. **Review consultation workflow after handover** to determine whether the current request-based model should remain or later integrate with an automated scheduling system.
4. **Perform a final deployment QA pass** on the production domain once hosting, environment variables, and live keys are configured.
5. **Continue expanding admin reporting** if the client later requires more operational insights or analytics.

## 6.3 Future Work

If the project were extended further, useful future work would include:

- full live payment activation
- email notification workflows
- automated membership status sync through Stripe webhooks
- deeper consultation calendar integration if required
- richer analytics dashboards
- final accessibility enhancement review
- long-term content management training for the client

## 6.4 Final Reflection

This project demonstrates the value of combining structured analysis, real stakeholder communication, practical iteration, and full-stack implementation in an academic setting. The system developed for MIND Architecture is not only technically meaningful, but also operationally relevant. The final outcome gives the client a platform that can be used, reviewed, and launched when business readiness allows.

# References

Agile Manifesto (2001) *Manifesto for Agile Software Development*. Available at: https://agilemanifesto.org/ (Accessed: 13 May 2026).

React (2026) *React documentation: Learn React*. Available at: https://react.dev/learn (Accessed: 13 May 2026).

Stripe (2026a) *Stripe Checkout Sessions*. Available at: https://docs.stripe.com/api/checkout/sessions (Accessed: 13 May 2026).

Stripe (2026b) *Stripe Customer Portal*. Available at: https://docs.stripe.com/customer-management (Accessed: 13 May 2026).

Supabase (2026a) *Supabase Authentication Documentation*. Available at: https://supabase.com/docs/guides/auth (Accessed: 13 May 2026).

Supabase (2026b) *Supabase Edge Functions Documentation*. Available at: https://supabase.com/docs/guides/functions (Accessed: 13 May 2026).

Vite (2026) *Vite Guide*. Available at: https://vite.dev/guide/ (Accessed: 13 May 2026).

W3C WAI (2026) *Web Content Accessibility Guidelines (WCAG) Overview*. Available at: https://www.w3.org/WAI/standards-guidelines/wcag/ (Accessed: 13 May 2026).

# Appendices

## Appendix A - Group Activity Log Summary

The detailed group activity log should be attached in chronological order and should include:

- division of responsibilities
- weekly contribution evidence
- meeting participation
- agreed deadlines
- submission evidence
- coordination notes

Suggested role summary:

- Sandeep Pun: main development, backend integration, Stripe test implementation, consultation/admin/dashboard refinement, technical coordination
- Harshit Shrestha: testing, user-side validation, access testing, reporting observations
- Rabin Shrestha: testing, interface review, layout and feature display checking
- Ahmed Malik: user manual and report documentation support
- Dipesh Shahi: user manual and report documentation support

[Insert full activity log table or separately attached appendix document here]

## Appendix B - Meeting Minutes

At least 12 meeting records are expected across the project lifecycle. Insert the meeting agendas and minutes here or attach them as a compiled appendix.

Suggested placeholder list:

- Meeting 1 - Initial client meeting and scope discussion
- Meeting 2 - Requirement gathering and clarification
- Meeting 3 - Design feedback and approval discussion
- Meeting 4 - Prototype/client review
- Meeting 5 to Meeting 12 - Internal team coordination and implementation review

[Insert meeting minutes in chronological order]

## Appendix C - Functional and Non-Functional Requirements

Attach or insert the requirement artefacts prepared for the project:

- Functional requirements
- Non-functional requirements
- use case materials

[Insert or attach the final requirements workbook/document here]

## Appendix D - Test Cases and Traceability Matrix

Attach the detailed testing artefacts:

- Test case register
- Traceability matrix
- test summary counts if prepared separately

[Insert or attach the final testing workbooks here]

## Appendix E - Screenshots and Supporting Figures

Insert final screenshots for:

- home page
- books page
- events page
- membership page
- dashboard
- admin dashboard
- consultation page
- contact page

[Insert final screenshots here]
