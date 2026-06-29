# WorkFlow - Employee Attendance Management System

> A modern full-stack employee attendance and workforce management system built using **React, Node.js, Express, Prisma, PostgreSQL (Neon), JWT Authentication, Tailwind CSS and Vercel/Render deployment.**

---

# Table of Contents

- Project Overview
- Tech Stack
- Complete System Architecture
- Frontend Workflow
- Backend Workflow
- Authentication Flow
- Attendance Flow
- Leave Management Flow
- Late Attendance Flow
- Office Settings Flow
- Database Design
- Folder Structure
- API Flow
- Security
- Deployment
- Future Improvements

---

# Project Overview

WorkFlow is a complete Employee Attendance Management System designed for organizations to digitally manage attendance, employee records and leave requests.

The system consists of two completely separate applications:

```
Frontend (React + Vercel)
            │
            │ REST APIs
            ▼
Backend (Express + Render)
            │
            ▼
PostgreSQL Database (Neon)
```

Every operation performed by a user eventually reaches the database through secure authenticated APIs.

---

# Technology Stack

## Frontend

- React 19
- React Router DOM
- Axios
- Tailwind CSS
- React Hot Toast
- Heroicons

---

## Backend

- Node.js
- Express.js
- Prisma ORM
- JWT Authentication
- bcryptjs
- CORS
- dotenv

---

## Database

- PostgreSQL
- Neon Cloud Database

---

## Deployment

Frontend

```
Vercel
```

Backend

```
Render
```

Database

```
Neon PostgreSQL
```

---

# COMPLETE SYSTEM WORKFLOW

This section explains the entire execution flow from the moment the user opens the website.

---

# STEP 1

User opens

```
https://workflow.vercel.app
```

Browser downloads

```
index.html
```

---

# STEP 2

index.html loads

```
src/main.jsx
```

Purpose

- Creates React Root
- Wraps application with BrowserRouter
- Loads App.jsx

Flow

```
index.html

↓

main.jsx

↓

<App />
```

---

# STEP 3

App.jsx

This is the application's routing engine.

Responsibilities

- Creates all routes
- Protects authenticated routes
- Protects Admin routes

Example

```
/

↓

Login Page

/dashboard

↓

ProtectedRoute

↓

Dashboard

/admin

↓

AdminRoute

↓

Admin Dashboard
```

---

# STEP 4

React Router

Instead of loading a new webpage every time,

React Router swaps components.

Example

```
Dashboard

↓

Leave Page

↓

Profile

↓

Late History

↓

Admin
```

No page reload occurs.

---

# STEP 5

Login Page

File

```
src/pages/Login.jsx
```

Responsibilities

- Takes Email
- Takes Password
- Calls Login API

```
POST

/api/auth/login
```

using Axios

```
api.post("/auth/login")
```

---

# STEP 6

Axios

Every API request goes through

```
src/services/api.js
```

This file

- Stores Backend URL
- Automatically sends JWT Token
- Handles Authorization header

```
Authorization:

Bearer JWT_TOKEN
```

Every request uses this file.

No component directly knows backend URL.

---

# STEP 7

Backend Receives Request

```
server.js

↓

Routes

↓

Controller

↓

Prisma

↓

Database
```

Example

```
POST

/auth/login

↓

routes/authRoutes.js

↓

controllers/authController.js

↓

Prisma Query

↓

User Table
```

---

# Authentication Workflow

```
Login Page

↓

Axios

↓

Express Route

↓

Auth Controller

↓

Check Email

↓

Compare Password

↓

Generate JWT

↓

Return Token

↓

Save Token in localStorage

↓

Future APIs use Token
```

---

# Protected Routes

When user visits

```
/dashboard
```

ProtectedRoute checks

```
localStorage

↓

Token exists?

↓

YES

↓

Dashboard

NO

↓

Login Page
```

---

# Dashboard Workflow

Dashboard loads

```
Dashboard.jsx
```

Immediately

```
useEffect()

↓

loadDashboard()

↓

Multiple API Calls
```

Examples

```
Attendance History

Attendance Status

Employee Details
```

All APIs run simultaneously.

---

# Clock In Workflow

Employee clicks

```
Clock In
```

Browser requests

```
GPS Location
```

↓

Latitude

↓

Longitude

↓

POST

/attendance/clock-in

↓

Backend

↓

Checks Office Radius

↓

Creates Attendance Record

↓

Checks if Late

↓

Stores Late History

↓

Returns Success

↓

Toast Notification

↓

Dashboard Refreshes
```

---

# Clock Out Workflow

```
Clock Out Button

↓

POST

/attendance/clock-out

↓

Attendance Updated

↓

Total Hours Calculated

↓

Overtime Calculated

↓

Toast

↓

Dashboard Reloads
```

---

# Leave Management Workflow

Employee

↓

Leave Page

↓

Select Date

↓

Future Dates Only

↓

Submit Leave

↓

Pending

↓

Admin Approval

↓

Approved / Rejected

↓

Employee Updated
```

---

# Late Attendance Workflow

Whenever Clock In occurs

Backend performs

```
Attendance Created

↓

Office Start Time

↓

Grace Minutes

↓

Compare Clock In

↓

Late?

↓

YES

↓

LateAttendance Table

↓

No

↓

End
```

Late Page

↓

Fetches

```
LateAttendance

↓

Displays

Date

Clock In

Minutes Late
```

---

# Office Settings Workflow

Admin

↓

Office Settings

↓

Update

- Office Name
- Location
- Radius
- Office Hours
- Grace Minutes
- Working Days

↓

Save

↓

Database Updated

↓

Future Attendance uses New Rules
```

---

# Employee Management Workflow

Admin

↓

Employees Page

↓

View Employees

↓

Add Employee

↓

Edit Employee

↓

Delete Employee

↓

Database Updated
```

---

# Folder Structure

```
Frontend

src/

components/

Layout.jsx

Navbar.jsx

Sidebar.jsx

ProtectedRoute.jsx

AdminRoute.jsx

pages/

Login.jsx

Register.jsx

Dashboard.jsx

Leave.jsx

Late.jsx

Profile.jsx

Admin.jsx

Employees.jsx

OfficeSettings.jsx

services/

api.js

App.jsx

main.jsx

Backend

controllers/

routes/

middleware/

lib/

prisma.js

prisma/

schema.prisma

server.js
```

---

# API Lifecycle

Example

Employee presses Clock In

```
Dashboard.jsx

↓

api.post()

↓

Axios

↓

Backend URL

↓

Express Route

↓

Controller

↓

Middleware

↓

JWT Verification

↓

Prisma

↓

Database

↓

Response

↓

Axios

↓

Dashboard Refresh
```

---

# Database Design

Tables

```
User

Attendance

Leave

LateAttendance

Office
```

Relations

```
User

│

├── Attendance

├── Leave

└── LateAttendance
```

Attendance

```
1 Attendance

↓

Optional LateAttendance
```

---

# Authentication Security

Passwords

```
bcrypt
```

Authentication

```
JWT
```

Protected APIs

```
Authorization Header
```

Password Hashing

```
Never stored in plain text
```

---

# Deployment Architecture

```
Browser

↓

Vercel Frontend

↓

Render Backend

↓

Neon PostgreSQL
```

---

# Complete Request Flow

```
User Clicks Button

↓

React Component

↓

Axios

↓

Backend API

↓

JWT Middleware

↓

Controller

↓

Prisma ORM

↓

PostgreSQL

↓

Prisma

↓

Controller

↓

Axios

↓

React State Update

↓

UI Re-render
```

---

# Future Enhancements

- Face Recognition Attendance
- QR Code Attendance
- Email Notifications
- Payroll Integration
- Shift Scheduling
- Holiday Calendar
- Attendance Analytics
- Monthly Reports
- Excel Export
- Mobile Application
- Multi-Office Support
- Role Based Permission System
- Audit Logs
- Real-time Dashboard
- WebSocket Notifications
- AI Attendance Prediction

---

# Author

**Ddarsh Agarwal**

Built as a production-ready Full Stack Attendance Management System demonstrating:

- React Development
- Express APIs
- PostgreSQL
- Prisma ORM
- Authentication
- Authorization
- Deployment
- Full Stack Architecture
- Modern Software Engineering Practices