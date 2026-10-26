# CampusBite — Canteen Pre-Order System

> **Academic College Micro-Project (Modules 1 to 3)**  
> **Subjects Covered:** Full Stack Development, Backend Development, Advanced Database  
> **Tech Stack:** React (Vite) + Node.js/Express + PostgreSQL + Prisma ORM  

---

## 1. Problem Statement

College canteens face severe congestion during 15-to-30-minute lunch breaks. Students waste precious break time standing in queues, while canteen staff struggle with order chaos and preparation bottlenecks.

**CampusBite** solves this problem by allowing students to browse the daily menu, pre-order their food in advance, select a pickup time window, and track real-time kitchen status using an assigned Order Token. Canteen staff receive incoming orders in real-time, transition orders through kitchen states (`PLACED` → `PREPARING` → `READY` → `COLLECTED`), and manage menu availability to prevent overcrowding.

Payment is settled at the counter upon food collection, avoiding payment gateway complexities while keeping the ordering workflow seamless.

---

## 2. Technology Stack & Architecture

| Layer | Technology | Key Modules / Libraries | Purpose |
|---|---|---|---|
| **Frontend** | React 19 (Vite) | `react-router-dom`, `axios`, `@tanstack/react-query`, `react-hook-form`, `lucide-react` | Component-based UI, client routing, server state caching, form validation, responsive layout |
| **Styling** | Modern Vanilla CSS | Custom CSS Design System | Clean white & emerald green design (`#059669`), responsive layout, status badges, drawer & modals |
| **Backend** | Node.js + Express.js | Express Router, JSON middleware, CORS, Centralized Error Handler | REST API architecture, layered controller-service-repository pattern, request validation |
| **Database** | PostgreSQL 18 | Prisma ORM | Relational schema, ACID transactions, referential integrity constraints, decimal precision for currency |

---

## 3. Database Design & Entity Relationship (ER) Diagram

### Entity Details

1. **`menu_items`**:
   - `id`: `SERIAL` Primary Key
   - `name`: `VARCHAR(100)` (Item name)
   - `description`: `TEXT` (Optional preparation details)
   - `price`: `DECIMAL(10, 2)` (Fixed-precision currency in INR)
   - `isAvailable`: `BOOLEAN DEFAULT true` (Stock toggle)
   - `createdAt`, `updatedAt`: `TIMESTAMP(3)`

2. **`orders`**:
   - `id`: `SERIAL` Primary Key (Student Order Token)
   - `studentName`: `VARCHAR(100)` (Student full name)
   - `studentId`: `VARCHAR(50)` (Roll number / College ID)
   - `pickupTime`: `VARCHAR(50)` (Requested pickup window)
   - `status`: `ENUM('PLACED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED')`
   - `totalAmount`: `DECIMAL(10, 2)` (Calculated on server from DB prices)
   - `createdAt`, `updatedAt`: `TIMESTAMP(3)`

3. **`order_items`**:
   - `id`: `SERIAL` Primary Key
   - `orderId`: `INTEGER` Foreign Key references `orders(id)` (`ON DELETE CASCADE`)
   - `menuItemId`: `INTEGER` Foreign Key references `menu_items(id)` (`ON DELETE RESTRICT`)
   - `quantity`: `INTEGER` (Quantity ordered ≥ 1)
   - `unitPrice`: `DECIMAL(10, 2)` (Historical snapshot price at the time order was placed)

### Referential Integrity & Historical Price Snapshot Strategy

- **Historical Price Snapshot**: The `order_items` table explicitly saves `unitPrice` when an order is created. If staff update menu prices later, historical sales figures and student receipts remain completely unaffected.
- **Safe Deletion Strategy (`ON DELETE RESTRICT`)**: When deleting a menu item, the backend checks if it is referenced in `order_items`. If past orders contain the item, the API rejects deletion with HTTP 400, instructing staff to mark it as **Unavailable** (`isAvailable = false`) instead. This prevents database corruption and preserves audit trails.

### Mermaid ER Diagram

```mermaid
erDiagram
    MENU_ITEMS ||--o{ ORDER_ITEMS : "contains in"
    ORDERS ||--|{ ORDER_ITEMS : "has line items"

    MENU_ITEMS {
        int id PK
        string name
        string description
        decimal price
        boolean isAvailable
        datetime createdAt
        datetime updatedAt
    }

    ORDERS {
        int id PK
        string studentName
        string studentId
        string pickupTime
        enum status
        decimal totalAmount
        datetime createdAt
        datetime updatedAt
    }

    ORDER_ITEMS {
        int id PK
        int orderId FK
        int menuItemId FK
        int quantity
        decimal unitPrice
    }
```

---

## 4. REST API Endpoint Documentation

Base URL: `http://localhost:5000/api`

### Menu Endpoints

| Method | Endpoint | Query / Body Params | Description | Success Code |
|---|---|---|---|---|
| `GET` | `/menu` | `?available=true` (optional) | Fetch all menu items or only available items | `200 OK` |
| `GET` | `/menu/:id` | Route param `:id` | Fetch a single menu item by ID | `200 OK` |
| `POST` | `/menu` | `{ name, description, price, isAvailable }` | Add new food item (validated) | `201 Created` |
| `PUT` | `/menu/:id` | `{ name, description, price, isAvailable }` | Update menu item details/price | `200 OK` |
| `DELETE` | `/menu/:id` | Route param `:id` | Delete item (protected by foreign key constraint) | `200 OK` |

### Order Endpoints

| Method | Endpoint | Query / Body Params | Description | Success Code |
|---|---|---|---|---|
| `GET` | `/orders` | `?status=PLACED` (optional) | Fetch orders (filter by status or ALL) | `200 OK` |
| `GET` | `/orders/stats` | None | Get aggregate counts (Total, Pending, Ready, etc.) | `200 OK` |
| `GET` | `/orders/:id` | Route param `:id` | Fetch specific order with item breakdown | `200 OK` |
| `POST` | `/orders` | `{ studentName, studentId, pickupTime, items: [{ menuItemId, quantity }] }` | Place order within atomic ACID transaction | `201 Created` |
| `PATCH` | `/orders/:id/status` | `{ status: "PREPARING" }` | Advance order status via state transition rules | `200 OK` |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Verifies server uptime and service status |

---

## 5. Subject Concept Mapping (Modules 1 to 3)

### Full Stack Development
- **Component-Based Architecture**: Modular React components (`Navbar`, `CartDrawer`, `CheckoutModal`, `OrderConfirmationModal`, `StatusBadge`).
- **Client Routing**: `react-router-dom` configuring navigation between `/` (Menu), `/track` (Tracker), `/staff` (Staff Dashboard), and `/staff/menu` (Menu Catalog).
- **Form Handling & Validation**: `react-hook-form` validating student pre-orders (non-empty fields, name length, roll number format).
- **API Service Layer & Axios**: Centralized HTTP client (`services/api.js`) with request/response interceptors and unified error formatting.
- **Server State Management**: `@tanstack/react-query` managing caching, background refetching, and mutation invalidation for real-time reactivity.
- **Interactive UI**: Responsive cart management with live quantity updates, price preview, and dynamic order progress stepper.

### Backend Development
- **Layered Architecture**: Strict separation of concerns:
  - `routes/`: Endpoint mapping and middleware attachment.
  - `controllers/`: HTTP parsing, status codes, and response sending.
  - `services/`: Core business logic, ACID transactions, and price calculation.
  - `repositories/`: Direct database queries via Prisma ORM.
- **Server-Side Validation**: Request validators (`middleware/validateRequest.js`) preventing invalid quantities (≤ 0), empty orders, and missing fields.
- **Business Rule Enforcement**: Order totals are strictly calculated on the server using fresh PostgreSQL prices—never trusting the client payload.
- **State Machine Workflow**: Valid status transitions enforced (`PLACED` → `PREPARING` → `READY` → `COLLECTED` or `CANCELLED`). Terminal states cannot transition backwards.
- **Centralized Error Handling**: Express middleware (`middleware/errorHandler.js`) catching operational `ApiError`, Prisma errors (P2002, P2003, P2025), and returning consistent JSON contracts.

### Advanced Database
- **Relational Schema Design**: 3NF normalized tables with explicit primary keys (`SERIAL`), foreign keys, and indexes on join columns.
- **Prisma Schema & Migrations**: Declarative schema (`prisma/schema.prisma`) and versioned SQL migration files (`prisma/migrations/`).
- **Fixed-Precision Decimals**: `DECIMAL(10, 2)` used for currency to prevent floating-point calculation errors.
- **Referential Integrity Constraints**: `ON DELETE CASCADE` for order items when an order is deleted, and `ON DELETE RESTRICT` to protect menu items from deletion if referenced in past orders.
- **ACID Database Transactions**: `prisma.$transaction()` wraps order validation, price lookups, order header creation, and order item creation into an atomic unit. If any step fails, the entire transaction rolls back cleanly.
- **Relational Queries**: Prisma `include` clauses performing efficient joins across `orders`, `order_items`, and `menu_items`.

---

## 6. Project Directory Structure

```
Integrated_Microproject/
├── package.json               # Root scripts for starting client and server
├── README.md                  # Project report, viva guide, and setup instructions
├── client/                    # Frontend React + Vite Application
│   ├── index.html             # HTML5 template with Inter font and meta tags
│   ├── vite.config.js         # Port 3000 config with /api reverse proxy to 5000
│   ├── package.json
│   └── src/
│       ├── main.jsx           # React DOM mounting
│       ├── App.jsx            # Routing, React Query provider, Cart provider
│       ├── index.css          # Design system (Emerald green accents, cards, tables)
│       ├── context/
│       │   └── CartContext.jsx      # Global cart state (items, quantity, totals)
│       ├── components/
│       │   ├── Navbar.jsx           # Sticky nav header with cart count badge
│       │   ├── CartDrawer.jsx       # Side cart panel with item quantity controls
│       │   ├── CheckoutModal.jsx    # React Hook Form student pre-order modal
│       │   ├── OrderConfirmationModal.jsx # Order ID token & counter payment info
│       │   └── StatusBadge.jsx      # Color-coded workflow status pills
│       ├── pages/
│       │   ├── MenuPage.jsx         # Menu browsing, search, and ordering
│       │   ├── TrackOrderPage.jsx   # Live order token lookup with progress stepper
│       │   ├── StaffDashboardPage.jsx # Real-time kitchen board & status updates
│       │   └── MenuManagementPage.jsx # Staff CRUD & availability toggle
│       └── services/
│           ├── api.js               # Reusable Axios instance with interceptors
│           ├── menuService.js       # Menu API client
│           └── orderService.js      # Order API client
└── server/                    # Backend Node.js + Express + Prisma REST API
    ├── .env                   # Database connection string and server port
    ├── .env.example
    ├── package.json
    ├── test-api.js            # Automated integration test suite (14 test cases)
    ├── prisma/
    │   ├── schema.prisma      # PostgreSQL models, enums, and relations
    │   ├── seed.js            # Seed script with authentic canteen food items
    │   └── migrations/        # SQL migration files generated by Prisma
    └── src/
        ├── app.js             # Express app setup, CORS, JSON parser, routes
        ├── server.js          # Server entry point & graceful shutdown
        ├── utils/
        │   ├── prisma.js      # PrismaClient singleton instance
        │   ├── responseFormatter.js # Unified JSON success & error contracts
        │   └── statusTransitions.js # Kitchen workflow state machine validator
        ├── middleware/
        │   ├── validateRequest.js   # Server-side input validation middleware
        │   └── errorHandler.js      # Centralized error handler (Prisma + HTTP)
        ├── repositories/
        │   ├── menuRepository.js    # Data access layer for menu_items
        │   └── orderRepository.js   # Data access layer for orders & stats
        ├── services/
        │   ├── menuService.js       # Menu business logic & referential safety
        │   └── orderService.js      # ACID transaction & server-side total computation
        ├── controllers/
        │   ├── menuController.js    # HTTP controllers for menu
        │   └── orderController.js   # HTTP controllers for orders & stats
        └── routes/
            ├── menuRoutes.js        # Express router for /api/menu
            └── orderRoutes.js       # Express router for /api/orders
```

---

## 7. Setup & Execution Instructions

### Prerequisites
- **Node.js** (v18 or higher installed)
- **PostgreSQL** (v14 or higher installed and running locally on port 5432)

### Step 1: Clone or Navigate to Directory
```bash
cd "c:\Users\ASUS\Desktop\Integrated_Microproject"
```

### Step 2: Configure Database (.env)
The backend expects PostgreSQL running on `localhost:5432`. Create or check `server/.env`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campusbite_db?schema=public"
NODE_ENV=development
```
*(If your PostgreSQL password is not `postgres`, change it accordingly in `server/.env`).*

### Step 3: Run Database Migration & Seed
```bash
cd server
npm run prisma:migrate
npm run prisma:seed
cd ..
```

### Step 4: Run the Backend & Frontend Servers
Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
# Client starts at http://localhost:3000
```

Open your browser and visit: **`http://localhost:3000`**

---

## 8. Verification & Testing Report

All 14 test cases were executed automatically against the live PostgreSQL database and Express REST API via `server/test-api.js`:

| # | Test Scenario | Expected Outcome | Actual Outcome | Status |
|---|---|---|---|---|
| **1** | Menu items load successfully | HTTP 200 with JSON array of food items | HTTP 200, 8 items returned from PostgreSQL | **PASS** |
| **2** | Student places valid order | HTTP 201 with created Order record & Token ID | HTTP 201, Order #1 created in status `PLACED` | **PASS** |
| **3** | Server calculates total price | Total calculated on server from DB unit prices | Exactly ₹135.00 calculated for (2×₹60 + 1×₹15) | **PASS** |
| **4** | Negative/zero quantity rejected | HTTP 400 Bad Request with validation message | HTTP 400: Quantity must be a positive integer | **PASS** |
| **5** | Sold out item cannot be ordered | HTTP 400 rejecting unavailable food item | HTTP 400: "Cold Coffee is currently sold out" | **PASS** |
| **6** | Empty order rejected | HTTP 400 rejecting empty items array | HTTP 400: Order must contain at least 1 item | **PASS** |
| **7** | Non-existent order returns 404 | HTTP 404 Not Found for order ID #99999 | HTTP 404: Order with ID #99999 not found | **PASS** |
| **8** | Staff updates order status | HTTP 200 with status updated to `PREPARING` | HTTP 200: Order #1 updated to `PREPARING` | **PASS** |
| **9** | Invalid transition rejected | HTTP 400 rejecting backward transition (`PREP` → `PLACED`) | HTTP 400: Invalid transition from PREPARING to PLACED | **PASS** |
| **10** | Menu item CRUD works | POST 201, PUT 200, DELETE 200 on new item | Created (201), Price updated (200), Deleted (200) | **PASS** |
| **11** | Historical unit price snapshot | OrderItem retains ₹60.00 price regardless of future changes | `order_items.unitPrice` stored as ₹60.00 | **PASS** |
| **12** | Atomic rollback on error | Transaction rolls back if one item fails; no partial records | HTTP 400; order count before & after remained 1 | **PASS** |
| **13** | Database persistence | Order persistently stored in PostgreSQL tables | Order #1 fetched directly from PostgreSQL database | **PASS** |
| **14** | Referential integrity protection | Deleting menu item linked to historical orders is blocked | HTTP 400: Cannot delete item linked to past orders | **PASS** |

To re-run the automated integration test suite anytime:
```bash
cd server
node test-api.js
```

---

## 9. 5-Minute Demonstration Script for College Viva

Follow this flow when presenting your project to the evaluator:

1. **Minute 1: Introduction & Problem Statement (30 seconds)**
   - *"Good morning/afternoon, professors. Today I am demonstrating CampusBite, a canteen pre-order system designed to eliminate break-time canteen queues."*
   - *"The system has two main user personas: Students who pre-order food to save time, and Canteen Staff who manage preparation orders."*

2. **Minute 2: Student Interface & Menu Browsing (1 minute)**
   - Open `http://localhost:3000`.
   - Point out the clean UI, item prices in INR, and the availability status badges (e.g. Cold Coffee shown as Sold Out).
   - Show the search filter: type *"sandwich"* to show dynamic filtering.
   - Click **"Add to Order"** on *Veg Sandwich* and *Veg Fried Rice*.
   - Open the **Cart Drawer**: show quantity increment/decrement controls and live subtotal preview.

3. **Minute 3: Pre-Order Checkout & Atomic Transaction (1 minute)**
   - Click **"Proceed to Pre-Order"**.
   - Explain: *"Here we use React Hook Form for client validation. I'll enter my name 'Aarav Sharma', student ID 'CS2026-042', and pick the 'In 20-30 Minutes' slot."*
   - Click **"Confirm Pre-Order"**.
   - Highlight the confirmation dialog: *"Notice how our backend immediately executed an ACID database transaction. It verified item availability, re-calculated the total from database prices—never trusting the client total—and created the order with token #X."*

4. **Minute 4: Live Order Tracking (1 minute)**
   - Click **"Track Live Status"**.
   - Show the 4-step visual stepper: `1. Placed` → `2. Preparing` → `3. Ready` → `4. Collected`.
   - Point out that students don't need to crowd the counter until the stepper shows `Ready for Pickup`.

5. **Minute 5: Staff Dashboard & Menu Management (1.5 minutes)**
   - Click **"Staff Portal (Demo)"**.
   - Show the summary KPI cards (Total Orders, Pending, Ready, Collected).
   - Find the newly placed order in the table:
     - Click **"Start Prep"**: status changes to `PREPARING` with amber badge.
     - Click **"Mark Ready"**: status changes to `READY` with green badge.
     - Explain: *"Our backend enforces a strict state machine. A collected order can never be reverted back to preparing."*
   - Click **"Manage Food Menu"**:
     - Toggle an item's availability switch (e.g., mark Masala Dosa Sold Out) and show it instantly reflect on the student menu.
     - Try to delete an item that was ordered: show the safety alert explaining foreign key referential integrity protection (`ON DELETE RESTRICT`).

---

## 10. Common Viva Questions & Answers

### Q1: Why did you use Prisma instead of raw SQL queries?
**Answer:** Prisma provides type safety, autocompletion, connection pooling, and automated schema migrations while preventing SQL injection vulnerabilities through parameterized queries. It also simplifies relational queries through `include` statements instead of manually writing verbose multi-table JOINs.

### Q2: What is an ACID transaction and where did you use it?
**Answer:** An ACID transaction guarantees Atomicity, Consistency, Isolation, and Durability. We use `prisma.$transaction()` during order placement (`orderService.placeOrder`). When a student orders multiple items, if any single item is invalid or out of stock, the transaction aborts and rolls back completely, ensuring no half-created orders exist in the database.

### Q3: Why is the order total calculated on the backend instead of the frontend?
**Answer:** A frontend client is considered untrusted. A malicious user could tamper with the HTTP request payload and submit an order with a manipulated total of ₹1. By fetching the authoritative unit price directly from PostgreSQL and calculating the total on the server, we enforce strict financial integrity.

### Q4: Why do you store `unitPrice` in `order_items` when `menu_items` already has a `price` column?
**Answer:** This represents a historical price snapshot. If the canteen raises the price of Masala Dosa from ₹60 to ₹70 next month, past student order records must retain the original ₹60 price for accurate accounting and auditing.

### Q5: What deletion strategy did you choose for menu items?
**Answer:** We implemented `ON DELETE RESTRICT` at both the database and service levels. If staff try to delete a menu item that exists in historical orders, the backend blocks the deletion with an HTTP 400 error and suggests toggling the item to "Unavailable" instead. This preserves foreign key integrity and past sales history.

### Q6: What is TanStack Query and why not just use `useEffect` + `axios`?
**Answer:** TanStack Query handles server state management, caching, automatic garbage collection, loading/error states, and query invalidation. When staff update an order's status, `queryClient.invalidateQueries(['orders'])` instantly triggers a fresh background fetch without requiring manual component re-renders.

### Q7: Explain the role of your layered backend architecture.
**Answer:** We follow the standard Controller-Service-Repository pattern:
- **Controllers** handle HTTP request parsing, status codes, and formatting.
- **Services** contain core business logic, validation rules, state machines, and ACID transactions.
- **Repositories** interface directly with Prisma ORM to execute database queries.
This separation allows easy testing, clean maintenance, and modular academic explanation.
