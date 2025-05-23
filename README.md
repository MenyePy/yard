# Yard Sale Pro

A modern web application for managing yard sales, built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- **Admin Dashboard**
  - Secure admin login
  - Product management (create, update, delete)
  - Image upload for products
  - Offer management
  - Analytics and insights

- **Customer Features**
  - Browse products with filtering and sorting
  - View product details with image gallery
  - Make purchase requests
  - Submit price offers
  - Contact sellers directly

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for image uploads
- Cloudinary for image storage

### Frontend
- Next.js 14 (React)
- Tailwind CSS
- TypeScript
- React Query
- NextAuth.js

## Project Structure

```
yardsaleproject/
├── backend/           # Express.js backend
│   ├── src/
│   │   ├── config/   # Configuration files
│   │   ├── models/   # MongoDB models
│   │   ├── routes/   # API routes
│   │   ├── middleware/# Custom middleware
│   │   └── utils/    # Utility functions
│   └── package.json
│
└── frontend/         # Next.js frontend
    ├── src/
    │   ├── app/     # Next.js app directory
    │   ├── components/# React components
    │   ├── lib/     # Utility functions
    │   └── types/   # TypeScript types
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

### Environment Variables

Backend (.env):
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Frontend (.env.local):
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Running the Application

1. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Deployment

The application is configured for deployment on Vercel. The frontend will be automatically deployed when pushing to the main branch.

## License

MIT 