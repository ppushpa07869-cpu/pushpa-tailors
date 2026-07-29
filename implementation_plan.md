# Build Phase 8 – PUSHPA TAILORS Premium Customer Website (Luxury Edition)

This plan details the steps to build a completely separate, premium customer-facing website for PUSHPA TAILORS without modifying the existing Admin Portal or backend logic. The goal is to create a world-class boutique tailoring website with a luxury aesthetic.

## User Review Required

Please review this implementation plan to ensure it aligns with your vision. Note that we will be completely rewriting the existing customer-facing pages (Home, About, Services, Contact) to achieve the luxury design standard. The Admin pages will remain untouched. 

> [!IMPORTANT]
> The admin portal and backend structure will NOT be modified. This plan only targets the customer-facing frontend.

## Open Questions

1. Should the **Testimonials** be a separate page or a section on the Home page? (We will build it as a section on the Home page by default for better scrolling flow, unless you prefer a dedicated page).
2. For the **Gallery** page's "Image Preview Modal", we will implement a lightweight, custom React modal with Framer Motion since there are no external Lightbox libraries listed in the stack. Does this sound good?

## Proposed Changes

### Global Styles & Theming

We will update the core styling to match the luxury boutique theme using the required color palette and typography.

#### [MODIFY] [index.css](file:///c:/Users/Santhosh/amma/src/index.css)
- **Changes**: Update CSS variables for root and dark mode:
  - Primary: Deep Maroon (`#8B0000`)
  - Secondary: Luxury Gold (`#D4AF37`)
  - Background: Ivory (`#FAF9F6`)
  - Accent: Warm Beige (`#F8F4EC`)
  - Text: Dark Charcoal (`#222`)
- **Changes**: Set font imports for Playfair Display and Inter. Add base styles for smooth scrolling and clean focus rings.

#### [MODIFY] [tailwind.config.js](file:///c:/Users/Santhosh/amma/tailwind.config.js)
- **Changes**: Update the Tailwind theme to include the new custom colors explicitly for easy referencing (e.g. `maroon`, `gold`, `ivory`) or update the HSL variables. We will use the HSL equivalents in `index.css` for consistency.

### Navigation and Layout

We will build the sticky, transparent glassmorphism navbar and the luxury footer.

#### [MODIFY] [Layout.tsx](file:///c:/Users/Santhosh/amma/src/components/layout/Layout.tsx)
- **Changes**: Integrate the premium loading screen with animated tailor scissors logo before resolving to the main layout. Ensure `AnimatePresence` from Framer Motion wraps the `<Outlet />` for smooth page transitions.

#### [MODIFY] [Navbar.tsx](file:///c:/Users/Santhosh/amma/src/components/layout/Navbar.tsx)
- **Changes**: Add glassmorphism blur effect (`backdrop-blur-md`, transparent background on scroll). Include Links to Home, About, Services, Gallery, Contact, and Admin Login. Add a mobile drawer navigation.

#### [MODIFY] [Footer.tsx](file:///c:/Users/Santhosh/amma/src/components/layout/Footer.tsx)
- **Changes**: Redesign the footer with luxury aesthetics. Add quick links, business hours, social icons, and copyright.

#### [NEW] [WhatsAppButton.tsx](file:///c:/Users/Santhosh/amma/src/components/layout/WhatsAppButton.tsx)
- **Changes**: Floating WhatsApp button at bottom right with a pulse animation and a pre-filled message URL.

### Pages (Customer Facing)

We will rebuild the pages using Framer Motion for scroll effects, glass cards, and luxury components.

#### [MODIFY] [Home.tsx](file:///c:/Users/Santhosh/amma/src/pages/Home.tsx)
- **Changes**: 
  - **Luxury Full Screen Hero**: Placeholder image, headings in Playfair Display, View Designs/Book Stitching CTAs.
  - **Feature Highlights**: Animated cards with icons, hover lift, shadow animation.
  - **Why Choose Us**: Animated counter cards for stats (1000+, 10+, etc.).
  - **Testimonials Carousel**: Auto-sliding luxury carousel using Framer Motion.
  - **Premium CTA**: WhatsApp, Call Now, Book Appointment.

#### [MODIFY] [About.tsx](file:///c:/Users/Santhosh/amma/src/pages/About.tsx)
- **Changes**: Luxury story section, mission, vision, experience, and tailoring philosophy with professional placeholder images.

#### [MODIFY] [Services.tsx](file:///c:/Users/Santhosh/amma/src/pages/Services.tsx)
- **Changes**: Luxury service cards for Blouse Stitching, Bridal, Kids Wear, Alterations, etc. Incorporate icons, descriptions, starting prices.

#### [NEW] [Gallery.tsx](file:///c:/Users/Santhosh/amma/src/pages/Gallery.tsx)
- **Changes**: Premium Pinterest Masonry layout ready for future Firestore integration. Include category filters (Boat Neck, Bridal, etc.), Image Preview Modal (Lightbox) with zoom and navigation controls. 

#### [MODIFY] [Contact.tsx](file:///c:/Users/Santhosh/amma/src/pages/Contact.tsx)
- **Changes**: Professional layout with phone, WhatsApp, email, address, business hours, a floating contact card, and Google Maps placeholder.

#### [MODIFY] [App.tsx](file:///c:/Users/Santhosh/amma/src/App.tsx)
- **Changes**: Add the `Gallery` route to the customer routes.

### SEO & Metadata

#### [MODIFY] [index.html](file:///c:/Users/Santhosh/amma/index.html)
- **Changes**: Update Meta Title, Meta Description, Open Graph data to reflect the premium tailoring brand.

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure the build completes without errors.
- Run `npx tsc --noEmit` to verify zero TypeScript errors.

### Manual Verification
- Start the local server `npm run dev`.
- Verify the premium loading screen works correctly.
- Verify that dark mode toggle persists and updates styles elegantly.
- Navigate through all customer pages to check layouts, animations, and responsiveness.
- Verify Admin routes (`/admin`) still work perfectly without interference.
