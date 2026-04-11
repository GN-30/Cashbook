# 📒 FlexiLedger — Smart Cashbook Application

A full-stack web application for managing personal or business finances through **dynamic, schema-driven ledgers**. Create custom income and expense templates, track transactions, visualise trends, and export reports as CSV or colourful PDF files.

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register / login with hashed passwords
- 📂 **Multiple Ledgers** — Create and manage separate ledgers for different purposes
- 🧩 **Dynamic Schema Builder** — Define custom form templates (fields: text, number, dropdown, date, yes/no) for income or expense categories
- 📝 **Flexible Entry System** — Add entries using any schema; the correct form is auto-generated
- 📊 **Live Dashboard Stats** — Real-time Total Balance, Total Income, Total Expense cards + bar chart
- 📤 **CSV Export** — Separate income & expense CSV files with schema field columns
- 🎨 **Colourful PDF Export** — Separate income (green-themed) & expense (red-themed) PDF reports with:
  - Summary cards (Total Amount, Entry Count)
  - Schema field names as column headers
  - Amount column auto-detected, bold & accent-coloured
  - Alternating row shading
  - Header & footer on every page
- 🎉 **Confetti Animation** — Celebratory effect on income entry
- 📱 **PWA Support** — Installable as a Progressive Web App
- ₹ **Indian Rupee (₹)** currency display throughout

---

## 🗂️ Project Structure

```
Cashbook/
├── backend/               # Node.js + Express REST API
│   ├── routes/
│   │   ├── auth.js        # Register, Login, JWT middleware
│   │   └── ledgers.js     # Ledgers, Schemas, Entries CRUD
│   ├── db.js              # PostgreSQL connection pool
│   ├── init-db.js         # Database table initialisation script
│   ├── server.js          # Express app entry point
│   ├── .env               # Environment variables (not committed)
│   └── package.json
│
├── frontend/              # React + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── PWAInstallPrompt.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx      # Ledger list
│   │   │   ├── LedgerView.jsx     # Entries, stats, CSV/PDF export
│   │   │   ├── SchemaBuilder.jsx  # Custom form template builder
│   │   │   └── AddEntry.jsx       # Dynamic entry form
│   │   ├── api.js                 # Axios instance with JWT header
│   │   ├── App.jsx                # Router & route definitions
│   │   └── main.jsx
│   └── package.json
│
├── vercel.json            # Vercel deployment config (frontend)
└── README.md
```

---

## 🛠️ Tech Stack

| Layer       | Technology |
|-------------|------------|
| Frontend    | React 18, Vite, Tailwind CSS v4 |
| Routing     | React Router v6 |
| Charts      | Recharts |
| PDF Export  | jsPDF + jspdf-autotable |
| Animations  | Framer Motion, react-confetti |
| HTTP Client | Axios |
| Backend     | Node.js, Express 5 |
| Database    | PostgreSQL (via `pg`) |
| Auth        | JWT + bcrypt |
| Deployment  | Vercel (frontend), any Node host (backend) |

---

## ⚙️ Database Schema

```sql
users       (id, name, email, password, created_at)
ledgers     (id, user_id → users, name, description, created_at)
schemas     (id, ledger_id → ledgers, name, type[income|expense], fields JSONB, created_at)
entries     (id, schema_id → schemas, ledger_id → ledgers, data JSONB, created_at)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** v14+
- **npm** v9+

---

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Cashbook
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
DATABASE_URL=postgres://<user>:<password>@localhost:5432/flexiledger
JWT_SECRET=your_super_secret_key
```

Initialise the database tables:

```bash
node init-db.js
```

Start the backend server:

```bash
node server.js
# or with auto-reload:
npx nodemon server.js
```

The API will be available at `http://localhost:5000`.

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder (optional for local dev):

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📡 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint    | Description         | Auth Required |
|--------|-------------|---------------------|---------------|
| POST   | `/register` | Create a new user   | ❌            |
| POST   | `/login`    | Login, returns JWT  | ❌            |

### Ledgers — `/api/ledgers`

| Method | Endpoint                              | Description              |
|--------|---------------------------------------|--------------------------|
| GET    | `/`                                   | List user's ledgers      |
| POST   | `/`                                   | Create a new ledger      |
| GET    | `/:ledgerId/schemas`                  | Get schemas for a ledger |
| POST   | `/:ledgerId/schemas`                  | Create a schema          |
| PUT    | `/:ledgerId/schemas/:id`              | Update a schema          |
| GET    | `/:ledgerId/entries`                  | Get entries for a ledger |
| POST   | `/:ledgerId/entries`                  | Add a new entry          |
| DELETE | `/entries/:id`                        | Delete an entry          |

> All ledger endpoints require a valid `Authorization: Bearer <token>` header.

---

## 📤 Export Formats

### CSV
- Two files: `LedgerName_income.csv` and `LedgerName_expense.csv`
- Columns: `Date`, `Schema`, then each schema field name
- Summary rows appended at the bottom (Total Income, Total Expense, Balance)

### PDF
- Two files: `LedgerName_income.pdf` and `LedgerName_expense.pdf`
- **Income PDF** — Green-themed header, green accent cards & rows
- **Expense PDF** — Red-themed header, red accent cards & rows
- Columns match schema fields exactly (same as CSV)
- Amount field auto-detected: displayed as `Rs. X.XX`, bold, right-aligned
- Page header + footer with page numbers on every page

---

## 🖥️ Pages & Routes

| Route                                     | Page             | Description                          |
|-------------------------------------------|------------------|--------------------------------------|
| `/login`                                  | Login            | User login                           |
| `/register`                               | Register         | New user registration                |
| `/dashboard`                              | Dashboard        | View & create ledgers                |
| `/ledgers/:id`                            | LedgerView       | Entries, stats, charts, export       |
| `/ledgers/:id/schema-builder`             | SchemaBuilder    | Create & edit schema templates       |
| `/ledgers/:id/add-entry`                  | AddEntry         | Add a new transaction entry          |

---

## 🌐 Deployment

### Frontend (Vercel)
The `vercel.json` is pre-configured to build and serve the React frontend.

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set the **Root Directory** to `frontend`
4. Add environment variable: `VITE_API_URL=<your-backend-url>/api`
5. Deploy

### Backend
Deploy to any Node.js-compatible host (e.g., Railway, Render, Heroku).  
Make sure to set the `DATABASE_URL` and `JWT_SECRET` environment variables on the host.

---

## 📄 License

This project is for educational / personal use. Feel free to fork and customise.
