# Finance Data Processing and Access Control Backend

Backend assignment implementation using **Node.js + Express + PostgreSQL**.

## Tech Stack

- Node.js (Express)
- PostgreSQL (`pg`)
- Zod (input validation)
- JWT (authentication)
- Role-based access control (action-based permissions)

## Features Delivered

- User management (`viewer`, `analyst`, `admin`)
- User status management (`active`, `inactive`)
- Role-based access control at middleware level
- Financial records CRUD with filtering and pagination
- Dashboard analytics APIs:
  - Total income
  - Total expense
  - Net balance
  - Category-wise totals
  - Monthly/weekly trends
  - Recent activity
- Validation and structured error responses
- PostgreSQL persistence with SQL schema
- Default admin bootstrap script

## Project Structure

```text
finance-dashboard/
  db/
    schema.sql
  scripts/
    setupDb.js
  src/
    config/
    constants/
    middleware/
    routes/
    services/
    utils/
    validation/
    app.js
    server.js
  tests/
    permissions.test.js
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Start PostgreSQL (Option A: Docker):

```bash
docker compose up -d
```

4. Create tables and seed default admin:

```bash
npm run db:setup
```

5. Start API:

```bash
npm run dev
```

Base URL: `http://localhost:4000`

## Default Admin Credentials

- Email: `admin@finance.local`
- Password: `admin12345`

You can override these via `.env`.

## Authentication

- `POST /api/auth/login` returns a JWT access token.
- Pass token in header:

```text
Authorization: Bearer <token>
```

## Role Access Matrix

- `viewer`: dashboard read only
- `analyst`: dashboard + financial records read
- `admin`: full access (users + records + dashboard)

## API Endpoints

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`

### Users (admin only)

- `POST /api/users`
- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`

### Financial Records

- `GET /api/records` (analyst, admin)
- `GET /api/records/:id` (analyst, admin)
- `POST /api/records` (admin)
- `PATCH /api/records/:id` (admin)
- `DELETE /api/records/:id` (admin)

Supported list filters:

- `startDate` (`YYYY-MM-DD`)
- `endDate` (`YYYY-MM-DD`)
- `category`
- `search` (matches `category` and `notes`)
- `type` (`income` | `expense`)
- `limit`
- `offset`

### Dashboard

- `GET /api/dashboard/summary`
- `GET /api/dashboard/category-totals`
- `GET /api/dashboard/trends?period=monthly|weekly`
- `GET /api/dashboard/recent-activity?limit=10`

All dashboard endpoints are available to `viewer`, `analyst`, and `admin`.

## Example Payloads

### Login

`POST /api/auth/login`

```json
{
  "email": "admin@finance.local",
  "password": "admin12345"
}
```

### Create User (admin)

`POST /api/users`

```json
{
  "fullName": "Alex Johnson",
  "email": "alex@example.com",
  "password": "pass12345",
  "role": "analyst",
  "status": "active"
}
```

### Create Financial Record (admin)

`POST /api/records`

```json
{
  "amount": 1200.5,
  "type": "income",
  "category": "Salary",
  "date": "2026-04-02",
  "notes": "Monthly salary credit"
}
```

## Validation and Errors

- Invalid input returns `400` with validation details.
- Unauthorized requests return `401`.
- Forbidden role actions return `403`.
- Missing resources return `404`.
- Duplicate users return `409`.
- Rate-limited requests return `429`.

## Assumptions and Tradeoffs

- Single JWT access token flow is used (no refresh token flow).
- Records are soft deleted (`deleted_at`) so deleted records are hidden from list/read/summary queries.
- SQL migration tooling was kept lightweight (`schema.sql` + setup script) to keep focus on assignment logic.

## Optional Enhancements Implemented

- Token-based authentication (JWT)
- Pagination for records list
- Search support (`search` query)
- Soft delete functionality for records
- API rate limiting (200 requests / 15 minutes per IP on `/api`)
- Unit tests (RBAC permission test)
- API documentation (README + Postman collection/environment)

## Postman Collection

Import this file in Postman:

- `postman/Finance-Dashboard.postman_collection.json`
- `postman/Finance-Dashboard.local.postman_environment.json`

Suggested run order:

1. `Auth > Login Admin`
2. `Users (Admin) > Create Analyst User`
3. `Auth > Login Analyst`
4. Remaining requests in any order
