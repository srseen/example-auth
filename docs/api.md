# API Documentation

The backend exposes a REST API under the `/api/v1` prefix.
If `@nestjs/swagger` is installed, a Swagger UI is available at `/api/docs` when the server is running.

## Auth Endpoints
- `POST /api/v1/auth/register` – create a new user
- `POST /api/v1/auth/login` – authenticate and receive tokens
- `POST /api/v1/auth/logout` – invalidate refresh token
- `GET /api/v1/auth/google` – Google OAuth login
- `GET /api/v1/auth/google/callback` – OAuth redirect handler
- `GET /api/v1/auth/facebook` – Facebook OAuth login
- `GET /api/v1/auth/facebook/callback` – OAuth redirect handler

## Task Endpoints
- `GET /api/v1/tasks` – list current user's tasks; supports `status`, `sortBy`, and `order` query params
- `POST /api/v1/tasks` – create a task
- `PATCH /api/v1/tasks/:id` – update a task
- `DELETE /api/v1/tasks/:id` – remove a task

## User Endpoints
- `GET /api/v1/users/profile` – fetch authenticated user profile
- `PATCH /api/v1/users/profile` – update user details
- `POST /api/v1/users/profile-picture` – upload avatar image
