# ShopMyUniform - Production Deployment Guide

This guide outlines the production build and deployment architecture for ShopMyUniform.

---

## 🏗️ Architecture Overview

The system consists of two primary applications:
1. **Frontend**: Next.js 14 Web Application (`/frontend`)
2. **Backend**: Express REST API & Prisma ORM (`/backend`) connected to PostgreSQL

---

## 🛠️ Environment Configuration

### Frontend Environment Variables (`frontend/.env.local` / `.env.production`)
```ini
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=549393671569-c047suf2nsk4t7107o0h8g5o2vdhs3lm.apps.googleusercontent.com
```

### Backend Environment Variables (`backend/.env`)
```ini
PORT=4000
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
DATABASE_URL="postgresql://user:password@localhost:5432/shopmyuniform?schema=public"
JWT_SECRET="production-jwt-secret-key"
GOOGLE_CLIENT_ID="549393671569-c047suf2nsk4t7107o0h8g5o2vdhs3lm.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."
GOOGLE_CALLBACK_URL="http://localhost:4000/api/auth/google/callback"
```

---

## 🚀 Build Instructions

### 1. Root Development Command
Run both applications concurrently in development mode:
```bash
npm run dev
```

### 2. Backend Build & Migration
```bash
cd backend
npm install
npx prisma migrate deploy
npm run build
npm start
```

### 3. Frontend Production Build
```bash
cd frontend
npm install
npm run build
npm start
```
