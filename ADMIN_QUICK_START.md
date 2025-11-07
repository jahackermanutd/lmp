# Admin Panel - Quick Start Guide

## 🔐 Login

1. Navigate to `http://localhost:3000`
2. Use demo credentials:
   - **Admin:** `admin@ebolt.uz` / `admin123`
   - **Office Manager:** `office@ebolt.uz` / `office123`  
   - **SEO:** `seo@ebolt.uz` / `seo123`

## 🧭 Navigation

After logging in, you'll see:
- **Sidebar (Left):** Main navigation menu
- **Topbar (Top):** Search bar, notifications, and profile menu
- **Main Content Area:** Current page content

### Sidebar Menu Items:

1. **📊 Dashboard** - Overview and analytics
2. **👥 Users** - Manage system users
3. **📄 Letters** - Manage all letters
4. **🖼️ Letterhead** - Design settings
5. **🔀 Workflow** - Approval process
6. **📈 Reports** - Analytics and stats
7. **⚙️ Settings** - System configuration

## 📖 Page Guides

### 1. Dashboard (`/admin/dashboard`)
**What you'll see:**
- 4 stat cards (Total Letters, Pending, Approved, Users)
- Line chart showing letter trends
- Recent activity feed

**What you can do:**
- View overall system statistics
- Monitor recent actions
- Track letter creation trends

---

### 2. Users (`/admin/users`)
**What you'll see:**
- Search bar
- User table with columns: Name, Email, Role, Status, Last Login
- Action buttons (Edit, Delete)

**What you can do:**
- Click **"Add User"** to create new user
- Use **search bar** to find users
- Click **edit icon** (pencil) to modify user
- Click **delete icon** (trash) to remove user
- Change user roles and status in the edit modal

---

### 3. Letters (`/admin/letters`)
**What you'll see:**
- Search and filter controls
- Letter table with: Title, Author, Type, Status, Date
- Action buttons (View, Edit, Delete)

**What you can do:**
- Search letters by title or author
- Filter by status (Draft, Pending, Approved, Rejected)
- Filter by type (Contract, Agreement, etc.)
- Click **eye icon** to preview letter
- Click **"Create Letter"** to add new letter
- Export and archive options

---

### 4. Letterhead (`/admin/letterhead`)
**What you'll see:**
- Upload areas for Logo, Header, Footer
- Organization information form
- Live A4 preview on the right

**What you can do:**
- Click upload areas to select images
- Fill in organization details
- See changes in real-time preview
- Click **"Save Settings"** to apply
- Click **"Reset to Default"** to restore

---

### 5. Workflow (`/admin/workflow`)
**What you'll see:**
- List of workflow steps
- Drag handles on each step
- Add Step button
- Workflow summary panel

**What you can do:**
- **Drag steps** to reorder workflow
- Click **edit icon** to modify step details
- Click **"Add Step"** to create new step
- Click **trash icon** to delete step
- Toggle approval/rejection permissions
- Click **"Save Workflow"** when done

---

### 6. Reports (`/admin/reports`)
**What you'll see:**
- 4 key metric cards with trends
- Monthly trends line chart
- Status distribution pie chart
- Category bar chart
- Top users table

**What you can do:**
- Change time period (dropdown at top)
- View detailed analytics
- Click **"Export Report"** to download
- Monitor approval rates and trends

---

### 7. Settings (`/admin/settings`)
**What you'll see:**
- Multiple setting categories in cards
- Toggle switches for features
- Input fields for configuration

**What you can do:**
- Set system name and language
- Choose timezone and date format
- Toggle dark mode (applies system-wide)
- Enable/disable notifications
- Configure auto-backup
- Set file upload limits
- Click **"Save Settings"** to apply

---

## 🎨 UI Features

### Collapsible Sidebar
- Click the **arrow icon** at top of sidebar to collapse/expand
- Collapsed view shows only icons
- Hover over icons to see labels

### Profile Menu
- Click **profile icon** in topbar
- Shows your name, email, and role
- Click **"Logout"** to sign out

### Search
- Global search bar in topbar
- Search across the system (feature ready for implementation)

### Notifications
- Bell icon in topbar shows notification count
- Red dot indicates unread notifications

---

## 🎯 Interactive Elements

### Cards
- Hover over cards for subtle shadow effect
- Clickable cards navigate to details

### Tables
- Rows highlight on hover
- Click column headers to sort (ready for implementation)
- Action buttons appear on hover

### Modals
- Click outside modal to close
- Press ESC key to close
- Click X button to close

### Forms
- Real-time validation (ready for implementation)
- Required fields marked
- Helpful placeholder text

---

## 🔄 Workflow Example

**Creating a Letter (Example Flow):**

1. Go to **Letters** page
2. Click **"Create Letter"**
3. Fill in letter details
4. Save as **Draft**
5. Submit for **Review**
6. Goes to **Workflow** steps:
   - Step 1: Letter Writer creates
   - Step 2: Sporting Director reviews
   - Step 3: Director approves
   - Step 4: Admin archives
7. Check status in **Dashboard**
8. View final letter in **Letters** page

---

## 💡 Tips

- **Drag & Drop:** Works in Workflow page for reordering steps
- **Live Preview:** Letterhead page shows changes instantly
- **Filters:** Combine multiple filters for precise results
- **Mock Data:** All data is sample data for demonstration
- **Responsive:** Resize browser to see mobile view

---

## 🐛 Troubleshooting

**Page not loading?**
- Check if dev server is running (`pnpm dev`)
- Clear browser cache and refresh

**Can't see changes?**
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

**Logged out unexpectedly?**
- JWT token expires after 7 days
- Simply log in again

---

## 📱 Mobile View

The admin panel is fully responsive:
- Sidebar becomes a drawer menu
- Tables become scrollable
- Cards stack vertically
- Touch-friendly buttons

---

**Need help? Check the main README or contact the development team.**
