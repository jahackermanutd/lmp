# 🧠 Prompt: Create Admin Panel UI/UX (Letter Management System)

You are an expert frontend engineer and UI/UX designer specializing in **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.  
I’m building a **Letter Management System (LMS)** for a football club.  

Now I want you to **design and implement the Admin Panel UI only** — no backend logic yet.  
Your goal is to build a modern, clean, and responsive admin interface where the Admin can manage all parts of the system.

---

## 🎯 Requirements

**Framework:** Next.js (App Router)  
**Language:** TypeScript  
**Styling:** Tailwind CSS + Shadcn UI (or similar component library)  
**Focus:** Frontend UI/UX only — static or mock data is fine  

---

## 🧩 Admin Panel Should Include These Sections (Pages)

### 1. Dashboard
- Overview cards (Total letters, Pending approvals, Approved letters, Users count)
- Recent activity list
- Small analytics chart or graph

### 2. User Management
- Table listing users (Name, Email, Role, Status, Last login)
- Buttons: Add user, Edit, Delete, Deactivate
- Modal or drawer for creating/editing users
- Role dropdown (`Admin`, `LetterWriter`, `Approver`, `Viewer`)

### 3. Letters Management
- Table showing all letters with filters (Status, Author, Type, Date)
- Columns: Title, Author, Status (Draft/Pending/Approved), Date
- Action buttons: View, Edit, Delete, Archive
- Modal or drawer for previewing letter content (mock text)

### 4. Letterhead & Design Settings
- Section to upload logo, header image, footer image
- Input fields for organization name, address, contact info
- Live preview card showing how the letterhead looks on A4
- Buttons: Save / Reset to default

### 5. Approval Workflow Settings
- Visual flow editor (mock UI)
- List of approval steps (e.g., Writer → Sporting Director → Director)
- Add/Remove step buttons
- Reorder steps (drag-and-drop if possible)

### 6. Reports & Analytics
- Graphs showing number of letters per month
- Pie chart for approved/rejected ratios
- Export buttons (disabled for now — backend later)
- Table of top active users

### 7. System Settings
- Input fields for: System name, timezone, date format, language
- Switches for enabling notifications, backup, and dark mode
- Button: “Save Settings”

---

## 🧠 UI/UX Guidelines
- Sidebar navigation:
  - Dashboard  
  - Users  
  - Letters  
  - Letterhead  
  - Workflow  
  - Reports  
  - Settings  
- Sticky top navbar with logo and profile dropdown
- Use consistent typography and spacing (Tailwind)
- Light and dark mode support
- Use icons (lucide-react) for sidebar items
- Smooth transitions and hover effects

---

## 🎨 Expected Output
Generate fully functional **frontend UI components and pages** (static data only) under:
```
app/admin/
  dashboard/page.tsx
  users/page.tsx
  letters/page.tsx
  letterhead/page.tsx
  workflow/page.tsx
  reports/page.tsx
  settings/page.tsx
components/admin/
  Sidebar.tsx
  Topbar.tsx
  Card.tsx
  Table.tsx
  Modal.tsx
```

Each page should be visually complete and responsive, using Tailwind and Shadcn components.  
Use mock data for now — backend integration will come later.  

---

**Instruction for AI:**  
> Create the full Admin Panel UI/UX structure for the Letter Management System with all pages and components listed above, using Next.js, Tailwind, and Shadcn UI. No backend logic — only static data and professional design.
