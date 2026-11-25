
# DUE — REST API Documentation

[Back to README](../README.md)

## 1. Base URL

Production:

https://due-66ut.onrender.com

Local development:

http://localhost:3000

The API accepts and returns JSON data, except for responses that intentionally contain no content.

## 2. Authentication

DUE uses JWT authentication.

After login, the server stores the authentication token in an HTTP-only cookie named `due_session`.

The authentication middleware also supports Bearer tokens when a valid token is available.

```http
Authorization: Bearer YOUR_TOKEN
```

Protected endpoints return HTTP 401 when authentication is missing or invalid.

## 3. Health Endpoint

### GET /health

Checks whether the application server is running.

Authentication: Not required.

Response: `200 OK`

```json
{
    "status": "OK",
    "application": "DUE",
    "message": "Server is running"
}
```

This endpoint checks server availability, not database connectivity.

## 4. Authentication Endpoints

| Method | Endpoint | Authentication |
| --- | --- | --- |
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/auth/me` | Yes |
| POST | `/api/auth/logout` | No |

### Register

POST `/api/auth/register`

Request body:

```json
{
    "name": "Demo Student",
    "email": "student@example.com",
    "password": "ExamplePassword123"
}
```

Successful response: `201 Created`

Registration requires a valid email, a non-empty name, and a password containing at least eight characters.

Duplicate email addresses return `409 Conflict`.

### Login

POST `/api/auth/login`

Request body:

```json
{
    "email": "student@example.com",
    "password": "ExamplePassword123"
}
```

Successful response: `200 OK`

The server creates an authenticated session using an HTTP-only cookie.

Incorrect credentials return `401 Unauthorized`.

### Current User

GET `/api/auth/me`

Returns information about the authenticated user.

Successful response: `200 OK`

Password hashes are not included in the user profile response.

### Logout

POST `/api/auth/logout`

Clears the authentication cookie.

Successful response: `200 OK`

## 5. Assignment Endpoints

All assignment endpoints require authentication.

| Method | Endpoint | Description | Success |
| --- | --- | --- | --- |
| GET | `/api/assignments` | Retrieve assignments | 200 |
| POST | `/api/assignments` | Create an assignment | 201 |
| PUT | `/api/assignments/:id` | Update an assignment | 200 |
| DELETE | `/api/assignments/:id` | Delete an assignment | 204 |

### Create Assignment

POST `/api/assignments`

```json
{
    "title": "Database Project",
    "course": "Computer Science",
    "dueDate": "2026-12-10",
    "priority": "High"
}
```

### Update Assignment

PUT `/api/assignments/:id`

```json
{
    "title": "Updated Database Project",
    "priority": "Medium"
}
```

### Complete Assignment

PUT `/api/assignments/:id`

```json
{
    "completed": true
}
```

### Assignment Validation

| Field | Requirement |
| --- | --- |
| title | Required when creating; non-empty; maximum 255 characters |
| course | Optional string; maximum 255 characters |
| dueDate | Required when creating; valid YYYY-MM-DD date |
| priority | Low, Medium, or High |
| completed | Boolean |
| id | Valid UUID for update and delete operations |

Assignments belonging to another user cannot be updated or deleted.

## 6. Exam Endpoints

All exam endpoints require authentication.

| Method | Endpoint | Description | Success |
| --- | --- | --- | --- |
| GET | `/api/exams` | Retrieve exams | 200 |
| POST | `/api/exams` | Create an exam | 201 |
| PUT | `/api/exams/:id` | Update an exam | 200 |
| DELETE | `/api/exams/:id` | Delete an exam | 204 |

### Create Exam

POST `/api/exams`

```json
{
    "title": "Mathematics Final",
    "course": "Mathematics",
    "examDate": "2026-12-12",
    "location": "Room 101"
}
```

### Update Exam

PUT `/api/exams/:id`

```json
{
    "location": "Room 202"
}
```

### Exam Validation

| Field | Requirement |
| --- | --- |
| title | Required when creating; non-empty; maximum 255 characters |
| course | Optional string; maximum 255 characters |
| examDate | Required when creating; valid YYYY-MM-DD date |
| location | Optional string; maximum 255 characters |
| id | Valid UUID for update and delete operations |

## 7. Settings Endpoints

Both settings endpoints require authentication.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/settings` | Retrieve notification preferences |
| PUT | `/api/settings` | Update notification preferences |

### Update Notification Preferences

PUT `/api/settings`

```json
{
    "emailReminders": true,
    "reminderTime": "19:00",
    "timezone": "America/Chicago"
}
```

Successful response: `200 OK`

Validation requirements:

- emailReminders must be a boolean.
- reminderTime must use a valid HH:MM format.
- timezone must be a valid timezone identifier.

## 8. HTTP Status Codes

| Status | Meaning |
| --- | --- |
| 200 | Successful request |
| 201 | Resource created |
| 204 | Resource deleted successfully |
| 400 | Invalid request or input |
| 401 | Missing or invalid authentication |
| 404 | Resource or API endpoint not found |
| 409 | Duplicate email registration |
| 413 | Request payload too large |
| 500 | Internal server or database error |

## 9. Error Response Examples

Invalid resource ID:

```json
{
    "error": "Invalid resource ID."
}
```

Malformed JSON:

```json
{
    "error": "Invalid JSON format."
}
```

Unknown API endpoint:

```json
{
    "error": "API endpoint not found."
}
```

Unexpected server error:

```json
{
    "error": "Internal server error."
}
```

Authentication may be checked before resource validation on protected routes.

Internal error details are recorded on the server rather than exposed to clients.

## 10. Testing the API

The API can be tested using browser developer tools, Postman, curl, or the automated Supertest integration tests.

Run the integration tests:

```bash
npm test -- integration.test.js
```

---

DUE — REST API Documentation
