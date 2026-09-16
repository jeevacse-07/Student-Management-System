# Student Management System

A responsive CRUD-based student directory built with HTML, CSS, and JavaScript.

## Features

- Create, read, update, and delete student records
- Client-side validation for required fields, email, phone, and unique student ID
- Search by name, email, or student ID
- Filter by department and academic year
- Persistent browser storage through `localStorage`
- Responsive desktop and mobile layout

## Run

Open `index.html` in a browser. No package installation or server is required.

## API expansion

For the full SOP submission, the local storage service can be replaced with Django REST Framework endpoints:

```text
GET    /api/students/
GET    /api/students/{id}/
POST   /api/students/
PUT    /api/students/{id}/
DELETE /api/students/{id}/
```

## Validation cases

- Empty required fields are rejected.
- Student IDs must match `STU-0000`.
- Email addresses must have a valid format.
- Phone numbers must contain 10 digits.
- Duplicate student IDs are rejected.
