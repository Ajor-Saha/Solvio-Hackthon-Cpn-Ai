# CPN-AI API Documentation

## Overview

This document describes all API endpoints for the CPN-AI (Campus Projects & Proof Network) system.

**Base URL**: `http://localhost:8000/api`

**Authentication**: Some endpoints require JWT authentication via the `verifyJWT` middleware.

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Management Endpoints](#user-management-endpoints-for-department-admins)
3. [Institution Endpoints](#institution-endpoints)
4. [Department Endpoints](#department-endpoints)
5. [Course Management Endpoints](#course-management-endpoints)
6. [Course Resource Endpoints](#course-resource-endpoints)

---

## Authentication Endpoints

### 1. Sign Up (Register)

**POST** `/auth/signup`

Creates a new user account. User is automatically verified.

**Authentication Required**: No

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "departmentId": "uuid-v4-string",
  "role": "student"
}
```

**Fields:**

- `firstName` (required): User's first name
- `lastName` (optional): User's last name
- `email` (required): User's email address
- `password` (required): User's password
- `departmentId` (required): UUID of the department
- `role` (optional): User role - `student`, `faculty`, or `department_admin` (defaults to `student`)

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "uuid-v4-string",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "avatar": null,
    "role": "student",
    "departmentId": "uuid-v4-string",
    "isVerified": true,
    "deletedAt": null,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": null
  }
}
```

**Error Responses:**

- `400`: Missing required fields or user already exists
- `500`: Internal server error

---

### 2. Sign In (Login)

**POST** `/auth/signin`

Authenticates a user and returns an access token.

**Authentication Required**: No

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "jwt-token-string",
  "data": {
    "userId": "uuid-v4-string",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "avatar": null,
    "role": "student",
    "departmentId": "uuid-v4-string",
    "isVerified": true,
    "deletedAt": null,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": null
  }
}
```

**Note**: The access token is also set as an HTTP-only cookie named `accessToken`.

**Error Responses:**

- `400`: Email and password are required
- `401`: Invalid credentials
- `404`: User not found or not verified
- `500`: Internal server error

---

### 3. Sign Out (Logout)

**POST** `/auth/signout`

Logs out the current user by clearing the access token cookie.

**Authentication Required**: Yes

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Logout successful",
  "data": {}
}
```

**Error Responses:**

- `401`: Unauthorized request
- `500`: Internal server error

---

### 4. Update Profile Picture

**PUT** `/auth/update-profile-picture`

Updates the user's profile picture.

**Authentication Required**: Yes

**Content-Type**: `multipart/form-data`

**Form Data:**

- `file`: Image file (the field name should match what your `uploadMiddleware` expects)

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Profile picture updated successfully",
  "data": {
    "userId": "uuid-v4-string",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "avatar": "https://your-cdn-url.com/unique-filename.jpg",
    "role": "student",
    "departmentId": "uuid-v4-string",
    "isVerified": true,
    "deletedAt": null,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": "2025-11-02T11:00:00.000Z"
  }
}
```

**Error Responses:**

- `400`: No file uploaded or invalid file
- `401`: Unauthorized
- `404`: User not found
- `500`: Internal server error

---

### 5. Change Password

**PUT** `/auth/change-password`

Changes the password for the authenticated user.

**Authentication Required**: Yes

**Request Body:**

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Password updated successfully",
  "data": {}
}
```

**Error Responses:**

- `400`: Missing fields, incorrect current password, or user not verified
- `401`: Not authenticated
- `500`: Internal server error

---

### 6. Reset Password

**PUT** `/auth/reset-password`

Resets a user's password (no authentication required).

**Authentication Required**: No

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "newPassword123"
}
```

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Password reset successfully",
  "data": {}
}
```

**Error Responses:**

- `400`: Missing required fields
- `404`: User not found or not verified
- `500`: Internal server error

---

### 7. Update User Profile

**PUT** `/auth/update-profile`

Updates the user's profile information (first name and last name).

**Authentication Required**: Yes

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Smith"
}
```

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "userId": "uuid-v4-string",
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.doe@example.com",
    "avatar": "https://your-cdn-url.com/profile.jpg",
    "role": "student",
    "departmentId": "uuid-v4-string",
    "isVerified": true,
    "deletedAt": null,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": "2025-11-02T12:00:00.000Z"
  }
}
```

**Error Responses:**

- `400`: First name is required or user not verified
- `401`: Not authenticated
- `500`: Internal server error

---

### 8. Server Status

**GET** `/auth/server-status`

Checks the server status and readiness.

**Authentication Required**: No

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Server status retrieved successfully",
  "data": {
    "status": "ready",
    "message": "Server is ready! You can now sign in.",
    "uptime": 120,
    "isReady": true
  }
}
```

**Error Responses:**

- `500`: Error getting server status

---

## User Management Endpoints (For Department Admins)

**Authentication Required**: Yes (JWT + Department Admin Role)

These endpoints allow department administrators to add students and faculty members to their department.

### 1. Add Single User

**POST** `/user-management/add-user`

Add a single student or faculty member to the department.

**Authentication Required**: Yes (Department Admin only)

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "student",
  "departmentId": "uuid-v4-string"
}
```

**Fields:**

- `firstName` (required): User's first name
- `lastName` (optional): User's last name
- `email` (required): User's email address
- `role` (required): Either `student` or `faculty`
- `departmentId` (optional): Defaults to admin's department if not provided

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Student added successfully",
  "data": {
    "user": {
      "userId": "uuid-v4-string",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "avatar": null,
      "role": "student",
      "departmentId": "uuid-v4-string",
      "isVerified": true,
      "deletedAt": null,
      "createdAt": "2025-11-02T10:30:00.000Z",
      "updatedAt": null
    },
    "credentials": {
      "email": "john.doe@example.com",
      "password": "john1234"
    }
  }
}
```

**Note**: The password is auto-generated and returned in the response. The admin should manually share these credentials with the user.

**Error Responses:**

- `400`: Missing required fields or user already exists
- `403`: User is not a department admin
- `404`: Department not found
- `500`: Internal server error

---

### 2. Add Multiple Users via CSV

**POST** `/user-management/add-users-csv`

Upload a CSV file to add multiple students and faculty members at once.

**Authentication Required**: Yes (Department Admin only)

**Content-Type**: `multipart/form-data`

**Form Data:**

- `file` (required): CSV file
- `departmentId` (optional): Defaults to admin's department if not provided

**CSV Format:**

```csv
firstName,lastName,email,role
John,Doe,john.doe@example.com,student
Jane,Smith,jane.smith@example.com,student
Michael,Johnson,michael.j@example.com,faculty
```

**Required CSV Columns:**

- `firstName`: User's first name (required)
- `lastName`: User's last name (optional)
- `email`: User's email address (required)
- `role`: Either `student` or `faculty` (required)

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Processed 5 users. 4 added successfully, 1 failed.",
  "data": {
    "summary": {
      "total": 5,
      "successful": 4,
      "failed": 1
    },
    "successfulUsers": [
      {
        "user": {
          "userId": "uuid-v4-string",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "avatar": null,
          "role": "student",
          "departmentId": "uuid-v4-string",
          "isVerified": true,
          "deletedAt": null,
          "createdAt": "2025-11-02T10:30:00.000Z",
          "updatedAt": null
        },
        "credentials": {
          "email": "john.doe@example.com",
          "password": "john1234"
        }
      }
    ],
    "failedUsers": [
      {
        "email": "duplicate@example.com",
        "reason": "User already exists with this email"
      }
    ]
  }
}
```

**Error Responses:**

- `400`: CSV file missing, invalid format, or empty
- `403`: User is not a department admin
- `404`: Department not found
- `500`: Internal server error

---

### 3. Get Department Users

**GET** `/user-management/department-users`

Get all users in the admin's department. Optionally filter by role.

**Authentication Required**: Yes (Department Admin only)

**Query Parameters:**

- `role` (optional): Filter by role - `student`, `faculty`, or `department_admin`

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Department users retrieved successfully",
  "data": [
    {
      "userId": "uuid-v4-string",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "avatar": null,
      "role": "student",
      "departmentId": "uuid-v4-string",
      "isVerified": true,
      "createdAt": "2025-11-02T10:30:00.000Z",
      "updatedAt": null
    }
  ]
}
```

**Error Responses:**

- `403`: User is not a department admin
- `500`: Internal server error

---

## Institution Endpoints

**Authentication Required**: No (all institution endpoints are currently public)

### 1. Create Institution

**POST** `/institution/create`

Creates a new institution in the system.

**Request Body:**

```json
{
  "name": "University of Example",
  "code": "UOE"
}
```

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Institution created successfully",
  "data": {
    "institutionId": "uuid-v4-string",
    "name": "University of Example",
    "code": "UOE",
    "deletedAt": null,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": null
  }
}
```

**Error Responses:**

- `400`: Missing required fields (name or code)
- `409`: Institution with this code already exists
- `500`: Internal server error

---

### 2. Get All Institutions

**GET** `/institution/list`

Retrieves all active institutions (non-deleted).

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Institutions retrieved successfully",
  "data": [
    {
      "institutionId": "uuid-v4-string",
      "name": "University of Example",
      "code": "UOE",
      "createdAt": "2025-11-02T10:30:00.000Z",
      "updatedAt": null
    }
  ]
}
```

---

### 3. Get Institution by ID

**GET** `/institution/:institutionId`

Retrieves a specific institution by its ID.

**URL Parameters:**

- `institutionId`: UUID of the institution

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Institution retrieved successfully",
  "data": {
    "institutionId": "uuid-v4-string",
    "name": "University of Example",
    "code": "UOE",
    "deletedAt": null,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": null
  }
}
```

**Error Responses:**

- `400`: Institution ID is required
- `404`: Institution not found
- `500`: Internal server error

---

### 4. Update Institution

**PUT** `/institution/update/:institutionId`

Updates an existing institution.

**URL Parameters:**

- `institutionId`: UUID of the institution

**Request Body:**

```json
{
  "name": "Updated University Name",
  "code": "UUN"
}
```

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Institution updated successfully",
  "data": {
    "institutionId": "uuid-v4-string",
    "name": "Updated University Name",
    "code": "UUN",
    "deletedAt": null,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": "2025-11-02T11:45:00.000Z"
  }
}
```

**Error Responses:**

- `400`: No valid fields provided for update
- `404`: Institution not found
- `409`: Institution with this code already exists
- `500`: Internal server error

---

### 5. Delete Institution

**DELETE** `/institution/delete/:institutionId`

Soft deletes an institution (sets deletedAt timestamp).

**URL Parameters:**

- `institutionId`: UUID of the institution

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Institution deleted successfully",
  "data": {}
}
```

**Error Responses:**

- `400`: Institution ID is required
- `404`: Institution not found
- `500`: Internal server error

---

## Department Endpoints

**Authentication Required**: No (all department endpoints are currently public)

### 1. Create Department

**POST** `/department/create`

Creates a new department under an institution.

**Request Body:**

```json
{
  "institutionId": "uuid-v4-string",
  "name": "Computer Science",
  "code": "CS"
}
```

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Department created successfully",
  "data": {
    "departmentId": "uuid-v4-string",
    "institutionId": "uuid-v4-string",
    "name": "Computer Science",
    "code": "CS",
    "deletedAt": null,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": null,
    "institutionName": "University of Example",
    "institutionCode": "UOE"
  }
}
```

**Error Responses:**

- `400`: Missing required fields (institutionId, name, or code)
- `404`: Institution not found
- `409`: Department with this code already exists in this institution
- `500`: Internal server error

---

### 2. Get All Departments

**GET** `/department/list`

Retrieves all active departments with their institution details.

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Departments retrieved successfully",
  "data": [
    {
      "departmentId": "uuid-v4-string",
      "institutionId": "uuid-v4-string",
      "name": "Computer Science",
      "code": "CS",
      "createdAt": "2025-11-02T10:30:00.000Z",
      "updatedAt": null,
      "institutionName": "University of Example",
      "institutionCode": "UOE"
    }
  ]
}
```

---

### 3. Get Departments by Institution

**GET** `/department/by-institution/:institutionId`

Retrieves all departments for a specific institution.

**URL Parameters:**

- `institutionId`: UUID of the institution

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Departments retrieved successfully",
  "data": [
    {
      "departmentId": "uuid-v4-string",
      "institutionId": "uuid-v4-string",
      "name": "Computer Science",
      "code": "CS",
      "createdAt": "2025-11-02T10:30:00.000Z",
      "updatedAt": null
    }
  ]
}
```

**Error Responses:**

- `400`: Institution ID is required
- `404`: Institution not found
- `500`: Internal server error

---

### 4. Get Department by ID

**GET** `/department/:departmentId`

Retrieves a specific department by its ID with institution details.

**URL Parameters:**

- `departmentId`: UUID of the department

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Department retrieved successfully",
  "data": {
    "departmentId": "uuid-v4-string",
    "institutionId": "uuid-v4-string",
    "name": "Computer Science",
    "code": "CS",
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": null,
    "deletedAt": null,
    "institutionName": "University of Example",
    "institutionCode": "UOE"
  }
}
```

**Error Responses:**

- `400`: Department ID is required
- `404`: Department not found
- `500`: Internal server error

---

### 5. Update Department

**PUT** `/department/update/:departmentId`

Updates an existing department.

**URL Parameters:**

- `departmentId`: UUID of the department

**Request Body:**

```json
{
  "name": "Updated Department Name",
  "code": "UDN"
}
```

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Department updated successfully",
  "data": {
    "departmentId": "uuid-v4-string",
    "institutionId": "uuid-v4-string",
    "name": "Updated Department Name",
    "code": "UDN",
    "deletedAt": null,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": "2025-11-02T11:45:00.000Z"
  }
}
```

**Error Responses:**

- `400`: No valid fields provided for update
- `404`: Department not found
- `409`: Department with this code already exists in this institution
- `500`: Internal server error

---

### 6. Delete Department

**DELETE** `/department/delete/:departmentId`

Soft deletes a department (sets deletedAt timestamp).

**URL Parameters:**

- `departmentId`: UUID of the department

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Department deleted successfully",
  "data": {}
}
```

**Error Responses:**

- `400`: Department ID is required
- `404`: Department not found
- `500`: Internal server error

---

## Course Management Endpoints

These endpoints manage courses and course enrollments within departments.

### 1. Create Course

**POST** `/course/create`

Creates a new course in a department.

**Authentication Required**: Yes (Department Admin only)

**Request Body:**

```json
{
  "courseCode": "CSE101",
  "title": "Introduction to Programming",
  "semester": "1/1",
  "credits": 3,
  "capacity": 40,
  "departmentId": "uuid-v4-string"
}
```

**Fields:**

- `courseCode` (required): Course code (auto-converted to uppercase)
- `title` (required): Course title
- `semester` (required): Semester (e.g., "1/1", "2/2")
- `credits` (required): Number of credits
- `capacity` (optional): Maximum students (default: 30)
- `departmentId` (optional): Defaults to admin's department if not provided

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Course created successfully",
  "data": {
    "courseId": "uuid-v4-string",
    "departmentId": "uuid-v4-string",
    "courseCode": "CSE101",
    "title": "Introduction to Programming",
    "semester": "1/1",
    "credits": 3,
    "capacity": 40,
    "deletedAt": null,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": null
  }
}
```

**Error Responses:**

- `400`: Missing required fields
- `403`: User is not a department admin
- `404`: Department not found
- `409`: Course with this code already exists in the department
- `500`: Internal server error

---

### 2. Get All Courses

**GET** `/course/list?departmentId=uuid-v4-string`

Retrieves all courses in a department.

**Authentication Required**: No

**Query Parameters:**

- `departmentId` (required): UUID of the department

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Courses retrieved successfully",
  "data": [
    {
      "courseId": "uuid-v4-string",
      "departmentId": "uuid-v4-string",
      "courseCode": "CSE101",
      "title": "Introduction to Programming",
      "semester": "1/1",
      "credits": 3,
      "capacity": 40,
      "deletedAt": null,
      "createdAt": "2025-11-02T10:30:00.000Z",
      "updatedAt": null
    }
  ]
}
```

**Error Responses:**

- `400`: Department ID is required
- `404`: Department not found
- `500`: Internal server error

---

### 3. Get Course by ID

**GET** `/course/:courseId`

Retrieves a specific course by its ID.

**Authentication Required**: No

**URL Parameters:**

- `courseId`: UUID of the course

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Course retrieved successfully",
  "data": {
    "courseId": "uuid-v4-string",
    "departmentId": "uuid-v4-string",
    "courseCode": "CSE101",
    "title": "Introduction to Programming",
    "semester": "1/1",
    "credits": 3,
    "capacity": 40,
    "deletedAt": null,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": null
  }
}
```

**Error Responses:**

- `400`: Course ID is required
- `404`: Course not found
- `500`: Internal server error

---

### 4. Update Course

**PUT** `/course/update/:courseId`

Updates an existing course.

**Authentication Required**: Yes (Department Admin only)

**URL Parameters:**

- `courseId`: UUID of the course

**Request Body:**

```json
{
  "courseCode": "CSE102",
  "title": "Advanced Programming",
  "semester": "1/2",
  "credits": 4,
  "capacity": 35
}
```

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Course updated successfully",
  "data": {
    "courseId": "uuid-v4-string",
    "departmentId": "uuid-v4-string",
    "courseCode": "CSE102",
    "title": "Advanced Programming",
    "semester": "1/2",
    "credits": 4,
    "capacity": 35,
    "deletedAt": null,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": "2025-11-02T11:00:00.000Z"
  }
}
```

**Error Responses:**

- `400`: No valid fields provided for update or Course ID required
- `403`: User is not a department admin
- `404`: Course not found
- `409`: Course with this code already exists in the department
- `500`: Internal server error

---

### 5. Delete Course

**DELETE** `/course/delete/:courseId`

Soft deletes a course.

**Authentication Required**: Yes (Department Admin only)

**URL Parameters:**

- `courseId`: UUID of the course

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Course deleted successfully",
  "data": {}
}
```

**Error Responses:**

- `400`: Course ID is required
- `403`: User is not a department admin
- `404`: Course not found
- `500`: Internal server error

---

### 6. Enroll Instructor in Course (Single)

**POST** `/course/enroll`

Enrolls a single faculty member as an instructor in a course.

**Authentication Required**: Yes (Department Admin only)

**Request Body:**

```json
{
  "courseId": "uuid-v4-string",
  "userId": "uuid-v4-string",
  "roleInCourse": "instructor"
}
```

**Fields:**

- `courseId` (required): UUID of the course
- `userId` (required): UUID of the faculty user
- `roleInCourse` (required): Must be `instructor`

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Instructor enrolled successfully",
  "data": {
    "enrollmentId": "uuid-v4-string",
    "courseId": "uuid-v4-string",
    "userId": "uuid-v4-string",
    "roleInCourse": "instructor",
    "enrollmentDate": "2025-11-02T10:30:00.000Z",
    "deletedAt": null,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": null
  }
}
```

**Error Responses:**

- `400`: Missing required fields, invalid role, or this endpoint is for instructors only
- `403`: User is not a department admin
- `404`: Course or user not found
- `409`: User already enrolled in course
- `500`: Internal server error

**Note**: This endpoint only accepts instructor enrollment. For student enrollment, use the bulk enrollment endpoint.

---

### 7. Bulk Enroll Students in Course

**POST** `/course/enroll/bulk`

Enrolls multiple students in a course at once.

**Authentication Required**: Yes (Department Admin only)

**Request Body:**

```json
{
  "courseId": "uuid-v4-string",
  "userIds": ["student-uuid-1", "student-uuid-2", "student-uuid-3"]
}
```

**Fields:**

- `courseId` (required): UUID of the course
- `userIds` (required): Array of student user UUIDs

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Processed 5 enrollments. 4 successful, 1 failed.",
  "data": {
    "summary": {
      "total": 5,
      "successful": 4,
      "failed": 1
    },
    "successfulEnrollments": [
      {
        "enrollmentId": "enrollment-uuid-1",
        "userId": "student-uuid-1",
        "email": "student1@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      {
        "enrollmentId": "enrollment-uuid-2",
        "userId": "student-uuid-2",
        "email": "student2@example.com",
        "firstName": "Jane",
        "lastName": "Smith"
      }
    ],
    "failedEnrollments": [
      {
        "userId": "student-uuid-3",
        "email": "student3@example.com",
        "reason": "Already enrolled in this course"
      }
    ]
  }
}
```

**Error Responses:**

- `400`: Missing required fields, empty userIds array, or not enough capacity
- `403`: User is not a department admin
- `404`: Course not found
- `500`: Internal server error

**Capacity Management:**

- System checks available slots before processing: `Available slots = Course capacity - Current student enrollments`
- If requested enrollments exceed available slots, entire request is rejected
- Individual validations for each student:
  - User must exist
  - User must have role `student` (not faculty or admin)
  - User cannot already be enrolled in the course

**Partial Success:**

The endpoint supports partial success - some enrollments may succeed while others fail. Check the `successfulEnrollments` and `failedEnrollments` arrays in the response.

---

### 8. Get Course Enrollments

**GET** `/course/:courseId/enrollments?roleInCourse=student`

Retrieves all enrollments for a course with user details.

**Authentication Required**: No

**URL Parameters:**

- `courseId`: UUID of the course

**Query Parameters:**

- `roleInCourse` (optional): Filter by role - `student` or `instructor`

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Enrollments retrieved successfully",
  "data": [
    {
      "enrollmentId": "uuid-v4-string",
      "courseId": "uuid-v4-string",
      "userId": "uuid-v4-string",
      "roleInCourse": "student",
      "enrollmentDate": "2025-11-02T10:30:00.000Z",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "avatar": null
    }
  ]
}
```

**Error Responses:**

- `400`: Course ID is required
- `404`: Course not found
- `500`: Internal server error

---

### 9. Unenroll User from Course

**DELETE** `/course/unenroll/:enrollmentId`

Removes a user's enrollment from a course.

**Authentication Required**: Yes (Department Admin only)

**URL Parameters:**

- `enrollmentId`: UUID of the enrollment

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "User unenrolled successfully",
  "data": {}
}
```

**Error Responses:**

- `400`: Enrollment ID is required
- `403`: User is not a department admin
- `404`: Enrollment not found
- `500`: Internal server error

---

### 10. Get User's Enrolled Courses

**GET** `/course/user/:userId/courses`

Retrieves all courses a user is enrolled in.

**Authentication Required**: No

**URL Parameters:**

- `userId`: UUID of the user

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Courses retrieved successfully",
  "data": [
    {
      "enrollmentId": "uuid-v4-string",
      "roleInCourse": "student",
      "enrollmentDate": "2025-11-02T10:30:00.000Z",
      "courseId": "uuid-v4-string",
      "courseCode": "CSE101",
      "title": "Introduction to Programming",
      "semester": "1/1",
      "credits": 3,
      "capacity": 40
    }
  ]
}
```

**Error Responses:**

- `400`: User ID is required
- `404`: User not found
- `500`: Internal server error

---

## Course Resource Endpoints

These endpoints manage course resources (PDFs, PPTs, images, links) that faculty upload for their courses.

### 1. Upload Course Resource

**POST** `/course-resource/upload`

Uploads a course resource file to S3/R2 or adds a link resource.

**Authentication Required**: Yes (Faculty or Department Admin only)

**Content-Type**: `multipart/form-data`

**Form Data:**

- `file` (required for pdf/ppt/image): File to upload
- `courseId` (required): UUID of the course
- `title` (required): Resource title
- `description` (optional): Resource description
- `resourceType` (required): One of `pdf`, `ppt`, `image`, `link`
- `fileUrl` (required for link type): URL for link resources

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Course resource uploaded successfully",
  "data": {
    "resourceId": "uuid-v4-string",
    "courseId": "uuid-v4-string",
    "title": "Lecture 1 - Introduction",
    "description": "Introduction to the course",
    "resourceType": "pdf",
    "fileUrl": "https://your-cdn-url.com/course-resources/unique-filename.pdf",
    "fileSize": "2.5 MB",
    "uploadedBy": "faculty-user-id",
    "deletedAt": null,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": "2025-11-02T10:30:00.000Z"
  }
}
```

**Error Responses:**

- `400`: Missing required fields, invalid resource type, or file required
- `401`: Unauthorized (not authenticated)
- `403`: User is not faculty/admin or not enrolled as instructor
- `404`: Course not found
- `500`: Internal server error

**Note**:

- For `pdf`, `ppt`, and `image` types, file upload is required
- For `link` type, provide `fileUrl` in the form data instead of a file
- Faculty must be enrolled as instructor in the course to upload resources
- Department admins can upload to any course in their department

---

### 2. Get Course Resources

**GET** `/course-resource/:courseId`

Retrieves all resources for a specific course with uploader details.

**Authentication Required**: Yes

**URL Parameters:**

- `courseId`: UUID of the course

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Course resources retrieved successfully",
  "data": [
    {
      "resourceId": "uuid-v4-string",
      "courseId": "uuid-v4-string",
      "title": "Lecture 1 - Introduction",
      "description": "Introduction to the course",
      "resourceType": "pdf",
      "fileUrl": "https://your-cdn-url.com/course-resources/unique-filename.pdf",
      "fileSize": "2.5 MB",
      "uploadedBy": "faculty-user-id",
      "createdAt": "2025-11-02T10:30:00.000Z",
      "updatedAt": "2025-11-02T10:30:00.000Z",
      "uploaderFirstName": "Michael",
      "uploaderLastName": "Johnson",
      "uploaderEmail": "michael.j@example.com"
    }
  ]
}
```

**Error Responses:**

- `400`: Course ID is required
- `401`: Unauthorized
- `404`: Course not found
- `500`: Internal server error

---

### 3. Delete Course Resource

**DELETE** `/course-resource/delete/:resourceId`

Soft deletes a course resource (only uploader or department admin can delete).

**Authentication Required**: Yes

**URL Parameters:**

- `resourceId`: UUID of the resource

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Resource deleted successfully",
  "data": {}
}
```

**Error Responses:**

- `400`: Resource ID is required
- `401`: Unauthorized
- `403`: User does not have permission to delete this resource
- `404`: Resource not found
- `500`: Internal server error

---

## Authentication

### JWT Token Authentication

Some endpoints require JWT authentication. You can provide the token in two ways:

1. **Cookie**: The token is automatically set as an HTTP-only cookie named `accessToken` when you sign in.

2. **Authorization Header**:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

To obtain a token, use the `/api/auth/signin` endpoint.

---

## Common Response Format

All API responses follow this format:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Success message",
  "data": {}
}
```

**Fields:**

- `statusCode`: HTTP status code
- `success`: Boolean indicating success (true if statusCode < 400)
- `message`: Human-readable message
- `data`: Response data (can be object, array, or null)

---

## User Roles

The system supports three user roles:

1. **`student`**: Regular student users (default)
2. **`faculty`**: Faculty/teacher users
3. **`department_admin`**: Department administrators

---

## Notes

1. **Soft Delete**: Users, institutions, and departments use soft delete, meaning records are marked as deleted but not removed from the database.

2. **Password Security**: All passwords are hashed using bcrypt before storage.

3. **Code Uniqueness**:

   - Institution codes must be unique across all institutions
   - Department codes must be unique within each institution (but can be the same across different institutions)

4. **Code Format**: All institution and department codes are automatically converted to uppercase.

5. **Timestamps**: All records include `createdAt` and `updatedAt` timestamps.

6. **Foreign Key Constraints**:

   - A department cannot be created without a valid `institutionId`
   - A user cannot be created without a valid `departmentId`

7. **Profile Pictures**: Stored in R2/S3-compatible storage. Old profile pictures are automatically deleted when updating.

8. **Auto-Verification**: New users are automatically verified (`isVerified: true`) - no email verification required.

---

## Environment Variables Required

Make sure these environment variables are set:

```env
# Server
PORT=8000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key

# R2/S3 Storage (for profile pictures)
BUCKET_NAME=your-bucket-name
PUBLIC_ACCESS_URL=https://your-cdn-url.com
```

---

## Example Usage

### Sign Up and Sign In Flow

```bash
# 1. Sign up
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "departmentId": "department-uuid-here",
    "role": "student"
  }'

# 2. Sign in
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# 3. Use authenticated endpoint
curl -X PUT http://localhost:8000/api/auth/update-profile \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

### Institution and Department Setup

```bash
# 1. Create Institution
curl -X POST http://localhost:8000/api/institution/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Shahjalal University of Science and Technology",
    "code": "SUST"
  }'

# 2. Create Department (use institutionId from previous response)
curl -X POST http://localhost:8000/api/department/create \
  -H "Content-Type: application/json" \
  -d '{
    "institutionId": "institution-uuid-here",
    "name": "Computer Science and Engineering",
    "code": "CSE"
  }'
```

### User Management (Department Admin)

```bash
# 1. Sign in as department admin
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# 2. Add single student
curl -X POST http://localhost:8000/api/user-management/add-user \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "student"
  }'

# 3. Add multiple users via CSV
curl -X POST http://localhost:8000/api/user-management/add-users-csv \
  -b cookies.txt \
  -F "file=@sample-users.csv"

# 4. Get all students in department
curl -X GET "http://localhost:8000/api/user-management/department-users?role=student" \
  -b cookies.txt

# 5. Get all faculty in department
curl -X GET "http://localhost:8000/api/user-management/department-users?role=faculty" \
  -b cookies.txt
```

### Course Management and Enrollment

```bash
# 1. Sign in as department admin
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# 2. Create a course
curl -X POST http://localhost:8000/api/course/create \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "courseCode": "CSE101",
    "title": "Introduction to Programming",
    "semester": "1/1",
    "credits": 3,
    "capacity": 40
  }'

# 3. Bulk enroll students (use courseId from step 2)
curl -X POST http://localhost:8000/api/course/enroll/bulk \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "courseId": "course-uuid-here",
    "userIds": ["student-uuid-1", "student-uuid-2", "student-uuid-3"]
  }'

# 4. Enroll a faculty member as instructor
curl -X POST http://localhost:8000/api/course/enroll \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "courseId": "course-uuid-here",
    "userId": "faculty-uuid-here",
    "roleInCourse": "instructor"
  }'

# 5. Get all enrollments for a course
curl -X GET "http://localhost:8000/api/course/{courseId}/enrollments" \
  -H "Content-Type: application/json" \
  -b cookies.txt

# 6. Get only student enrollments
curl -X GET "http://localhost:8000/api/course/{courseId}/enrollments?roleInCourse=student" \
  -H "Content-Type: application/json" \
  -b cookies.txt

# 7. Get courses for a specific user
curl -X GET "http://localhost:8000/api/course/user/{userId}/courses" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Course Resource Management

```bash
# 1. Login as faculty member
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "michael.j@example.com",
    "password": "michael3856"
  }'

# 2. Upload a PDF resource
curl -X POST http://localhost:8000/api/course-resource/upload \
  -b cookies.txt \
  -F "files=@/path/to/lecture1.pdf" \
  -F "courseId=course-uuid-here" \
  -F "title=Lecture 1 - Introduction to Programming" \
  -F "description=First lecture covering basic concepts" \
  -F "resourceType=pdf"

# 3. Upload an image resource
curl -X POST http://localhost:8000/api/course-resource/upload \
  -b cookies.txt \
  -F "files=@/path/to/diagram.png" \
  -F "courseId=course-uuid-here" \
  -F "title=Data Structure Diagram" \
  -F "resourceType=image"

# 4. Add a link resource (no file upload)
curl -X POST http://localhost:8000/api/course-resource/upload \
  -b cookies.txt \
  -F "courseId=course-uuid-here" \
  -F "title=Online Tutorial" \
  -F "description=External learning resource" \
  -F "resourceType=link" \
  -F "fileUrl=https://example.com/tutorial"

# 5. Get all resources for a course
curl -X GET "http://localhost:8000/api/course-resource/course-uuid-here" \
  -H "Content-Type: application/json" \
  -b cookies.txt

# 6. Delete a resource
curl -X DELETE "http://localhost:8000/api/course-resource/delete/resource-uuid-here" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

---

## Error Handling

All errors follow the same response format:

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Error description",
  "data": null
}
```

**Common HTTP Status Codes:**

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (authentication required or invalid token)
- `404`: Not Found
- `409`: Conflict (duplicate entry)
- `500`: Internal Server Error
