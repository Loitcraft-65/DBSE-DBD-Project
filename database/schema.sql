-- ============================================================
--  ExpenseSplitter Database Schema
--  Database: expense_splitter (MySQL 8+)
-- ============================================================

CREATE DATABASE IF NOT EXISTS expense_splitter;
USE expense_splitter;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    user_id       INT          NOT NULL AUTO_INCREMENT,
    name          VARCHAR(100) NOT NULL,
    username      VARCHAR(80)  NOT NULL UNIQUE,
    email         VARCHAR(150),
    password      VARCHAR(255) NOT NULL,
    phone         VARCHAR(20),
    profile_image VARCHAR(255),
    display_name  VARCHAR(100),
    PRIMARY KEY (user_id)
);

-- 2. EXPENSE GROUPS (named expense_groups to avoid MySQL reserved word GROUP)
CREATE TABLE IF NOT EXISTS expense_groups (
    group_id       INT          NOT NULL AUTO_INCREMENT,
    group_name     VARCHAR(100) NOT NULL,
    monthly_budget DOUBLE       DEFAULT 10000.0,
    created_by     INT,
    created_at     DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id),
    FOREIGN KEY (created_by) REFERENCES users (user_id) ON DELETE SET NULL
);

-- 3. EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
    expense_id   INT             NOT NULL AUTO_INCREMENT,
    group_id     INT             NOT NULL,
    paid_by      INT             NOT NULL,
    description  VARCHAR(255)    NOT NULL,
    amount       DECIMAL(10, 2)  NOT NULL,
    category     VARCHAR(50),
    expense_date DATE            NOT NULL,
    created_at   DATETIME        DEFAULT CURRENT_TIMESTAMP,
    split_type   VARCHAR(20)     NOT NULL DEFAULT 'equal',
    PRIMARY KEY (expense_id),
    FOREIGN KEY (group_id) REFERENCES expense_groups (group_id) ON DELETE CASCADE,
    FOREIGN KEY (paid_by)  REFERENCES users (user_id)
);

-- SEED DATA
INSERT IGNORE INTO users (name, username, email, password, display_name) VALUES
  ('Alice Sharma',  'alice',  'alice@example.com',  'password123', 'Alice'),
  ('Bob Mehta',     'bob',    'bob@example.com',    'password123', 'Bob'),
  ('Carol Singh',   'carol',  'carol@example.com',  'password123', 'Carol');

INSERT IGNORE INTO expense_groups (group_name, monthly_budget, created_by) VALUES
  ('Trip to Goa', 25000.00, 1),
  ('Flat Mates',  15000.00, 2);
