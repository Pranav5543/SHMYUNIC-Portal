# ShopMyUniform - REST API Documentation

The ShopMyUniform backend API is a Node.js / Express service communicating with a PostgreSQL database via Prisma ORM.

## Base URL
- Development: `http://localhost:4000/api`
- Production: `https://api.shopmyuniform.com/api`

---

## Authentication Endpoints (`/api/auth`)

### 1. POST `/api/auth/login`
Authenticates a user with email, password, and optional role context.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password@123",
    "role": "STUDENT_PARENT"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": "usr-123",
      "email": "user@example.com",
      "firstName": "Arun",
      "lastName": "Sharma",
      "role": "STUDENT_PARENT",
      "schoolId": "sch-001"
    }
  }
  ```

### 2. POST `/api/auth/register`
Self-service registration for public commercial roles (`STUDENT_PARENT`, `GENERAL_CUSTOMER`, `EMPLOYEE`).
- **Request Body**:
  ```json
  {
    "email": "newuser@example.com",
    "password": "Password@123",
    "firstName": "Priya",
    "lastName": "Verma",
    "role": "GENERAL_CUSTOMER"
  }
  ```

### 3. GET `/api/auth/google`
Initiates Google OAuth 2.0 authorization redirect.
- **Query Parameters**: `?role=STUDENT_PARENT` | `GENERAL_CUSTOMER` | `EMPLOYEE`

### 4. GET `/api/auth/google/callback`
Handles OAuth 2.0 authorization code exchange with Google, looks up or creates user in PostgreSQL, and issues JWT token.

---

## Product Endpoints (`/api/products`)

### 1. GET `/api/products`
Retrieves products filtered by user role context and search query.
- **Query Parameters**: `?role=GENERAL_CUSTOMER`, `?search=scrubs`, `?category=Healthcare`

### 2. GET `/api/products/:id`
Retrieves single product details with inventory variants.

---

## Cart & Checkout Endpoints (`/api/checkout`)

### 1. POST `/api/checkout`
Processes an order transaction, creates PostgreSQL `Order` and `OrderItem` records, updates inventory, and generates receipt.
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Request Body**:
  ```json
  {
    "items": [
      { "productId": "prd-001", "variantId": "var-001", "quantity": 2, "unitPrice": 42.00 }
    ],
    "shippingAddress": { ... },
    "paymentMethod": "CARD"
  }
  ```

---

## Admin & Operations Endpoints

- **GET `/api/admin/metrics`**: Platform overview & metrics (`INTERNAL_ADMIN`).
- **GET `/api/admin/audit-logs`**: Audit trail of system changes (`INTERNAL_ADMIN`).
- **GET `/api/operations/orders`**: Fulfillment pick & pack station (`WAREHOUSE`).
- **GET `/api/vendor/orders`**: Purchase orders and RFQs (`VENDOR`).
