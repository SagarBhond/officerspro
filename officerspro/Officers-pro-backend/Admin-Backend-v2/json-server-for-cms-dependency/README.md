# Officers Pro JSON Server

This JSON server provides dummy data for the Officers Pro Admin Backend when CMS microservices are not ready.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on http://localhost:3000

## Available Endpoints

- `GET /api/admin/cases/total` - Returns total case count
- `GET /api/admin/cases/active` - Returns active case count  
- `GET /api/admin/cases/completed` - Returns completed case count
- `GET /api/admin/cases/statements` - Returns total statements count
- `GET /api/victim/total-officers` - Returns total officers count
- `GET /api/subscriptions/public/status/getAllSubscription/{email}` - Returns subscription data
- `GET /api/payment-history/admin/all` - Returns payment history

## Data Structure

The dummy data includes:
- Case statistics (total, active, completed, statements)
- Officer count
- Subscription data for different emails
- Payment history records

You can modify the `db.json` file to change the dummy data values.
