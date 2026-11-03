# Implementation Plan: Design Catalog Management Module

Implement a mom-friendly, robust, and beautiful Design Catalog Management module for the PUSHPA TAILORS tailoring application. The module allows the admin to organize, view, filter, add, edit, and deactivate embroidery & tailoring designs, while securely keeping DST machine file metadata private and exposing only active preview JPGs to the public gallery.

## User Review Required

> [!IMPORTANT]
> - **DST File Security**: DST embroidery machine files will never be uploaded to public buckets or exposed on the customer-facing website. Only their filenames (metadata) will be saved in Firestore for workshop machine reference (e.g. `front.DST`, `sleeves.DST`, `butta.DST`).
> - **Preview Images**: The catalog will support uploading JPG preview images directly with automatic compression. If Firebase Storage rules or bucket are unavailable, it will safely fallback to compressed data URLs or user-provided image URLs without crashing.
> - **Public Gallery**: The customer-facing `/gallery` page will query active designs from Firestore, and fallback gracefully to demo designs if no designs are in the database yet, ensuring zero downtime or blank pages.

## Proposed Changes

---

### 1. Types & Data Models

#### [NEW] [design.ts](file:///c:/Users/Santhosh/amma/src/types/design.ts)
Define TypeScript interfaces and Zod validation schema for the designs:
- `WorkType`: `'Machine Work' | 'Stone Work' | 'Patch Work' | 'Combination Work'`
- `DesignCategory`: Blouse Front & Back, Bridal Blouse, Saree Border, Lehenga, Kurti / Dress, Buttas & Motifs, Custom / Other
- `Design`:
  - `id?: string`
  - `designCode: string` (e.g. "001", "PT-D102")
  - `name: string`
  - `category: string`
  - `workType: WorkType`
  - `price: number`
  - `description?: string`
  - `previewImageUrl: string`
  - `machineFiles: string[]` (e.g. `["front.DST", "sleeves.DST", "motive.DST"]`)
  - `active: boolean`
  - `createdAt: any`
  - `updatedAt: any`
- `DesignFormData` and `designSchema` for form validation with Zod.

---

### 2. Services Layer

#### [NEW] [storageService.ts](file:///c:/Users/Santhosh/amma/src/services/storageService.ts)
Safe storage helper utilizing the existing `storage` export from `src/services/firebase.ts`:
- `uploadDesignPreview(file: File, designCode: string): Promise<string>`
  - Compresses image using `browser-image-compression`
  - Attempts upload to Firebase Storage at `designs/{designCode}_{timestamp}.jpg`
  - If Firebase Storage is unconfigured or encounters permissions/CORS issues, converts to a clean compressed base64 data URL as a robust fallback.

#### [NEW] [designService.ts](file:///c:/Users/Santhosh/amma/src/services/designService.ts)
Firestore service for the `designs` collection:
- `getDesigns()`: Fetch all designs ordered by `createdAt desc` or `designCode`
- `getActiveDesigns()`: Fetch active designs (`where('active', '==', true)`)
- `getDesign(id: string)`: Get single design by ID
- `createDesign(data: DesignFormData)`: Add new design with `createdAt` and `updatedAt` server timestamps
- `updateDesign(id: string, data: Partial<DesignFormData>)`: Update design
- `toggleDesignActive(id: string, currentStatus: boolean)`: Quick soft activation/deactivation
- `deleteDesign(id: string)`: Delete design (with confirmation)
- `batchCreateDesigns(designs: DesignFormData[])`: Prepared helper for the upcoming 687 design bulk import.

---

### 3. Admin Components & Pages

#### [NEW] [DesignCard.tsx](file:///c:/Users/Santhosh/amma/src/components/admin/designs/DesignCard.tsx)
Responsive, premium card for each design:
- JPG preview with smooth loading and zoom hover effect
- Design code tag (e.g. `#001`) and Status badge (Active / Inactive)
- Name, Category, Work Type pill (with color-coded work types)
- Price display (₹)
- Machine files count & preview chips (e.g. `3 DST files`)
- Action buttons: "View", "Edit", and Quick Toggle / Delete options

#### [NEW] [DesignFormModal.tsx](file:///c:/Users/Santhosh/amma/src/components/admin/designs/DesignFormModal.tsx)
Mom-friendly modal for adding/editing a design:
- Design Code (required)
- Design Name (required)
- Category selector (with predefined standard boutique categories and custom option)
- Work Type selector (Machine Work, Stone Work, Patch Work, Combination Work)
- Price (number in ₹)
- Description (optional)
- Preview Image: drag-and-drop file upload with live preview & instant image compression, plus option for direct URL
- Machine File Names: interactive tag/chip editor with quick presets (`front.DST`, `sleeves.DST`, `butta.DST`, `full.DST`, `neck.DST`) and custom file name entry
- Active status toggle
- Telugu hints and clear validation error messages

#### [NEW] [DesignDetailModal.tsx](file:///c:/Users/Santhosh/amma/src/components/admin/designs/DesignDetailModal.tsx)
Rich detail modal when viewing a design:
- High-res JPG preview
- Complete metadata: Code, Name, Category, Work Type, Price, Description
- Machine files list with DST file icons
- Status toggle button & edit shortcut
- Created and updated timestamp details

#### [NEW] [DeleteDesignDialog.tsx](file:///c:/Users/Santhosh/amma/src/components/admin/designs/DeleteDesignDialog.tsx)
Confirmation dialog supporting:
- "Deactivate Design" (recommended soft-delete so order history remains intact)
- "Delete Permanently" option if desired

#### [NEW] [DesignCatalog.tsx](file:///c:/Users/Santhosh/amma/src/pages/admin/designs/DesignCatalog.tsx)
The main admin page:
- Page header: "Design Catalog" / "డిజైన్ కేటలాగ్"
- Stats summary bar: Total Designs, Active, Inactive, Categories
- Search bar (by Code or Name)
- Category filter pills/dropdown
- Work Type filter pills/dropdown
- Active/Inactive filter pills
- "Add Design" ("డిజైన్ జోడించండి") button
- Grid layout with empty, loading, search no-results, and error states.

---

### 4. Admin Layout & Routing

#### [MODIFY] [Sidebar.tsx](file:///c:/Users/Santhosh/amma/src/components/admin/Sidebar.tsx)
- Add `Palette` (or `GalleryVertical`) icon import from `lucide-react`
- Add NavLink to `/admin/designs`:
  ```tsx
  <NavLink to="/admin/designs" className={navLinkClass}>
    <Palette className="h-5 w-5 flex-shrink-0" />
    <span className="font-medium tracking-wide">Design Catalog</span>
  </NavLink>
  ```

#### [MODIFY] [App.tsx](file:///c:/Users/Santhosh/amma/src/App.tsx)
- Import `DesignCatalog`
- Add route under `/admin`:
  ```tsx
  <Route path="designs" element={<DesignCatalog />} />
  ```

---

### 5. Customer Website Integration

#### [MODIFY] [Gallery.tsx](file:///c:/Users/Santhosh/amma/src/pages/Gallery.tsx)
- Fetch active designs using `designService.getActiveDesigns()`
- If active designs exist in Firestore, render them dynamically in the gallery with their categories and work types
- If no active designs are in Firestore yet, maintain the existing demo images as an automatic fallback
- Ensure machine files (.DST) are never exposed or downloaded on the public gallery.

---

## Verification Plan

### Automated Checks
- Run TypeScript compile: `npx tsc --noEmit`
- Run Vite build: `npm run build`
- Ensure 0 errors or warnings.

### Manual & Functional Verification
1. **Admin Navigation**: Verify `/admin/designs` is visible in the sidebar, active highlighting works, and links properly.
2. **Catalog Page**: Verify loading, empty state, search, category filters, and work type filters.
3. **Add Design**: Add a test design with code `001`, name `Peacock Bridal Blouse`, Work Type `Machine Work`, Category `Bridal Blouse`, Price `1500`, machine files `["front.DST", "sleeves.DST", "butta.DST"]`, and upload a JPG preview.
4. **View Design**: Open detail modal and verify image, badges, DST file names, and price display.
5. **Edit Design**: Modify price or machine files and verify changes persist.
6. **Soft Deactivation**: Deactivate design and verify it changes to Inactive badge and hides when filtering by "Active Only".
7. **Customer Gallery**: Check `/gallery` on the customer side to ensure active designs appear without leaking DST files.
8. **Regression Verification**: Check Dashboard, Customers, Orders, Payments, and Reports to confirm everything continues to work seamlessly.
