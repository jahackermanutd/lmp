# Letter Management System - Admin Panel

A modern, responsive admin panel built with Next.js, TypeScript, and Tailwind CSS for managing letters, users, and workflows.

## 🎯 Features Implemented

### ✅ Complete Admin Panel UI/UX

#### 1. **Dashboard** (`/admin/dashboard`)
- Overview cards showing key metrics (Total Letters, Pending Approvals, Approved Letters, Users)
- Line chart displaying letter creation trends over 6 months
- Recent activity feed with color-coded actions
- Responsive grid layout

#### 2. **User Management** (`/admin/users`)
- User table with search and filter functionality
- Add, edit, and delete user operations
- Role management (Admin, LetterWriter, Approver, Viewer)
- Status management (Active/Inactive)
- Last login tracking
- Modal-based forms for CRUD operations

#### 3. **Letters Management** (`/admin/letters`)
- Comprehensive letter listing with filters
- Search by title or author
- Filter by status (Draft, Pending, Approved, Rejected)
- Filter by type (Contract, Agreement, Proposal, etc.)
- Letter preview modal with detailed information
- Action buttons (View, Edit, Delete)
- Export and Archive functionality

#### 4. **Letterhead & Design** (`/admin/letterhead`)
- Logo upload with preview
- Header image upload
- Footer image upload
- Organization information form (Name, Address, Phone, Email, Website)
- **Live A4 preview** showing how the letterhead looks
- Save and reset functionality
- Drag-and-drop file upload

#### 5. **Workflow Settings** (`/admin/workflow`)
- Visual workflow editor
- Drag-and-drop step reordering
- Add, edit, and delete workflow steps
- Role assignment for each step
- Approval and rejection permissions
- Workflow summary statistics
- Real-time step counter

#### 6. **Reports & Analytics** (`/admin/reports`)
- Key performance metrics with trend indicators
- Monthly letter trends (Line chart)
- Status distribution (Pie chart)
- Letters by category (Bar chart)
- Top active users table
- Export report functionality
- Time period filters

#### 7. **System Settings** (`/admin/settings`)
- General settings (System name, Language, Timezone, Date format)
- Appearance settings (Dark mode toggle)
- Notification settings
- Backup & Archive settings with auto-archive configuration
- File upload settings (Max size, Allowed types)
- System information display

## 🎨 UI Components

### Shared Components (`/app/components/admin/`)

- **Sidebar.tsx** - Collapsible navigation sidebar with icons
- **Topbar.tsx** - Top navigation bar with search and profile dropdown
- **Card.tsx** - Reusable card components with variants
- **Table.tsx** - Data table components with hover effects
- **Modal.tsx** - Customizable modal dialog with size options

## 🛠️ Tech Stack

- **Framework:** Next.js 16.0.1 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **Utilities:** clsx, tailwind-merge
- **Authentication:** JWT with role-based access control

## 📦 Dependencies

```json
{
  "lucide-react": "^0.552.0",
  "recharts": "^3.3.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.3.1"
}
```

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Run development server:**
   ```bash
   pnpm dev
   ```

3. **Access the admin panel:**
   - Login at: `http://localhost:3000`
   - Use demo credentials:
     - Admin: `admin@ebolt.uz` / `admin123`
     - Office Manager: `office@ebolt.uz` / `office123`
     - SEO: `seo@ebolt.uz` / `seo123`

## 📂 Project Structure

```
app/
├── admin/
│   ├── layout.tsx           # Admin layout with sidebar & topbar
│   ├── page.tsx             # Redirect to dashboard
│   ├── dashboard/
│   │   └── page.tsx         # Dashboard with stats & charts
│   ├── users/
│   │   └── page.tsx         # User management
│   ├── letters/
│   │   └── page.tsx         # Letters management
│   ├── letterhead/
│   │   └── page.tsx         # Letterhead settings
│   ├── workflow/
│   │   └── page.tsx         # Workflow editor
│   ├── reports/
│   │   └── page.tsx         # Reports & analytics
│   └── settings/
│       └── page.tsx         # System settings
├── components/
│   └── admin/
│       ├── Sidebar.tsx      # Navigation sidebar
│       ├── Topbar.tsx       # Top navigation bar
│       ├── Card.tsx         # Card component
│       ├── Table.tsx        # Table components
│       └── Modal.tsx        # Modal dialog
├── context/
│   └── AuthContext.tsx      # Authentication context
├── lib/
│   └── utils.ts             # Utility functions
└── api/
    ├── login/
    ├── logout/
    └── me/
```

## 🎯 Navigation Structure

```
Dashboard
├── Overview Cards
├── Charts
└── Recent Activity

Users
├── User Table
├── Search & Filter
└── CRUD Operations

Letters
├── Letter Table
├── Filters (Status, Type)
└── Preview Modal

Letterhead
├── Logo Upload
├── Header/Footer Images
├── Organization Info
└── Live Preview

Workflow
├── Step Editor
├── Drag & Drop
└── Permissions

Reports
├── Metrics
├── Charts
└── Export

Settings
├── General
├── Appearance
├── Notifications
└── Backup
```

## 🎨 Design Features

- **Responsive Design:** Mobile-first approach, works on all screen sizes
- **Modern UI:** Clean, professional interface with smooth transitions
- **Color Scheme:** Blue primary, with semantic colors for status indicators
- **Icons:** Lucide React icons throughout
- **Animations:** Smooth hover effects and transitions
- **Accessibility:** Semantic HTML and proper ARIA labels

## 🔒 Authentication

- JWT-based authentication
- Role-based access control (Admin, Office Manager, SEO)
- Protected routes with middleware
- Automatic redirects based on user role
- Session management with cookies

## 📊 Mock Data

All pages use mock data for demonstration. When ready to integrate with backend:
- Replace mock arrays with API calls
- Connect to Supabase or your database
- Implement real CRUD operations
- Add loading states and error handling

## 🚀 Next Steps

### Backend Integration:
1. Connect to Supabase or your database
2. Implement real API endpoints
3. Add file upload functionality
4. Integrate with email service for notifications

### Additional Features:
1. Real-time notifications
2. Advanced search and filters
3. Bulk operations
4. Export to PDF functionality
5. Email templates
6. Audit logs

## 📝 Notes

- All UI components are fully functional with mock data
- No backend logic implemented yet
- Ready for API integration
- Fully responsive on all devices
- Dark mode UI prepared (toggle in settings)

## 🐛 Known Issues

- Minor TypeScript warning in reports page (percent type) - doesn't affect functionality
- Modal onClose prop lint warning - expected Next.js behavior

## 📄 License

MIT

---

**Built with ❤️ for Football Club eBolt**
