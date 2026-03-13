# 🌐 Entangl - Modern Social Media Platform

<div align="center">


**Connect, Share, and Engage with the World**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[Live Demo](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 About

**Entangl** is a modern, feature-rich social media platform built with cutting-edge web technologies. It provides a seamless experience for users to connect, share content, and engage with their community through posts, comments, and real-time interactions.

Designed with mobile-first principles, Entangl offers a responsive UI that works beautifully across all devices, complete with push notifications to keep users engaged even when the app is closed.

---

## ✨ Features

### 🔐 Authentication & User Management
- **Secure Authentication** - Email/password authentication via Supabase
- **User Profiles** - Customizable profiles with bio, avatar, and cover images
- **Follow System** - Follow/unfollow users and view follower/following lists
- **Profile Editing** - Update personal information and upload profile pictures

### 📱 Posts & Content
- **Create Posts** - Share text and images with your followers
- **Image Upload** - Support for image attachments using Supabase Storage
- **Delete Posts** - Remove your own posts anytime
- **Post Interactions** - Like, dislike, comment, and bookmark posts
- **Reaction Viewers** - See who liked or disliked your posts

### 💬 Comments & Engagement
- **Threaded Comments** - Comment on posts with full threading support
- **Comment Replies** - Post authors can reply to comments
- **Delete Comments** - Remove your own comments and replies
- **Real-time Updates** - Instant comment updates using Supabase real-time

### 🔔 Notifications
- **In-App Notifications** - Get notified about follows, likes, and comments
- **Real-time Updates** - Live notification badge with unread count
- **Web Push Notifications** - Receive notifications even when app is closed
- **Notification Management** - Mark as read, delete, or view notification history

### 🔍 Discovery & Search
- **User Search** - Find users by name or username with live search
- **Profile Navigation** - Click on any user to view their profile
- **Explore Feed** - Browse all posts from the community

### 🎨 UI/UX
- **Modern Design** - Sleek purple/pink gradient theme
- **Responsive Layout** - Fully optimized for mobile and desktop
- **Dark Mode Ready** - Clean, accessible interface
- **Smooth Animations** - Polished interactions and transitions

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 16.1.2](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Real-time subscriptions
  - Storage buckets
- **[Supabase SSR](https://supabase.com/docs/guides/auth/server-side-rendering)** - Server-side rendering support

### Push Notifications
- **[Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)** - Browser push notifications
- **[Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)** - Background notification handling
- **[web-push](https://www.npmjs.com/package/web-push)** - VAPID protocol implementation





## 📁 Project Structure
```
entangl/
├── app/                        # Next.js app directory
│   ├── api/                   # API routes
│   ├── home/                  # Home feed page
│   ├── profile/               # Profile pages
│   ├── notifications/         # Notifications page
│   ├── create-post/          # Create post page
│   ├── login/                # Login page
│   └── register/             # Registration page
├── components/                # Reusable components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── UserAvatar.tsx
├── lib/                       # Business logic & utilities
│   ├── supabase/             # Supabase clients
│   ├── auth.ts               # Authentication
│   ├── posts.ts              # Post operations
│   ├── users.ts              # User operations
│   ├── notifications.ts      # Notifications
│   └── pushNotifications.ts  # Push notifications
├── public/                    # Static assets
│   ├── sw.js                 # Service worker
│   └── icons/                # App icons
└── scripts/                   # Utility scripts
    └── generate-vapid-keys.js
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Write TypeScript with proper types
- Follow the existing code style
- Test your changes thoroughly
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Portfolio: [yourwebsite.com](https://yourwebsite.com)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open Source Firebase Alternative
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Lucide](https://lucide.dev/) - Icon Library
- [Vercel](https://vercel.com/) - Deployment Platform

---

<div align="center">

**Made with ❤️ by [Your Name]**

If you found this project helpful, please consider giving it a ⭐️

</div>
