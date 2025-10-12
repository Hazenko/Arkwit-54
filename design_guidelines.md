# Design Guidelines for Arkwit 54 Neighborhood Service Web App

## Design Approach
**Hybrid Approach**: Drawing from Material Design's information density and community platforms like Facebook Groups and Nextdoor for social engagement patterns. The design balances functional utility (admin dashboard, post management) with community warmth (social interaction, neighborhood connection).

**Core Principles**:
- Community-First: Design emphasizes connection and belonging
- Clarity & Hierarchy: Role-based permissions must be visually clear
- Arabic-Native: RTL layout with proper Arabic typography
- Trust & Safety: Professional appearance for neighborhood credibility

---

## Color Palette

### Section Identity Colors (Light Mode)
- **Social Section**: 217 91% 60% (Blue) - Primary for social posts
- **Cultural Section**: 142 71% 45% (Green) - Primary for cultural posts  
- **General Section**: 215 16% 47% (Gray) - Primary for general discussions

### Core Brand Colors (Light Mode)
- **Primary**: 217 91% 60% (Vibrant Blue - trust, community)
- **Background**: 0 0% 100% (White)
- **Surface**: 220 13% 98% (Light Gray)
- **Text Primary**: 222 47% 11% (Dark Blue-Gray)
- **Text Secondary**: 215 16% 47% (Medium Gray)
- **Border**: 214 32% 91% (Light Blue-Gray)

### Dark Mode
- **Background**: 222 47% 11%
- **Surface**: 217 33% 17%
- **Text Primary**: 210 40% 98%
- **Text Secondary**: 215 20% 65%
- **Border**: 215 28% 27%

### Semantic Colors
- **Success**: 142 71% 45% (Green)
- **Warning**: 38 92% 50% (Amber)
- **Error**: 0 84% 60% (Red)
- **Admin Badge**: 271 91% 65% (Purple)
- **Moderator Badge**: 217 91% 60% (Blue)

---

## Typography

### Font Families
- **Arabic Primary**: 'Tajawal', 'Noto Sans Arabic', sans-serif (for RTL content)
- **Latin/Numbers**: 'Inter', system-ui, sans-serif (for English text)
- **Monospace**: 'Fira Code', monospace (admin tables, technical data)

### Type Scale
- **Display**: 2.5rem/3rem (40px/48px) - Hero headings, section titles
- **H1**: 2rem/2.5rem (32px/40px) - Page titles
- **H2**: 1.5rem/2rem (24px/32px) - Section headers
- **H3**: 1.25rem/1.75rem (20px/28px) - Card titles, post headers
- **Body**: 1rem/1.5rem (16px/24px) - Content, comments
- **Small**: 0.875rem/1.25rem (14px/20px) - Metadata, timestamps
- **Tiny**: 0.75rem/1rem (12px/16px) - Labels, badges

### Font Weights
- Regular: 400 (body text)
- Medium: 500 (emphasis, buttons)
- Semibold: 600 (headings, card titles)
- Bold: 700 (display, hero)

---

## Layout System

### Spacing Units
**Primary spacing scale**: 2, 4, 6, 8, 12, 16, 24
- Micro: p-2, m-2 (8px) - Badges, tight spacing
- Small: p-4, gap-4 (16px) - Cards, form fields
- Medium: p-6, gap-6 (24px) - Sections, containers
- Large: p-8, gap-8 (32px) - Page padding
- XL: p-12, p-16 (48px/64px) - Section dividers

### Container Strategy
- **Max Width**: max-w-7xl (1280px) - Main content
- **Section Width**: max-w-6xl (1152px) - Post feeds, forms
- **Admin Tables**: max-w-full with overflow-x-auto
- **RTL**: Apply dir="rtl" to HTML, use text-right as default

### Grid Patterns
- **Post Feed**: Single column mobile, 2-column tablet (md:grid-cols-2)
- **Admin Dashboard**: 3-4 cards desktop (lg:grid-cols-4)
- **Comments**: Nested threading with mr-6 indentation (RTL: ml-6)

---

## Component Library

### Navigation
- **Top Navbar**: Sticky, backdrop-blur, role badge display
- **Section Tabs**: Horizontal scroll on mobile, colored indicators
- **Mobile Menu**: Slide-in drawer (RTL-aware from left)

### Post Cards
- **Elevated Cards**: shadow-md, rounded-lg, border-r-4 (section color accent)
- **Post Header**: Avatar + Name + Role Badge + Timestamp
- **Content**: max-w-prose, proper Arabic line-height
- **Actions**: Like counter, comment count, action menu (moderator/admin)

### Forms
- **Input Fields**: Rounded-lg, focus:ring-2, RTL placeholder alignment
- **Text Areas**: min-h-32 for post content
- **Buttons**: 
  - Primary: Solid section color background
  - Secondary: Outline with hover state
  - Danger: Red for delete actions

### Admin Components
- **User Table**: Sticky header, striped rows, role color indicators
- **Stats Cards**: Icon + Number + Label, section color accents
- **Role Selector**: Dropdown with visual role hierarchy
- **Confirmation Modals**: Centered overlay, clear action buttons

### Social Features
- **Like Button**: Heart icon, animated fill on click
- **Comment Thread**: Nested with connecting lines (RTL-adjusted)
- **User Avatar**: Circular, 32px default, 40px for post authors

### Authentication
- **Login/Register Forms**: Centered card, max-w-md
- **Password Field**: Toggle visibility icon
- **Form Validation**: Inline error messages with error color

---

## Images

### Hero Section (Login/Landing)
**Large hero image**: Community-themed illustration or photograph showing neighborhood life - warm, welcoming, diverse residents interacting. Position: Top of login page, 50vh height on desktop, 40vh mobile. Overlay: Dark gradient (from bottom) for text readability.

### User Avatars
Default avatar placeholders with initials on section-colored backgrounds when no photo uploaded.

### Empty States
Simple illustrations for:
- No posts yet (community building)
- No comments (start conversation)
- No users (admin panel)

### Section Icons
- Social: People/community icon
- Cultural: Book/arts icon  
- General: Grid/topics icon

---

## Accessibility & RTL

- **RTL Support**: All spacing, borders, text alignment reversed
- **Arabic Font Loading**: Preload Tajawal for performance
- **Color Contrast**: All text meets WCAG AA (4.5:1 minimum)
- **Focus States**: Clear ring-2 indicators on interactive elements
- **Dark Mode**: Consistent implementation across all components
- **Keyboard Navigation**: Tab order follows RTL flow

---

## Visual Hierarchy

1. **Section Color Coding**: Consistent border-right (RTL) accent on all section-specific content
2. **Role Badges**: Small, pill-shaped, positioned next to usernames
3. **Typography Scale**: Clear 5-level hierarchy (Display → H1 → H2 → Body → Small)
4. **Whitespace**: Generous padding (p-6 to p-8) for breathing room
5. **Elevation**: 3-level shadow system (sm, md, lg) for depth

This design creates a trustworthy, community-focused platform with clear visual hierarchy, proper Arabic support, and role-based design patterns that make permissions immediately apparent.