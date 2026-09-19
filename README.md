# ExpenseSplitter (Common Wallet) - Full Stack Application

A collaborative expense splitting and shared wallet management application.

---

## 📁 Project Structure

```
ExpenseSplitter/
├── backend/                  # Spring Boot REST API (Java)
│   ├── src/main/java/com/example/
│   │   ├── config/           # CORS and security configurations
│   │   ├── controller/       # AuthController, GroupController, ExpenseController
│   │   ├── entity/           # UserAccount, Group (expense_groups), Expense
│   │   ├── repository/       # Spring Data JPA repositories
│   │   └── ExpensesplitterApplication.java
│   ├── src/main/resources/   # application.properties (MySQL datasource)
│   └── pom.xml               # Maven dependencies (Spring Boot, JPA, MySQL)
│
├── frontend/                 # React 19 + Vite Application
│   ├── src/
│   │   ├── App.jsx           # Main App, Dashboard, Login, Modals, Timeline
│   │   ├── index.css         # Dark glassmorphic design system
│   │   └── main.jsx          # React DOM root entry
│   ├── index.html            # HTML5 template with Google Fonts (Space Grotesk, Inter)
│   ├── package.json          # Node dependencies and scripts
│   └── vite.config.js        # Vite + React plugin configuration
│
└── database/                 # Database scripts
    └── schema.sql            # MySQL schema for tables & seed demo users
```

---

## 📦 Required Modules Implemented

### 1. User Account & Authentication Module (`/api/auth`)
- **Login Endpoint**: `POST /api/auth/login` (validates `username` & `password`).
- **Session Persistence**: React client stores active user session in `localStorage` (`cw_user`).
- **Demo Accounts**:
  - `alice` / `password123`
  - `bob` / `password123`
  - `carol` / `password123`

### 2. Group Management Module (`/api/groups`)
- **Get All Groups**: `GET /api/groups`
- **Get Group Details**: `GET /api/groups/{id}`
- **Create Group**: `POST /api/groups` with `groupName`, `monthlyBudget`, and `createdBy`.
- **Update Group**: `PUT /api/groups/{id}`
- **Delete Group**: `DELETE /api/groups/{id}` (cascades to related expenses).

### 3. Expense & Split Tracking Module (`/api/expenses`)
- **List All Expenses**: `GET /api/expenses`
- **List Group Expenses**: `GET /api/expenses/group/{groupId}` (sorted by date descending).
- **Add Expense**: `POST /api/expenses` with amount, category (Food, Travel, Shopping, Education, Entertainment, Other), date, and split type.
- **Delete Expense**: `DELETE /api/expenses/{id}`

### 4. Shared Wallet & Budget Analytics (Frontend)
- **Interactive Budget Ring**: Conic gradient ring visualizing real-time budget utilization percentage.
- **Wallet Health Score**: Dynamic calculation of spending status (Excellent, On Track, Overspending).
- **Top Spenders Breakdown**: Visual breakdown of contributions by group members.
- **Category Spending Tracker**: Dynamic aggregation of spending across categories.
- **Activity Timeline**: Interactive timeline with delete and refresh controls.

### 5. Database & Persistence Layer (`schema.sql`)
- Tables: `users`, `expense_groups`, `expenses`.
- Foreign keys with referential integrity (`ON DELETE CASCADE` on group expenses).
- Auto-incrementing primary keys and timestamp tracking.

---

## 🚀 How to Run

### Step 1: Database Setup
1. Open MySQL Command Line or MySQL Workbench.
2. Run the SQL script:
   ```sql
   source C:/Anti/ExpenseSplitter/database/schema.sql;
   ```
   Or execute the contents of [schema.sql](file:///C:/Anti/ExpenseSplitter/database/schema.sql).

### Step 2: Run Backend (Spring Boot)
1. Ensure your MySQL service is running on port `3306` with username `root` and password `Root` (or adjust `backend/src/main/resources/application.properties`).
2. Open the `backend` folder in your IDE (Eclipse, Spring Tool Suite, IntelliJ IDEA, or VS Code).
3. Run `ExpensesplitterApplication.java` as a Java Application or Spring Boot App.
4. Server starts on `http://localhost:8080`.

### Step 3: Run Frontend (React + Vite)
1. Open a terminal in `C:\Anti\ExpenseSplitter\frontend`:
   ```bash
   cd C:\Anti\ExpenseSplitter\frontend
   npm run dev
   ```
2. Open `http://localhost:5173` in your browser.
3. Sign in using any demo account (`alice` / `password123`) to start tracking expenses!
