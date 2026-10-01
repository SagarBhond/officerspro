# Officers Pro Admin JSON Server

This JSON server provides mock data for all admin-backend APIs so other developers can work without running the actual Spring Boot backend.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on http://localhost:3001

## Available Endpoints

### Dashboard
- `GET /api/admin/dashboard-summary` - Dashboard statistics
- `GET /api/admin/total-users` - Total user count
- `GET /api/admin/total-managers` - Total manager count

### Plans
- `GET /api/admin/plans` - All plans
- `GET /api/admin/plans/count/active` - Active plans count
- `GET /api/admin/plans/count/inactive` - Inactive plans count
- `GET /api/admin/plans/revenue/total` - Total revenue
- `GET /api/admin/plans/revenue/expected` - Expected revenue

### Users
- `GET /api/admin/fetchAllUser` - All users
- `GET /api/admin/users/managers` - All managers
- `GET /api/admin/users/only-users` - All regular users
- `GET /api/admin/users/roles?email=user@example.com` - User roles

### Entitlements
- `GET /api/admin/entitlements/by-user` - User entitlements
- `GET /api/admin/entitlements/by-user/{userId}` - User entitlements by ID

### Authentication
- `POST /api/admin/login` - Login (use any email + password: "password123")
- `POST /api/admin/register` - Register new user

### Public
- `GET /api/public/plans` - Public plans (active only)

## Sample Data

The server includes realistic sample data:
- 4 subscription plans (Basic, Premium, Enterprise, Starter)
- 5 users (Admin, Managers, Users)
- 5 entitlements (User Management, Plan Management, etc.)
- Dashboard statistics
- User-role mappings

## Usage

Replace your frontend API calls from:
```javascript
// From: http://localhost:8081/api/admin/plans
// To:   http://localhost:3001/api/admin/plans
```

## Health Check

- `GET /health` - Server health status
