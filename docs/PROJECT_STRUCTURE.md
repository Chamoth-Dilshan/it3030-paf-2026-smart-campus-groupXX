# Project Structure

Smart Campus Operations Hub uses a simple full-stack structure so each group member can explain one module clearly during the viva.

## Top-Level Folders

```text
project-root/
├── frontend/
├── backend/
├── docs/
├── postman/
├── uploads/
├── .github/workflows/
├── README.md
└── .gitignore
```

## Frontend Ownership

The React app uses feature-based folders under `frontend/src/features`.

- `auth`: login, registration, dashboard, and user management pages.
- `resources`: resource listing, resource forms, resource details, and availability views.
- `bookings`: booking request, booking list, admin approval, status display, validation, and booking API calls.
- `tickets`: incident reporting, ticket lists, technician screens, and ticket Redux state.
- `notifications`: user notification screen and future notification-specific components/services.

Shared frontend code stays outside feature folders:

- `components/common`: shared UI used across modules, such as navigation and protected routes.
- `layouts`: page layouts such as the admin layout.
- `routes`: general public pages such as home and about.
- `services/api.js`: common Axios API client.
- `context`: app-wide context such as authentication state.

## Backend Ownership

The Spring Boot backend uses layered architecture under `backend/src/main/java/com/sliit/smartcampus`.

- `controller`: REST API endpoints.
- `service`: business logic.
- `repository`: MongoDB repositories.
- `model`: database document models and enums.
- `dto`: request and response objects, grouped by module.
- `exception`: module-specific and common error handling.
- `security`: JWT, OAuth, and Spring Security configuration.
- `config`: general application configuration and seed data.
- `util`: shared helper classes when needed.

## Booking Management Component

Booking Management is intentionally easy to identify.

Frontend booking files:

```text
frontend/src/features/bookings/
├── components/
├── constants/
├── pages/
├── services/
└── utils/
```

Backend booking files:

```text
controller/BookingController.java
service/BookingService.java
repository/BookingRepository.java
model/Booking.java
model/BookingStatus.java
dto/booking/
exception/booking/
test/booking/
```

The booking flow is: React booking pages call `bookingService.js`, the backend receives requests in `BookingController`, business rules run in `BookingService`, and MongoDB access goes through `BookingRepository`.

## Postponed Cleanup Review

These files are kept for now because they may still be useful for demos or group-level dashboards, but they should be reviewed before final submission:

- `frontend/src/features/bookings/pages/AdminDashboard.jsx`
- `frontend/src/features/bookings/pages/DashboardPage.jsx`
- `frontend/src/features/bookings/pages/ManagerDashboard.jsx`
- `frontend/src/features/auth/pages/LoginPage.jsx`
- `frontend/src/features/resources/pages/AvailabilityPage.jsx`

`frontend/src/features/bookings/pages/AnalyticsDashboard.jsx` is kept because it is actively routed at `/admin/analytics`.
