# Electronics E-Commerce Shop with Admin Dashboard

A full-featured e-commerce platform for electronics with MongoDB Atlas database integration.

## 🚀 Features

- User authentication and account management
- Product catalog with categories and search
- Shopping cart functionality
- Order management
- Wishlist functionality
- Admin dashboard for product and user management
- MongoDB Atlas database integration
- Responsive design for all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth.js
- **State Management**: Zustand
- **Styling**: Tailwind CSS, DaisyUI

## 📋 Prerequisites

- Node.js 16+ and npm/yarn
- MongoDB Atlas account

## 🔧 Setup & Installation

1. **Clone the repository**

```bash
git clone <repo-url>
cd Electronics-eCommerce-Shop-With-Admin-Dashboard-NextJS-NodeJS-main
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory and add:

```
# MongoDB Atlas connection string
DATABASE_URL="mongodb+srv://<username>:<password>@<your-cluster-url>/electronics-ecommerce?retryWrites=true&w=majority"

# Next Auth configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# API URL for Next.js API routes
NEXT_PUBLIC_API_URL=/api
```

Replace `<username>`, `<password>`, and `<your-cluster-url>` with your MongoDB Atlas credentials.

4. **Generate Prisma client**

```bash
npm run prisma:generate
```

5. **Initialize the database with sample data (optional)**

```bash
npm run db:init
```

This will create an admin user with credentials:
- Email: admin@example.com
- Password: admin123

Plus some sample product categories and products.

## 🚀 Running the Application

```bash
npm run dev
```

Visit http://localhost:3000 to view the application.

## 💻 Admin Dashboard

To access the admin dashboard, log in with the admin credentials (see above) and navigate to `/dashboard`.

## 📱 User Features

- Browse products by category
- Search for products
- Add products to cart or wishlist
- Place orders
- View order history

## 🔑 Key API Endpoints

- `/api/products` - Product management
- `/api/categories` - Category management
- `/api/search` - Product search
- `/api/orders` - Order management
- `/api/wishlist` - Wishlist management
- `/api/users` - User management (admin only)
- `/api/auth` - Authentication via NextAuth

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
