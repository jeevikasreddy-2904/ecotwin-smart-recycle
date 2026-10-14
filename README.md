# EcoTwin Smart Recycle

# ECOTWIN AI — COMPLETE PRODUCT REBUILD & UI/UX MASTER PROMPT



Act as a senior product designer, UI/UX architect, frontend engineer, and AI product developer. Build a visually exceptional, responsive, modern web application named **EcoTwin AI — Smart Recycling Assistant**.



Do not create only a landing page. Build a complete, consistent multi-page product experience with an attractive homepage, functional navigation, an AI waste scanner, intelligent recycling recommendations, an interactive Digital Twin, an impact dashboard, and scan history.



The product must look polished enough for a competitive AI hackathon demo.



## 1. PRODUCT VISION



EcoTwin AI helps people understand what happens to their waste.



It combines:

- Computer Vision to identify waste materials from images.

- Generative AI to explain reuse, recycling, and disposal options.

- Digital Twin technology to simulate recycling bins, material movement, and waste sorting.

- Impact Analytics to visualize sorting activity and estimated environmental benefits.



Main tagline:



"See the waste. Understand the impact. Recycle smarter."



Supporting statement:



"Turn everyday waste into informed decisions. Identify materials, discover better disposal choices, and watch your circular future take shape through an interactive digital twin."



The experience should communicate sustainability, intelligence, innovation, trust, and real-world usefulness.



## 2. VISUAL IDENTITY AND DESIGN SYSTEM



Create a distinctive, premium, cinematic sustainability aesthetic.



Color palette:

- Deep forest background: #061C18

- Primary forest green: #0B332A

- Elevated card green: #104438

- Mint accent: #70F0B5

- Bright lime accent: #C7F36B

- Main text: #F4FFF9

- Secondary text: #AAC6BA

- Borders: subtle translucent mint or white

- Warning: warm amber

- Hazard alerts: accessible red-orange



Use green, mint, and lime consistently throughout every page. Reserve amber and red for warnings and hazardous waste.



Typography:

- Use a modern sans-serif font such as Inter or Manrope.

- Make headings bold, clear, and editorial.

- Use large, carefully spaced hero typography.

- Keep body text readable and concise.

- Use consistent heading hierarchy, labels, helper text, and numerical typography.



Components:

- Rounded cards with subtle borders.

- Restrained glassmorphism and backdrop blur.

- Soft radial green lighting.

- Subtle shadows and elegant gradients.

- Consistent iconography using Lucide icons.

- High-quality waste, recycling, and circular-economy imagery.

- Smooth hover states, button feedback, skeleton loaders, and transitions.

- Attractive empty, loading, success, and error states.

- Clear keyboard focus, accessible contrast, and sufficiently large controls.



Avoid excessive neon, cluttered layouts, random colors, giant empty spaces, emoji-heavy interfaces, and generic template styling.



Create reusable design tokens and components. All pages must share the same visual identity.



## 3. HOMEPAGE — CINEMATIC RECYCLING EXPERIENCE



Route: /



Create a stunning, full-viewport hero section with real recycling footage playing continuously in the background.



Background video requirements:

- Use a real, relevant, royalty-free or properly licensed video showing a modern recycling facility, materials being sorted, conveyor belts, recyclable materials, or recycling bins.

- Use a video file or a reliable, properly licensed video source.

- Play automatically, loop continuously, and remain muted.

- Use object-fit: cover, with a dark forest-green overlay and gradient mask for readable text.

- Add a graceful fallback image if the video cannot load.

- Respect reduced-motion preferences and provide a static fallback.

- Never use an unrelated video or a broken video URL.

- Keep the video behind all interactive content.



Navigation:

- EcoTwin AI logo with a minimal leaf/circular-arrow mark.

- Home

- AI Scanner

- Recommendations

- Digital Twin

- Impact Dashboard

- History

- A prominent "Start Scanning" button.

- Responsive mobile menu.



Hero content:



Small eyebrow:

"INTELLIGENT RECYCLING • POWERED BY AI"



Main heading:

"See the waste.

Understand the impact.

Recycle smarter."



Highlight "Recycle smarter." with a mint-to-lime gradient.



Description:

"Your intelligent recycling companion. Recognize materials, discover better ways to reuse them, and watch your environmental impact unfold through a living digital twin."



Primary CTA: "Scan Your First Item"

Secondary CTA: "Explore the Digital Twin"



Under the buttons, show three compact capability labels:

Computer Vision · Generative AI · Digital Twin



Add a tasteful scroll indicator and subtle floating material particles only if they do not reduce readability or performance.



Below the hero, create:



A. HOW IT WORKS

Three visually connected steps:

1. Capture — Upload a photo of a waste item.

2. Understand — AI predicts the material and provides guidance.

3. Transform — Confirm the result and observe the Digital Twin update.



B. LIVE DIGITAL TWIN PREVIEW

A polished preview of virtual recycling bins with material labels, fill levels, and a clear link to the full simulation.



C. WHY ECOTWIN AI

Feature cards for smart recognition, responsible disposal guidance, circular material flow, and impact tracking.



D. IMPACT EXPLAINED

Present useful metrics from real application records or explicitly labeled demonstration data. Do not invent live global statistics.



E. FINAL CTA

"Small actions. Bigger impact."

Button: "Start Recycling Smarter"



Finish with a professional footer containing product navigation, a short mission statement, and a note distinguishing estimated impact from measured impact.



## 4. GLOBAL APPLICATION LAYOUT



All internal pages must feel like parts of one professionally designed application.



Use a shared sidebar on desktop:

- EcoTwin AI logo

- Home

- AI Scanner

- Recommendations

- Digital Twin

- Impact Dashboard

- Scan History

- Settings only if implemented



Use a compact top bar with the current page title, optional breadcrumb, and profile or preferences controls only when functional.



Use a collapsible sidebar on smaller screens, with a clean mobile navigation pattern.



Internal pages should use a dark forest-green canvas, elevated cards, mint accents, consistent spacing, clear page headings, and responsive content widths.



Do not create a completely different layout or palette for each page.



## 5. AI WASTE SCANNER



Route: /scanner



Page heading:

"Give your waste a second life."



Description:

"Upload a photo, identify the material, and discover your next best action."



Create a premium two-column workspace.



LEFT PANEL — IMAGE INPUT

- Large drag-and-drop upload zone.

- Browse files button.

- Image preview.

- Replace image and remove image actions.

- Validate supported file types and file size.

- Clear instructions for good lighting and a single clearly visible item.

- Show the supported categories.



RIGHT PANEL — ANALYSIS

Before scanning, display a clean empty state explaining what will happen.



When scanning:

- Show an elegant progress state.

- Prevent duplicate submissions.

- Display useful errors and a retry option.



After scanning, display:

- Uploaded image.

- Predicted material category.

- Identified item name when supported by the model.

- Confidence score only when the model returns a meaningful, calibrated score.

- Short explanation of the prediction.

- Recycling suitability with appropriate uncertainty.

- Preparation instructions, such as cleaning or separating components when applicable.

- Reuse suggestion where relevant.

- Disposal guidance with a reminder to verify local rules.

- Safety notice for uncertain, hazardous, damaged, or composite items.



Categories:

Plastic, Paper/Cardboard, Glass, Metal, Organic, General Waste, Hazardous/Special Disposal, and Unknown.



Use color-coded category chips that remain accessible and visually consistent.



Provide actions:

- "Confirm Category"

- "Change Category"

- "View Recommendations"

- "Add to Digital Twin" after confirmation.



Require explicit user confirmation before changing the Digital Twin or recording a confirmed sorting action.



Do not pretend a scan succeeded when the backend is unavailable. Clearly distinguish a genuine AI response from demo mode.



Do not claim that an image alone can reliably determine every material composition or local recyclability rule.



## 6. SMART RECYCLING RECOMMENDATIONS



Route: /recommendations



Page heading:

"Make your next action count."



Description:

"Practical guidance to reuse, sort, and dispose of materials responsibly."



Create an elegant recommendation workspace with:

- A material/category selector.

- A search field for common waste items.

- Recommended actions presented in clear, well-designed cards.

- Separate sections for Reuse, Recycle, Prepare, and Special Disposal where applicable.

- Concise explanations of why an action is recommended.

- Local-rule verification notices where required.

- Links back to the relevant scan or Digital Twin when available.



When opened from a completed scan, automatically display recommendations for that confirmed item.



Personalize recommendations based on the available item information, but do not invent user details or unsupported local rules.



Add a "View Digital Twin" CTA when the user has a confirmed sorting action.



Hazardous items must receive cautious handling guidance and directions to appropriate local collection guidance rather than ordinary-bin instructions.



## 7. INTERACTIVE DIGITAL TWIN



Route: /digital-twin



Page heading:

"Your waste. Reimagined in real time."



Description:

"See your sorting decisions come to life inside a virtual recycling ecosystem."



This is a key differentiating feature. Make it visually impressive, interactive, and easy to understand.



Create a virtual recycling station with separate bins for:

- Plastic

- Paper and Cardboard

- Glass

- Metal

- Organic

- General Waste

- Special Disposal



Each bin should show:

- A clear icon.

- Material label.

- Current fill level.

- Item count.

- A visual fill indicator or animated liquid-like fill.

- An accessible tooltip or details panel.



Use a visually appealing station illustration or stylized 2.5D arrangement. Keep it performant and responsive.



Under the bins, create a MATERIAL FLOW visualization:

Identified → Confirmed → Sorted → Recovery Pathway.



Use animated connectors or progress indicators. Do not imply that actual physical waste is being transported or processed.



Include:

- Recent sorting activity.

- Material distribution.

- A selected-bin details panel.

- A filter for time period.

- A reset-demo control only when demo data is being used.

- A clearly labeled demo-data indicator when applicable.



Functional behavior:

When a user confirms a classification on the scanner, record the confirmed action and update the matching bin and activity list.

Repeated confirmation of the same scan must not count the item twice.

Provide an undo or correction flow if feasible.

Do not silently discard earlier records when changing a category.



If persistent storage is not configured, clearly label the simulation as session-only or demo mode.



## 8. IMPACT ANALYTICS DASHBOARD



Route: /impact



Page heading:

"Measure every meaningful action."



Description:

"Understand your recycling activity and the difference your choices may make."



Design a polished analytics dashboard with:

- Total confirmed items sorted.

- Number of material categories handled.

- Sorting activity over time.

- Material distribution chart.

- Digital Twin bin-fill overview.

- Recent activity.

- A date-range filter.

- Helpful empty states for new users.



Charts should have meaningful labels, legends, tooltips, accessible contrast, and responsive layouts.



Only calculate activity totals from actual stored records or clearly labeled demonstration records.



Environmental impact:

- Present estimated metrics only when there is a defensible calculation method and stated assumptions.

- Explain the method used and its limitations.

- Never invent precise carbon savings, trees saved, water saved, or recycling rates.

- Do not imply a material was successfully recycled just because a user sorted or classified it.

- Separate "items sorted" from "estimated environmental impact."



If credible impact factors are not configured, show a well-designed "Impact estimates not configured yet" state instead of fabricated figures.



## 9. SCAN HISTORY



Route: /history



Page heading:

"Every small action counts."



Description:

"Review your previous scans and confirmed sorting decisions."



Create a clean, attractive history page with:

- Thumbnail of each item.

- Item name when available.

- Material category.

- Scan date and time.

- Confirmation status.

- Search.

- Category filter.

- Date-range filter.

- Sort by newest or oldest.

- Pagination or an accessible load-more pattern.

- Clickable details view.

- Retry or review option where applicable.

- A clear empty state with a "Scan an Item" button.



Distinguish between a prediction, a user-confirmed category, and a completed disposal action. Do not mark waste as recycled unless that outcome is actually known.



Store only information necessary for the feature. Avoid exposing uploaded image URLs or personal data publicly.



## 10. FUNCTIONALITY AND DATA CONSISTENCY



Create a clear shared data model for:

- Scan record.

- Image reference, where necessary.

- Predicted category.

- User-confirmed category.

- AI explanation.

- Recommendation list.

- Timestamp.

- Processing status.

- Digital Twin sorting event.



Use a single source of truth for scan history, confirmed sorting actions, bin counts, and dashboard metrics.



Ensure:

- All navigation links work.

- Buttons perform their advertised actions.

- Search and filters work.

- Forms validate their inputs.

- Charts derive values from the underlying records.

- Bin updates are based on confirmed sorting events.

- Duplicate submissions are handled safely.

- Loading, error, empty, and success states are implemented.

- Refreshing the page does not falsely imply data persistence if no database is connected.



Use React, TypeScript, the existing project framework, reusable components, and the existing routing system. Use the current codebase rather than creating conflicting parallel app structures.



## 11. AI AND BACKEND ARCHITECTURE



Design the frontend so it can connect to a secure backend.



Preferred integration:

- A vision-capable AI model for waste-image classification.

- A secure server-side function for model calls.

- Supabase for persistent scan records and confirmed sorting actions, if appropriate.

- Server-side secrets for API keys.

- Proper validation, error handling, and basic abuse protection.



Never expose AI API keys in browser code, public repositories, or client-visible environment variables.



Do not invent a successful AI result if the model request fails.



If credentials or backend services are not configured, build the complete frontend interaction states and provide a clear checklist of the exact integration steps. Clearly label any simulated output.



Keep AI-generated disposal recommendations grounded in verified rules when local recycling regulations are involved.



## 12. MICROINTERACTIONS AND POLISH



Add restrained, professional motion:

- Smooth page transitions where supported.

- Subtle card hover elevation.

- Mint glow on primary actions.

- Animated scan progress.

- Gentle Digital Twin bin-fill transitions.

- Chart transitions.

- Toast messages for confirmed actions.

- Skeleton loaders.

- Responsive mobile interactions.

- Reduced-motion support.



Avoid excessive animation and any effects that harm accessibility or performance.



## 13. RESPONSIVE DESIGN AND ACCESSIBILITY



Ensure the complete product works on:

- Desktop and laptop.

- Tablet.

- Mobile.



Prevent horizontal overflow, tiny buttons, overlapping charts, clipped text, and unreadable background video content.



Use semantic elements, descriptive labels, keyboard-accessible controls, visible focus states, accessible charts, and reduced-motion support.



## 14. FINAL IMPLEMENTATION AND QUALITY CHECK



First inspect the existing project and preserve useful working components. Then improve and implement the complete experience.



Prioritize:

1. Consistent premium design system.

2. Cinematic homepage with a reliable recycling-video fallback.

3. Beautiful, consistent internal pages.

4. Functional scanner interactions.

5. Digital Twin state updates.

6. Realistic analytics and history based on consistent data.

7. Secure backend integration readiness.

8. Responsive behavior and accessibility.



Do not stop after generating a mockup of the homepage.



Do not break existing working routes or introduce unnecessary duplicate components.



Do not present simulated data as live data.



After implementation, test every route and interactive control. Fix visual inconsistencies, mand make the font background transparent please and the ui/ux design for all the pages should be having a background image and there should be bins displayed also and there should be a demo showing the alert of having sund alerting sund with which that what bin has filled and theree should be a warning notification make the text nice with no background behind the text and add some beautiful with posters ui/ux design for the rest pages also except home page in whuh it already has and there should be phone preview also for andrio,apple and other platform with laptop also 

the user can select option there there should be  a selfie option and a back camera option also and adding of multiple images option should aso be there with graph and history of ateat 1 montUpgrade my existing EcoTwin AI Smart Recycling Assistant. My frontend is already built, so do not redesign, rebuild, or remove any existing UI or features.



Implement automatic waste image classification:



Allow users to upload an image or take a photo of waste.



Analyse the actual image using a real vision-capable AI model. Do not ask users to select the waste category manually.



Classify the image into suitable categories such as plastic, paper/cardboard, metal, glass, organic waste, e-waste, textile, and other or unknown.



Display the predicted category, confidence if supported by the model, and a short explanation.



If the image is unclear or the model cannot identify the waste reliably, ask the user to upload a clearer image instead of inventing a result.



Use the predicted category to generate recycling instructions, safe disposal guidance, and reuse suggestions.



Update my existing simulated Digital Twin dashboard and recycling statistics only after a successful classification.



Implement proper loading indicators, error handling, and image validation.



Inspect my existing code and reuse its current framework and components. Connect the necessary backend or AI integration without breaking existing functionality.



Do not hardcode sample predictions or pretend the AI works without a real integration. Keep API keys and secrets out of frontend code.



First check the existing project and explain which AI integration and backend changes are required. Then implement the feature using the existing design.hissing assets, broken navigation, console errors, and responsive layout problems.



Finally, summarize:

- Pages completed.

- Features genuinely functional.

- Features currently simulated.

- Backend integrations still needed.

- API keys or secrets that must be configured.

- A short step-by-step testing checklist.



The final result should feel like a cohesive, premium, modern AI-powered circular-economy product suitable for a live hackathon demonstration.

and make the font background transparent please and the ui/ux design for all the pages should be having a background image and there should be bins displayed also and there should be a demo showing the alert of having sund alerting sund with which that what bin has filled and theree should be a warning notification make the text nice with no background behind the text and add some beautiful with posters ui/ux design for the rest pages also except home page in whuh it already has and there should be phone preview also for andrio,apple and other platform with laptop also 

the user can select option there there should be  a selfie option and a back camera option also and adding of multiple images option should aso be there with graph and history of ateat 1 month

Upgrade my existing EcoTwin AI Smart Recycling Assistant. My frontend is already built, so do not redesign, rebuild, or remove any existing UI or features.



Implement automatic waste image classification:



Allow users to upload an image or take a photo of waste.



Analyse the actual image using a real vision-capable AI model. Do not ask users to select the waste category manually.



Classify the image into suitable categories such as plastic, paper/cardboard, metal, glass, organic waste, e-waste, textile, and other or unknown.



Display the predicted category, confidence if supported by the model, and a short explanation.



If the image is unclear or the model cannot identify the waste reliably, ask the user to upload a clearer image instead of inventing a result.



Use the predicted category to generate recycling instructions, safe disposal guidance, and reuse suggestions.



Update my existing simulated Digital Twin dashboard and recycling statistics only after a successful classification.



Implement proper loading indicators, error handling, and image validation.



Inspect my existing code and reuse its current framework and components. Connect the necessary backend or AI integration without breaking existing functionality.



Do not hardcode sample predictions or pretend the AI works without a real integration. Keep API keys and secrets out of frontend code.



First check the existing project and explain which AI integration and backend changes are required. Then implement the feature using the existing design.

With alarming sound when bin's full with preview seperately in phone,laptop ,tablets or android or iphone make sure uo and ux design proper with seperate images for all pages even including homepage also it should looks attractive and good to see . And there should be both fronts ns back camera with text transparent with no white background or any other background and alett should be sound with notification and even whenalmots full anlight war ong withba notification

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/169afcdd-5b98-41c8-902f-7121d89c7e76).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
