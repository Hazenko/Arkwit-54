# Arkwit 54 - Neighborhood Service Platform

## Overview
Arkwit 54 is a comprehensive neighborhood service web application built with React.js, Node.js (Express), and PostgreSQL. The platform enables residents to connect, share, and engage through three distinct content sections: Social, Cultural, and General discussions. The system implements role-based access control with JWT authentication.

## Recent Changes (October 2025)
- ✅ Implemented complete authentication system with JWT and bcrypt
- ✅ Created PostgreSQL database schema with users, posts, comments, and likes tables
- ✅ Built role-based access control (Admin, Social Moderator, Cultural Moderator, User)
- ✅ Developed three content sections (Social, Cultural, General) with section-specific permissions
- ✅ Implemented post management (create, edit, delete) based on user roles
- ✅ Added social features (likes and comments) for all authenticated users
- ✅ Created admin dashboard for user management and statistics
- ✅ Designed Arabic RTL layout with TailwindCSS and dark mode support
- ✅ All API endpoints tested and working correctly

## Project Architecture

### Tech Stack
- **Frontend**: React.js + TailwindCSS + Wouter (routing)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Neon Cloud)
- **Auth**: JWT (JSON Web Token)
- **Password Security**: bcrypt hashing

### User Roles & Permissions

| Role | Permissions |
|------|------------|
| **Admin** | Full system access - manage all users, posts, and roles |
| **Social Moderator** | Create, edit, delete posts in Social section |
| **Cultural Moderator** | Create, edit, delete posts in Cultural section |
| **User** | View all posts, like and comment only |

### Database Schema

**Users Table:**
- id (integer, auto-increment)
- fullName (text)
- email (text, unique)
- phone (text, unique)
- passwordHash (text)
- role (text: 'user', 'social_moderator', 'cultural_moderator', 'admin')
- createdAt (timestamp)

**Posts Table:**
- id (integer, auto-increment)
- title (text)
- content (text)
- section (text: 'social', 'cultural', 'general')
- userId (integer, foreign key)
- createdAt (timestamp)

**Comments Table:**
- id (integer, auto-increment)
- postId (integer, foreign key)
- userId (integer, foreign key)
- commentText (text)
- createdAt (timestamp)

**Likes Table:**
- id (integer, auto-increment)
- postId (integer, foreign key)
- userId (integer, foreign key)
- createdAt (timestamp)

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current authenticated user

#### Users (Admin Only)
- `GET /api/users` - List all users
- `PATCH /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user

#### Posts
- `GET /api/posts/:section` - Get posts by section (social/cultural/general/all)
- `GET /api/posts/detail/:id` - Get single post by ID
- `POST /api/posts` - Create new post (moderators/admin)
- `PATCH /api/posts/:id` - Edit post
- `DELETE /api/posts/:id` - Delete post

#### Comments
- `GET /api/comments/:postId` - Get comments for a post
- `POST /api/comments` - Add comment to post

#### Likes
- `POST /api/likes` - Toggle like on post

### Frontend Routes
- `/login` - Login page
- `/register` - Registration page
- `/` - Dashboard with three content sections (protected)
- `/admin` - Admin panel for user management (admin only)

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── post-card.tsx
│   │   │   ├── comments-section.tsx
│   │   │   ├── create-post-dialog.tsx
│   │   │   ├── edit-post-dialog.tsx
│   │   │   ├── post-detail-dialog.tsx
│   │   │   ├── protected-route.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── pages/
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── dashboard.tsx
│   │   │   └── admin.tsx
│   │   ├── lib/
│   │   │   ├── auth-context.tsx
│   │   │   ├── theme-context.tsx
│   │   │   └── queryClient.ts
│   │   └── App.tsx
├── server/
│   ├── middleware/
│   │   └── auth.ts
│   ├── db.ts
│   ├── storage.ts
│   └── routes.ts
├── shared/
│   └── schema.ts
└── design_guidelines.md
```

## Design Guidelines
The application follows comprehensive design guidelines documented in `design_guidelines.md`:
- **Arabic RTL Support**: Full right-to-left layout with Tajawal font
- **Section Color Coding**: 
  - Social (Blue): #217EFF
  - Cultural (Green): #35B663
  - General (Gray): #708090
- **Role Badges**: Color-coded visual indicators for user roles
- **Dark Mode**: Complete dark theme support
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG AA compliance

## Environment Variables
Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `SESSION_SECRET` - Session secret for Express

## Running the Project
1. Install dependencies: `npm install`
2. Set up environment variables in `.env`
3. Push database schema: `npm run db:push`
4. Start development server: `npm run dev`
5. Access at: `http://localhost:5000`

## Key Features
✅ Secure JWT authentication with bcrypt password hashing
✅ Role-based permissions system
✅ Three content sections (Social, Cultural, General)
✅ Post creation, editing, and deletion with role validation
✅ Like and comment functionality
✅ Admin dashboard with user management
✅ Real-time statistics (users, posts, comments)
✅ Arabic language support with RTL layout
✅ Dark mode toggle
✅ Responsive mobile design
✅ PostgreSQL database with proper relations

## Testing
API endpoints can be tested using the included `test-api.sh` script:
```bash
chmod +x test-api.sh
./test-api.sh
```

## Future Enhancements
- Post search and filtering
- Notification system for comments and likes
- User profile pages with activity history
- Post reporting and moderation queue
- Image upload support for posts and avatars
- Real-time updates using WebSockets
