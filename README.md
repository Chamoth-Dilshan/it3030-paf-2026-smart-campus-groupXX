# Smart Campus Operations System

Smart Campus Operations System is a full-stack platform for managing campus resources, bookings, incidents, and technician workflows.

## Stack

- Frontend: React + Vite
- Backend: Spring Boot + Maven
- Database: MongoDB
- Auth: JWT-based authentication

## Repository Structure

- `frontend/` - React client app
- `backend/` - Spring Boot API
- `docs/` - project docs
- `uploads/` - uploaded assets served by backend

## Prerequisites

- Node.js 20.19+ (or 22.12+ recommended)
- npm 10+
- Java 21+ (project currently runs on Java 25 in this workspace)
- Maven wrapper (already included as `mvnw.cmd`)
- MongoDB connection (configured via environment or `application.properties`)

## Environment Setup

### Frontend

Create `frontend/.env` (optional, defaults shown):

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_BACKEND_URL=http://localhost:8080
```

### Backend

You can provide MongoDB URI and server port via environment variables:

```powershell
$env:SPRING_MONGODB_URI="<your_mongodb_uri>"
$env:SERVER_PORT="8080"
```

If not provided, backend falls back to values in `backend/src/main/resources/application.properties`.

## Run Locally

### 1. Start Backend

From workspace root:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend default URL: `http://localhost:8080`

### 2. Start Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Build

### Frontend build

```powershell
cd frontend
npm run build
```

### Backend package

```powershell
cd backend
.\mvnw.cmd clean package
```

## Key Features

- Resource booking and availability checks
- Booking analytics and dashboard stats
- Incident/ticket management
- Technician assignment and ticket tracking
- Notifications
- File upload and static asset serving

## Performance Note (Issue Management)

Issue Management screens now use a shared Redux Toolkit cache for incident data:

- Shared store in `frontend/src/store/`
- Cached fetch with TTL to reduce repeated API calls between ticket pages
- Manual refresh still supported where needed

## Common Troubleshooting

### 1. `ERR_CONNECTION_REFUSED` to `:8080`

Backend is not running. Start backend first.

### 2. `401 Unauthorized` on `/api/...`

Session token is missing/expired. Log out and log in again.

### 3. Port 8080 already in use

Stop existing process on 8080 or change backend port.

### 4. Upload URL returns 404

File does not exist in upload directory (expected for deleted or wrong filenames).

## Suggested Dev Workflow

1. Start backend.
2. Start frontend.
3. Log in through the app.
4. Validate ticket and booking flows.
5. Use browser React DevTools for component debugging.

## License

Academic project for SLIIT PAF 2026.
