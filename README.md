# Guild User

A modern, feature-rich web application built with cutting-edge technologies for music and content creators. This platform enables users to manage their intellectual property, release music, and engage with their audience through various channels.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI Library:** NextUI 2
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Blockchain Integration:** Thirdweb
- **Media Processing:** FFmpeg
- **Video Streaming:** Stream.io
- **Payment Processing:** Coinflow Labs

## ✨ Features

- IP Registration and Management
- Pre-release Music Distribution
- Streaming Platform Integration
- Video Processing and Publishing
- Social Media Integration
- Fan Engagement Tools
- Blockchain Integration
- Real-time Notifications
- Responsive Design

## 🛠️ Development Setup

1. **Prerequisites**

   - Node.js 18 or higher
   - npm or yarn
   - Firebase project

2. **Installation**

   ```bash
   # Install dependencies
   npm install

   # Run development server
   npm run dev

   # Build for production
   npm run build

   # Start production server
   npm run start
   ```

## 📁 Project Structure

```shell
│
├── public                          # Public assets folder
├── src
│   ├── app                         # Next.js App Router
│   ├── components                  # React components
│   │   ├── features               # Feature-specific components
│   │   ├── shared                 # Shared components (Header, Footer, etc.)
│   │   ├── skeletons             # Loading state components
│   │   ├── ui                    # Reusable UI components
│   │   └── widgets               # Complex composite components
│   ├── config                     # Configuration files
│   ├── data                       # Static/mock data
│   ├── helpers                    # Utility functions
│   ├── hooks                      # Custom React hooks
│   ├── lib                        # Core utilities
│   ├── providers                  # Context providers
│   ├── services                   # API services
│   ├── stores                     # Zustand stores
│   └── types                      # TypeScript definitions
```

## 🧰 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run sitemap` - Generate sitemap

## 🔧 Code Quality

- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks
- TypeScript for type safety
- Strict mode enabled
