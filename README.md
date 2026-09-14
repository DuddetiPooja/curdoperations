# TaskFlow - Task Management System

A full-stack task management project built from the original Flask CRUD project.

## Tech stack
- Frontend: HTML, CSS, JavaScript
- Backend: Python, Flask, REST API
- Database: PostgreSQL + SQLAlchemy
- Authentication: Flask session + password hashing
- DevOps: Docker + Docker Compose

## Features
- Register and login
- Create, view, update and delete tasks
- Task priority: Low / Medium / High
- Task status: Pending / In Progress / Completed
- Due dates
- Search tasks
- Filter by status and priority
- Dashboard statistics
- Responsive UI
- PostgreSQL persistence
- Dockerized application

## Run with Docker
```bash
docker compose up --build
```

Open http://localhost:4000

## API endpoints
- POST `/api/register`
- POST `/api/login`
- POST `/api/logout`
- GET `/api/me`
- GET `/api/dashboard`
- GET `/api/tasks`
- POST `/api/tasks`
- PUT `/api/tasks/<id>`
- DELETE `/api/tasks/<id>`
- GET `/test`
