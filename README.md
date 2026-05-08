# Finance Dashboard Assignment (Backend + Frontend)

Internship assignment project implementing secure REST APIs with JWT + RBAC and a React frontend.

## Current Status

### Assignment Coverage

- [x] User registration & login APIs
- [x] Password hashing (`bcryptjs`)
- [x] JWT authentication
- [x] Role-based access (`viewer`, `admin`)
- [x] CRUD APIs for secondary entity (`financial_records`)
- [x] API versioning (`/api/v1`)
- [x] Validation + structured error handling
- [x] API documentation (OpenAPI + Postman)
- [x] PostgreSQL integration
- [x] Scalable modular backend architecture
- [x] Basic React frontend (auth, dashboard, records, user management)
- [x] Dockerized Postgres setup

## RBAC Model

- `viewer`
  - Can access dashboard analytics
  - Can list/read financial records
  - Cannot create/update/delete records
  - Cannot manage users

- `admin`
  - Full dashboard access
  - Full records CRUD
  - Full user management:
    - create viewer/admin user
    - edit user
    - deactivate user
    - permanently delete user (blocked if linked financial records exist)

## Backend Structure

```text
server/
  app.js
  server.js
  config/
  constants/
  middleware/
  routes/
  services/
  utils/
  validation/
  db/
  scripts/
  tests/
  docs/
  postman/
```

## Frontend Structure

```text
client/src/
  api/
  components/
  context/
  hooks/
  layouts/
  pages/
  routes/
  services/
  utils/
```

## API Base URL

- `http://localhost:4000/api/v1`

## Important URLs

- Health: `GET /health`
- Swagger UI: `GET /api-docs`

## Core Endpoints

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Users (Admin)

- `GET /api/v1/users`
- `POST /api/v1/users`
- `GET /api/v1/users/:id`
- `PATCH /api/v1/users/:id`
- `DELETE /api/v1/users/:id` (deactivate)
- `DELETE /api/v1/users/:id/permanent` (hard delete)

### Records

- `GET /api/v1/records` (viewer/admin)
- `GET /api/v1/records/:id` (viewer/admin)
- `POST /api/v1/records` (admin)
- `PATCH /api/v1/records/:id` (admin)
- `DELETE /api/v1/records/:id` (admin, soft delete)

### Dashboard

- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/category-totals`
- `GET /api/v1/dashboard/trends?period=monthly|weekly`
- `GET /api/v1/dashboard/recent-activity?limit=10`

## Setup

### 1) Database (Docker)

```bash
docker compose up -d
```

### 2) Backend

```bash
cd server
npm install
npm run db:setup
npm run dev
```

### 3) Frontend

```bash
cd client
npm install
npm run dev
```

## Environment Variables

### `server/.env`

```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finance_dashboard
JWT_SECRET=replace_with_a_secure_random_string
JWT_EXPIRES_IN=1d
DEFAULT_ADMIN_NAME=System Admin
DEFAULT_ADMIN_EMAIL=admin@finance.local
DEFAULT_ADMIN_PASSWORD=admin12345
```

### `client/.env`

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

## API Documentation Files

- OpenAPI: `server/docs/openapi.yaml`
- Postman: `server/postman/Finance-Dashboard.postman_collection.json`

## Sample Test Records (Create as Admin)

Use `POST /api/v1/records` with these payloads:

```json
{
  "amount": 84500,
  "type": "income",
  "category": "Salary",
  "date": "2026-05-01",
  "notes": "Monthly salary credit"
}
```

```json
{
  "amount": 12000,
  "type": "expense",
  "category": "Rent",
  "date": "2026-05-02",
  "notes": "Apartment rent"
}
```

```json
{
  "amount": 3500,
  "type": "expense",
  "category": "Groceries",
  "date": "2026-05-03",
  "notes": "Weekly groceries"
}
```

```json
{
  "amount": 6000,
  "type": "income",
  "category": "Freelance",
  "date": "2026-05-05",
  "notes": "Side project payment"
}
```

```json
{
  "amount": 1800,
  "type": "expense",
  "category": "Transport",
  "date": "2026-05-06",
  "notes": "Fuel and commute"
}
```

## Why This Architecture Is Scalable

- Stateless JWT-based auth enables horizontal scaling.
- Modular route/service/middleware layers support feature growth.
- Pagination and filtering keep list queries efficient.
- Indexed record fields improve analytics/query speed.
- Dashboard endpoints are cache-friendly (Redis-ready).
- App can be deployed as multiple backend instances behind a load balancer.
