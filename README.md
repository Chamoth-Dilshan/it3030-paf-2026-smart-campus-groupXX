# Smart Campus Operations Hub

Smart Campus Operations Hub is a starter monorepo for a university group project built with React, Vite, Spring Boot, Java 17, MongoDB, and Google OAuth 2.0.

## Project Structure

```text
.
|-- frontend
|-- backend
|-- docs
|-- postman
`-- .github/workflows
```

## Modules

1. Facilities & Assets Catalogue
2. Booking Management
3. Maintenance & Incident Ticketing
4. Notifications
5. Authentication & Authorization

## Suggested Team Split

- Member 1: authentication, authorization, Google OAuth setup, user role management
- Member 2: facilities and assets catalogue
- Member 3: booking workflows and admin approval flow
- Member 4: ticketing, technician queue, and notifications

## Local Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
mvn spring-boot:run
```

## Notes

- This scaffold intentionally avoids business logic.
- Backend models, controllers, repositories, and services are placeholders.
- OAuth, MongoDB, and notification delivery are not implemented yet.
- The structure is modular so each team member can work in separate areas with minimal overlap.

## Next Steps

1. Define API contracts in `docs/`.
2. Finalize the MongoDB schema strategy.
3. Add role-based route protection in the frontend.
4. Implement Google OAuth 2.0 login flow in the backend and frontend.
5. Replace placeholder services with real API integration.
