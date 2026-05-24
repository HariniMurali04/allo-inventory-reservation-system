# Allo Inventory Reservation System

A concurrency-safe inventory reservation platform built for multi-warehouse retail and D2C brands.

---

## Live Demo

https://allo-inventory-reservation-system-zeta.vercel.app/

---

## GitHub Repository

https://github.com/HariniMurali04/allo-inventory-reservation-system

---

## Features

- Multi-warehouse inventory management
- Real-time stock availability tracking
- Temporary inventory reservations during checkout
- Reservation confirmation & cancellation
- Automatic reservation expiry handling
- Live countdown timer for reservations
- Concurrency-safe reservation logic
- Responsive modern UI

---

## Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Axios

### Backend
- Next.js API Routes
- Prisma ORM
- Supabase PostgreSQL

### Deployment
- Vercel
- Supabase

---

# Database Design

## Product
Stores product details.

## Warehouse
Represents warehouse locations.

## Inventory
Tracks:
- totalQuantity
- reservedQuantity
- product per warehouse

## Reservation
Stores:
- reservation status
- quantity
- expiry time
- linked inventory

Reservation statuses:
- PENDING
- CONFIRMED
- RELEASED

---

# API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List products with stock |
| GET | `/api/warehouses` | List warehouses |
| POST | `/api/reservations` | Create reservation |
| POST | `/api/reservations/:id/confirm` | Confirm reservation |
| POST | `/api/reservations/:id/release` | Release reservation |
| GET | `/api/reservations/:id` | Fetch reservation details |

---

# Concurrency Handling

The reservation system is designed to prevent overselling under concurrent requests.

Reservations are created using Prisma database transactions.

Inside the transaction:

1. Inventory row is fetched
2. Available stock is calculated
3. Stock availability is validated
4. reservedQuantity is incremented
5. Reservation record is created

This ensures only one request can reserve the last available unit.

```md
If stock is unavailable, the API returns:

```http
409 Conflict


