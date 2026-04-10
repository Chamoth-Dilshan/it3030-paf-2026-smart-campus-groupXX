# Smart Campus Operations Hub

Smart Campus Operations Hub is a starter monorepo for a university group project built with React, Vite, Spring Boot, Java 17, MongoDB, and Google OAuth 2.0.

## Project Overview

This repository provides a clean starter setup for a 4-member university team. It includes a runnable frontend, a runnable backend scaffold, starter package boundaries, placeholder models/pages, and CI so the team can start implementing features without first organizing the project from scratch.

## Tech Stack

- Frontend: React + Vite
- Backend: Spring Boot 3 + Java 17
- Database: MongoDB
- Authentication: Google OAuth 2.0
- CI: GitHub Actions

## Main Modules

- Facilities & Assets Catalogue
- Booking Management
- Maintenance & Incident Ticketing
- Notifications
- Authentication & Authorization

## Folder Structure

```text
.
|-- frontend
|-- backend
|-- docs                # architecture notes and future documentation
|-- postman             # API collection placeholders
`-- .github/workflows   # CI pipeline configuration
```

## Beginner-Friendly Team Split

- Member 1: authentication, authorization, Google OAuth setup, user role management
- Member 2: facilities and assets catalogue
- Member 3: booking workflows and admin booking approvals
- Member 4: maintenance tickets, technician queue, and notifications

## Branch Naming Suggestion

Use simple feature branches so each member can work in parallel:

- `feature/member1-auth`
- `feature/member2-resources`
- `feature/member3-bookings`
- `feature/member4-tickets-notifications`

You can also create task-specific branches like `feature/member3-booking-approval-ui`.

## Local Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend placeholder environment values can be copied from `frontend/.env.example`.

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

On Windows PowerShell, use:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The backend will automatically load local values from `backend/.env` when that file exists and you start the app from the `backend` directory.

The backend starter keeps security and database integration as placeholders so the app structure is ready before real business logic is added.

## MongoDB Setup Note

- The backend currently uses a placeholder MongoDB URI with a local default.
- Update values in `backend/.env` based on `backend/.env.example`.
- No production-ready schema or seed data is included yet.

## Google OAuth Setup Note

- Google OAuth 2.0 is not fully implemented yet.
- The scaffold only reserves the security/config structure for a future integration.
- Example client keys are documented as placeholders only and should not be committed with real secrets.

## Notes

- This scaffold intentionally avoids business logic.
- Backend models, controllers, repositories, and services are placeholders.
- OAuth login flow, MongoDB data access rules, and notification delivery are not implemented yet.
- The structure is modular so each team member can work in separate areas with minimal overlap.

## Next Steps

1. Define API contracts in `docs/`.
2. Finalize the MongoDB schema strategy.
3. Add role-based route protection in the frontend.
4. Implement Google OAuth 2.0 login flow in the backend and frontend.
5. Replace placeholder services with real API integration.
