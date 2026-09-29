# ShopMyUniform — Enterprise Multi-Vertical Uniform Platform

ShopMyUniform is a multi-vertical uniform commerce marketplace supporting Students, Parents, Corporate Workwear, Healthcare Scrubs, and B2B Institutional Procurement.

## System Architecture

The project is structured as two independent applications:
- **`frontend/`**: Next.js 14 Web Application (UI, Role-Based Portals, App Router)
- **`backend/`**: Node.js & Express REST API (Auth, Role-Based Security, Google OAuth, Tenant Isolation)

## Running the Application

### 1. Install Dependencies
```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2. Start Applications
From root directory:
```bash
npm run dev
```

Or individually:
- **Frontend**: `cd frontend && npm run dev` (Runs at `http://localhost:3000`)
- **Backend**: `cd backend && npm run dev` (Runs at `http://localhost:4000`)
