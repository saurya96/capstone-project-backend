# Health App Backend

This is the backend API for the Health App, powered by JSON Server.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on `http://localhost:5000`

## Available Endpoints

- `GET /appointments` - Get all appointments
- `POST /appointments` - Create a new appointment
- `GET /appointments/:id` - Get a specific appointment
- `PUT/PATCH /appointments/:id` - Update an appointment
- `DELETE /appointments/:id` - Delete an appointment

- `GET /users` - Get all users
- `POST /users` - Create a new user
- `GET /users/:id` - Get a specific user

- `GET /doctors` - Get all doctors
- `GET /medicalRecords` - Get all medical records

## Database

The database is stored in `db.json` file.
