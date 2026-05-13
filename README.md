# Fuel Management System - Backend API

A robust, scalable backend server for the Fuel Management System. Built with Express.js, TypeScript, and PostgreSQL, this API provides comprehensive fuel station management, booking systems, and user authentication capabilities.

## 📋 Overview

The Fuel Backend serves as the core server for the Fuel Management System, handling all business logic, data persistence, and API operations. It manages fuel stations, bookings, user roles, and provides real-time queue management.

**Key Capabilities:**

- User authentication and authorization (Role-based access control)
- Fuel station management and monitoring
- Advanced booking system with queue management
- Multi-user support (Admin, Sub-Admin, User, Guest)
- Real-time fuel availability tracking
- Comprehensive REST API
- Type-safe development with TypeScript

---

## 🛠️ Tech Stack

### Core Framework

- **Express.js** (v5.2.1) - Web server framework
- **Node.js** - Runtime environment
- **TypeScript** - Type-safe development

### Database & ORM

- **PostgreSQL** - Relational database
- **Drizzle ORM** (v0.45.2) - Database ORM with type safety
- **postgres** (v3.4.9) - PostgreSQL driver

### Security & Authentication

- **JWT (jsonwebtoken)** - Token-based authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Development Tools

- **nodemon** - Auto-reload during development
- **tsx** - TypeScript execution
- **Drizzle Kit** - Database migrations and introspection

---

## 📚 Database Schema

### Users Table

Stores user account information and role assignments.

```
- id: UUID (Primary Key)
- email: VARCHAR (Unique)
- password: TEXT (Hashed with bcrypt)
- username: VARCHAR
- role: ENUM ('admin', 'subAdmin', 'user')
- createdBy: UUID (Reference to creator)
- isActive: BOOLEAN (Account status)
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

### Stations Table

Manages fuel station locations and details.

```
- id: UUID (Primary Key)
- name: VARCHAR
- code: VARCHAR (Unique station code)
- latitude: DOUBLE PRECISION (GPS coordinate)
- longitude: DOUBLE PRECISION (GPS coordinate)
- isActive: BOOLEAN (Station operational status)
- ownerId: UUID (Sub-admin/Manager reference)
- createdAt: TIMESTAMP
```

### Fuel Types Table

Catalog of available fuel types.

```
- id: SERIAL (Primary Key)
- name: VARCHAR (Unique fuel type name)
```

### Station Fuel Table

Tracks fuel inventory at each station.

```
- id: UUID (Primary Key)
- stationId: UUID (Foreign Key)
- fuelTypeId: INTEGER (Foreign Key)
- quantity: DOUBLE PRECISION (Available quantity)
- isAvailable: BOOLEAN (Availability status)
- updatedAt: TIMESTAMP
```

### Bookings Table

Records all fuel booking transactions.

```
- id: UUID (Primary Key)
- bookingNumber: VARCHAR (Unique, human-readable)
- stationId: UUID (Foreign Key)
- fuelTypeId: INTEGER (Foreign Key)
- userId: UUID (For registered users)
- guestEmail: VARCHAR (For guest bookings)
- plateNumber: VARCHAR (Vehicle registration)
- queueNumber: INTEGER (Position in queue)
- status: ENUM ('PENDING', 'COMPLETED', 'CALLED', 'EXPIRED', 'REJECTED', 'CANCELLED')
- createdAt: TIMESTAMP
```

### Station Queue Counter Table

Tracks daily queue numbering for each station.

```
- id: SERIAL (Primary Key)
- stationId: UUID (Foreign Key)
- date: DATE
- lastQueue: INTEGER (Last queue number issued)
```

---

## 📁 Project Structure

```
fuel-backend/
├── src/
│   ├── index.ts                    # Server entry point
│   ├── config/
│   │   └── db.ts                   # Database configuration
│   ├── controllers/                # Request handlers
│   │   ├── auth.controller.ts      # Authentication logic
│   │   ├── station.controller.ts   # Station management
│   │   ├── booking.controller.ts   # Booking operations
│   │   ├── admin.controller.ts     # Admin operations
│   │   └── manager.controller.ts   # Manager operations
│   ├── routes/                     # API route definitions
│   │   ├── auth.routes.ts          # Auth endpoints
│   │   ├── station.routes.ts       # Station endpoints
│   │   ├── booking.routes.ts       # Booking endpoints
│   │   ├── admin.routes.ts         # Admin endpoints
│   │   ├── manager.routes.ts       # Manager endpoints
│   │   └── test.routes.ts          # Test endpoints
│   ├── middleware/                 # Custom middleware
│   │   ├── auth.middleware.ts      # JWT verification & authorization
│   │   └── stationScope.middleware.ts # Station access control
│   ├── db/                         # Database related
│   │   ├── schema.ts               # Database schema definitions
│   │   ├── seed.ts                 # Database seeding script
│   │   └── seedFuel.ts             # Fuel type seeding
│   └── utils/
│       └── token.ts                # JWT utility functions
├── drizzle/                        # Migration files
├── .env                            # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (local or remote instance)
- Git

### Installation

1. **Navigate to the backend directory**

   ```bash
   cd fuel-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/fuel_db
   PORT=3000
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. **Run database migrations**

   ```bash
   npm run seed
   npm run seed:fuel
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The server will be available at `http://localhost:3000`

---

## 📜 Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Seed database with initial data
npm run seed

# Seed fuel types
npm run seed:fuel
```

---

## 🔐 Authentication & Authorization

### JWT Token Flow

1. User registers or logs in
2. Server validates credentials and issues JWT token
3. Token included in `Authorization` header for protected routes
4. Middleware verifies token and checks user role

### Role-Based Access Control (RBAC)

- **Admin**: Full system access, manage sub-admins and stations
- **SubAdmin**: Manage assigned stations and bookings
- **User**: Browse stations, create bookings
- **Guest**: Limited booking without authentication

### Protected Routes

Routes with `protect` middleware require valid JWT token:

```
Authorization: Bearer <jwt_token>
```

---

## 📡 API Documentation

### Base URL

```
http://localhost:3000
```

### Health Check

```
GET /ping
```

**Response:** `{ "message": "pong" }`

---

## 🔑 Authentication Endpoints

### Register User

```
POST /auth/signup
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "johndoe",
  "role": "user"
}
```

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "role": "user",
  "token": "jwt_token_here"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid input
- `409 Conflict` - Email already exists

---

### Login User

```
POST /auth/signin
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "role": "user",
  "token": "jwt_token_here"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid credentials
- `404 Not Found` - User not found

---

## 🏢 Station Management Endpoints

### Create Station (Admin Only)

```
POST /stations/create
Headers: Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "Station Alpha",
  "code": "ALPHA-001",
  "latitude": 31.5204,
  "longitude": 74.3587,
  "ownerId": "uuid-of-subadmin"
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "name": "Station Alpha",
  "code": "ALPHA-001",
  "latitude": 31.5204,
  "longitude": 74.3587,
  "isActive": true,
  "ownerId": "uuid",
  "createdAt": "2026-05-13T10:00:00Z"
}
```

**Permissions:** Admin only

---

## 📅 Booking Endpoints

### Create Booking

```
POST /bookings/
```

**Request Body:**

```json
{
  "stationId": "uuid",
  "fuelTypeId": 1,
  "plateNumber": "ABC-1234",
  "userId": "uuid-or-null",
  "guestEmail": "guest@example.com-or-null"
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "bookingNumber": "BK-2026-0001",
  "stationId": "uuid",
  "fuelTypeId": 1,
  "plateNumber": "ABC-1234",
  "queueNumber": 15,
  "status": "PENDING",
  "createdAt": "2026-05-13T10:00:00Z"
}
```

---

### Get Station Bookings

```
GET /bookings/station/:stationId
Headers: Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "bookings": [
    {
      "id": "uuid",
      "bookingNumber": "BK-2026-0001",
      "stationId": "uuid",
      "plateNumber": "ABC-1234",
      "queueNumber": 15,
      "status": "PENDING",
      "createdAt": "2026-05-13T10:00:00Z"
    }
  ],
  "total": 25
}
```

**Permissions:** Admin, SubAdmin (for assigned stations)

---

### Call Next Booking

```
PATCH /bookings/station/:stationId/callNext
Headers: Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "message": "Next booking called",
  "currentBooking": {
    "id": "uuid",
    "bookingNumber": "BK-2026-0002",
    "queueNumber": 1,
    "status": "CALLED"
  }
}
```

**Permissions:** Admin, SubAdmin (for assigned stations)

---

### Complete Booking

```
PATCH /bookings/:bookingId/complete
Headers: Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "message": "Booking completed",
  "booking": {
    "id": "uuid",
    "bookingNumber": "BK-2026-0001",
    "status": "COMPLETED"
  }
}
```

**Permissions:** Admin, SubAdmin (for assigned stations)

---

### Cancel Booking

```
PATCH /bookings/:bookingId/cancel
```

**Response:** `200 OK`

```json
{
  "message": "Booking cancelled",
  "booking": {
    "id": "uuid",
    "status": "CANCELLED"
  }
}
```

---

### Reject Booking

```
PATCH /bookings/:bookingId/reject
Headers: Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "message": "Booking rejected",
  "booking": {
    "id": "uuid",
    "status": "REJECTED"
  }
}
```

**Permissions:** Admin, SubAdmin (for assigned stations)

---

### Mark Booking as Pending

```
PATCH /bookings/:bookingId/pending
Headers: Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "message": "Booking marked as pending",
  "booking": {
    "id": "uuid",
    "status": "PENDING"
  }
}
```

**Permissions:** Admin, SubAdmin (for assigned stations)

---

## 👨‍💼 Admin Endpoints

### Create Sub-Admin

```
POST /admin/subadmin
Headers: Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "email": "manager@example.com",
  "password": "managerPassword123",
  "username": "manager1"
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "email": "manager@example.com",
  "username": "manager1",
  "role": "subAdmin",
  "createdBy": "admin-uuid"
}
```

**Permissions:** Admin only

---

### Assign Station to Sub-Admin

```
PATCH /admin/assign-station
Headers: Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "subAdminId": "uuid",
  "stationId": "uuid"
}
```

**Response:** `200 OK`

```json
{
  "message": "Station assigned successfully",
  "station": {
    "id": "uuid",
    "name": "Station Alpha",
    "ownerId": "uuid"
  }
}
```

**Permissions:** Admin only

---

### Get Admin Statistics

```
GET /admin/stats
Headers: Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "totalStations": 15,
  "activeStations": 12,
  "totalBookings": 450,
  "completedBookings": 380,
  "pendingBookings": 70,
  "totalSubAdmins": 5,
  "activeUsers": 120
}
```

**Permissions:** Admin only

---

### Get All Stations

```
GET /admin/stations
Headers: Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "stations": [
    {
      "id": "uuid",
      "name": "Station Alpha",
      "code": "ALPHA-001",
      "latitude": 31.5204,
      "longitude": 74.3587,
      "isActive": true,
      "ownerId": "uuid",
      "createdAt": "2026-05-13T10:00:00Z"
    }
  ],
  "total": 15
}
```

**Permissions:** Admin only

---

### Get All Sub-Admins

```
GET /admin/subadmins
Headers: Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "subAdmins": [
    {
      "id": "uuid",
      "email": "manager@example.com",
      "username": "manager1",
      "role": "subAdmin",
      "isActive": true,
      "createdAt": "2026-05-13T10:00:00Z"
    }
  ],
  "total": 5
}
```

**Permissions:** Admin only

---

### Get Available Assignments

```
GET /admin/assign-new-station
Headers: Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "availableSubAdmins": [
    {
      "id": "uuid",
      "username": "manager1",
      "assignedStations": 3,
      "maxCapacity": 5
    }
  ]
}
```

**Permissions:** Admin only

---

### Toggle Station Status

```
PATCH /admin/:id/toggle-status
Headers: Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "isActive": false
}
```

**Response:** `200 OK`

```json
{
  "message": "Station status updated",
  "station": {
    "id": "uuid",
    "isActive": false
  }
}
```

**Permissions:** Admin only

---

## 🔧 Manager Endpoints

### Create Fuel Type

```
POST /manager/fuel-type
Headers: Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "Premium Petrol"
}
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "name": "Premium Petrol"
}
```

**Permissions:** Admin, SubAdmin

---

### Create Station Fuel

```
POST /manager/station-fuel
Headers: Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "stationId": "uuid",
  "fuelTypeId": 1,
  "quantity": 5000
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "stationId": "uuid",
  "fuelTypeId": 1,
  "quantity": 5000,
  "isAvailable": true,
  "updatedAt": "2026-05-13T10:00:00Z"
}
```

**Permissions:** Admin, SubAdmin (for assigned stations)

---

### Update Station Fuel

```
PATCH /manager/update-station-fuel
Headers: Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "stationFuelId": "uuid",
  "quantity": 4500,
  "isAvailable": true
}
```

**Response:** `200 OK`

```json
{
  "message": "Station fuel updated",
  "stationFuel": {
    "id": "uuid",
    "quantity": 4500,
    "isAvailable": true,
    "updatedAt": "2026-05-13T10:00:00Z"
  }
}
```

**Permissions:** Admin, SubAdmin (for assigned stations)

---

### Get Station Status

```
GET /manager/station-status
Headers: Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "stationId": "uuid",
  "stationName": "Station Alpha",
  "totalFuelTypes": 3,
  "availableFuel": [
    {
      "fuelTypeId": 1,
      "fuelType": "Premium Petrol",
      "quantity": 4500,
      "isAvailable": true
    },
    {
      "fuelTypeId": 2,
      "fuelType": "Regular Petrol",
      "quantity": 3200,
      "isAvailable": true
    }
  ],
  "activeBookings": 12,
  "totalQueueToday": 28
}
```

**Permissions:** Admin, SubAdmin

---

### Get Fuel Types

```
GET /manager/fuel-types
Headers: Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "fuelTypes": [
    {
      "id": 1,
      "name": "Premium Petrol"
    },
    {
      "id": 2,
      "name": "Regular Petrol"
    },
    {
      "id": 3,
      "name": "Diesel"
    }
  ],
  "total": 3
}
```

**Permissions:** Admin, SubAdmin

---

## ⚠️ Error Handling

All error responses follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional information"
}
```

### Common HTTP Status Codes

| Status | Meaning                              |
| ------ | ------------------------------------ |
| 200    | OK - Request successful              |
| 201    | Created - Resource created           |
| 400    | Bad Request - Invalid input          |
| 401    | Unauthorized - No valid token        |
| 403    | Forbidden - Insufficient permissions |
| 404    | Not Found - Resource not found       |
| 409    | Conflict - Resource already exists   |
| 500    | Internal Server Error                |

---

## 🔒 Security Considerations

- **Passwords**: Hashed with bcrypt before storage
- **Tokens**: JWT-based with configurable expiry
- **CORS**: Configured to allow frontend requests
- **Authorization**: Role-based access control on protected routes
- **Database**: Connection secured via environment variables

---

## 📊 Booking Status Flow

```
PENDING → CALLED → COMPLETED
   ↓        ↓
CANCELLED  REJECTED
   ↓        ↓
EXPIRED (automatic)
```

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables for Production

```
DATABASE_URL=postgresql://user:password@host:5432/fuel_db
PORT=3000
JWT_SECRET=your_production_secret
NODE_ENV=production
```

### Start Production Server

```bash
npm start
```

---

## 🛠️ Database Migrations

### Create a New Migration

```bash
npx drizzle-kit generate:pg
```

### Apply Migrations

```bash
npx drizzle-kit push:pg
```

---

## 📝 Environment Variables

| Variable       | Description                  | Example                                    |
| -------------- | ---------------------------- | ------------------------------------------ |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost/fuel_db` |
| `PORT`         | Server port                  | `3000`                                     |
| `JWT_SECRET`   | Secret key for JWT signing   | `your_secret_key`                          |
| `NODE_ENV`     | Environment                  | `development` or `production`              |

---

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

### Code Standards

- Use TypeScript for all new code
- Follow naming conventions consistently
- Add error handling for all endpoints
- Test changes before committing

---

## 📝 License

This project is licensed under the ISC License.

---

## 📞 Support

For issues, email support@fuelmanagementsystem.com or open an issue in the repository.

---

**Last Updated:** May 13, 2026  
**API Version:** 1.0.0
