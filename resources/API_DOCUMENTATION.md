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
7. [Project Endpoints](#project-endpoints)
8. [Research Endpoints](#research-endpoints)
9. [Milestone Endpoints](#milestone-endpoints)
10. [Task Endpoints](#task-endpoints)
11. [Meeting Endpoints](#meeting-endpoints)
12. [Blockchain Proof Endpoints](#blockchain-proof-endpoints)
13. [AI Assistant Endpoints](#ai-assistant-endpoints)
14. [Achievement Endpoints](#achievement-endpoints)
15. [Showcase Endpoints](#showcase-endpoints)
16. [Competition Endpoints](#competition-endpoints)
17. [Higher Study Endpoints](#higher-study-endpoints)
18. [Job Posting Endpoints](#job-posting-endpoints)

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

## Project Endpoints

These endpoints manage semester projects for courses.

**Authentication Required**: Yes (all endpoints)

### 1. Create Project

**POST** `/project/create`

Creates a new project for a course.

**Request Body:**

```json
{
  "courseId": "uuid-v4-string",
  "title": "AI-Powered Student Management System",
  "description": "A comprehensive system to manage student records, attendance, and performance using AI",
  "semester": "Fall 2024"
}
```

**Fields:**

- `courseId` (required): UUID of the course
- `title` (required): Project title
- `description` (optional): Project description
- `semester` (required): Semester name

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Project created successfully",
  "data": {
    "projectId": "uuid-v4-string",
    "courseId": "uuid-v4-string",
    "title": "AI-Powered Student Management System",
    "description": "A comprehensive system to manage student records...",
    "semester": "Fall 2024",
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": null
  }
}
```

---

### 2. Get Course Projects

**GET** `/project/course/:courseId`

Retrieves all projects for a specific course.

**URL Parameters:**

- `courseId`: UUID of the course

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Projects retrieved successfully",
  "data": [
    {
      "projectId": "uuid-v4-string",
      "courseId": "uuid-v4-string",
      "title": "AI-Powered Student Management System",
      "description": "A comprehensive system...",
      "semester": "Fall 2024",
      "createdAt": "2025-11-02T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Project by ID

**GET** `/project/:projectId`

Retrieves a specific project by its ID.

**URL Parameters:**

- `projectId`: UUID of the project

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Project retrieved successfully",
  "data": {
    "projectId": "uuid-v4-string",
    "courseId": "uuid-v4-string",
    "title": "AI-Powered Student Management System",
    "description": "A comprehensive system...",
    "semester": "Fall 2024",
    "createdAt": "2025-11-02T10:30:00.000Z",
    "updatedAt": null
  }
}
```

---

## Research Endpoints

These endpoints manage research projects for courses.

**Authentication Required**: Yes (all endpoints)

### 1. Create Research

**POST** `/research/create`

Creates a new research project for a course.

**Request Body:**

```json
{
  "courseId": "uuid-v4-string",
  "title": "Deep Learning Applications in Natural Language Processing",
  "description": "Research on novel attention mechanisms for NLP tasks",
  "semester": "Fall 2024"
}
```

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Research created successfully",
  "data": {
    "researchId": "uuid-v4-string",
    "courseId": "uuid-v4-string",
    "title": "Deep Learning Applications in Natural Language Processing",
    "description": "Research on novel attention mechanisms...",
    "semester": "Fall 2024",
    "createdAt": "2025-11-02T10:30:00.000Z"
  }
}
```

---

### 2. Get Course Research

**GET** `/research/course/:courseId`

Retrieves all research projects for a specific course.

**URL Parameters:**

- `courseId`: UUID of the course

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Research projects retrieved successfully",
  "data": [
    {
      "researchId": "uuid-v4-string",
      "courseId": "uuid-v4-string",
      "title": "Deep Learning Applications in NLP",
      "description": "Research on novel attention mechanisms...",
      "semester": "Fall 2024",
      "createdAt": "2025-11-02T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Research by ID

**GET** `/research/:researchId`

Retrieves a specific research project by its ID.

**URL Parameters:**

- `researchId`: UUID of the research project

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Research retrieved successfully",
  "data": {
    "researchId": "uuid-v4-string",
    "courseId": "uuid-v4-string",
    "title": "Deep Learning Applications in NLP",
    "description": "Research on novel attention mechanisms...",
    "semester": "Fall 2024",
    "createdAt": "2025-11-02T10:30:00.000Z"
  }
}
```

---

## Milestone Endpoints

These endpoints manage milestones for projects and research.

**Authentication Required**: Yes (all endpoints)

### 1. Create Milestone

**POST** `/milestone/create`

Creates a new milestone for a project or research.

**Request Body:**

```json
{
  "projectId": "uuid-v4-string",
  "researchId": null,
  "title": "Database Design & Implementation",
  "description": "Design and implement the complete database schema",
  "status": "not_started",
  "startDate": "2024-10-01",
  "deadline": "2024-10-30"
}
```

**Fields:**

- `projectId` (optional): UUID of the project (required if researchId is null)
- `researchId` (optional): UUID of the research (required if projectId is null)
- `title` (required): Milestone title
- `description` (optional): Milestone description
- `status` (required): Status (not_started, in_progress, ready_for_review, approved, rejected)
- `startDate` (optional): Start date
- `deadline` (optional): Deadline date

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Milestone created successfully",
  "data": {
    "milestoneId": "uuid-v4-string",
    "projectId": "uuid-v4-string",
    "title": "Database Design & Implementation",
    "description": "Design and implement the complete database schema",
    "status": "not_started",
    "startDate": "2024-10-01",
    "deadline": "2024-10-30",
    "createdAt": "2025-11-02T10:30:00.000Z"
  }
}
```

---

### 2. Get Milestone by ID

**GET** `/milestone/:milestoneId`

Retrieves a specific milestone with its tasks and meetings.

**URL Parameters:**

- `milestoneId`: UUID of the milestone

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Milestone retrieved successfully",
  "data": {
    "milestoneId": "uuid-v4-string",
    "projectId": "uuid-v4-string",
    "title": "Database Design & Implementation",
    "description": "Design and implement the complete database schema",
    "status": "in_progress",
    "startDate": "2024-10-01",
    "deadline": "2024-10-30",
    "proofHash": "0x1234...abcd",
    "blockchainTxId": "0xabc123...xyz789",
    "approvedAt": null,
    "approvedBy": null,
    "createdAt": "2025-11-02T10:30:00.000Z",
    "tasks": [],
    "meetings": []
  }
}
```

---

### 3. Update Milestone Status

**PUT** `/milestone/:milestoneId/status`

Updates the status of a milestone and generates blockchain proof if approved.

**Request Body:**

```json
{
  "status": "approved",
  "reviewComments": "Milestone completed successfully with all requirements met"
}
```

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Milestone status updated successfully",
  "data": {
    "milestoneId": "uuid-v4-string",
    "status": "approved",
    "proofHash": "0x1234...abcd",
    "blockchainTxId": "0xabc123...xyz789",
    "approvedAt": "2025-11-02T10:30:00.000Z",
    "approvedBy": "uuid-v4-string"
  }
}
```

---

## Task Endpoints

These endpoints manage tasks within milestones.

**Authentication Required**: Yes (all endpoints)

### 1. Create Task

**POST** `/task/create`

Creates a new task within a milestone.

**Request Body:**

```json
{
  "milestoneId": "uuid-v4-string",
  "title": "Database Schema Design",
  "description": "Design the complete database schema for the application",
  "details": "Create ER diagrams, define tables, relationships, and constraints",
  "assignedTo": "uuid-v4-string",
  "dueDate": "2024-10-15"
}
```

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Task created successfully",
  "data": {
    "taskId": "uuid-v4-string",
    "milestoneId": "uuid-v4-string",
    "title": "Database Schema Design",
    "description": "Design the complete database schema for the application",
    "details": "Create ER diagrams, define tables, relationships, and constraints",
    "status": "pending",
    "assignedTo": "uuid-v4-string",
    "dueDate": "2024-10-15",
    "createdAt": "2025-11-02T10:30:00.000Z"
  }
}
```

---

### 2. Submit Task

**POST** `/task/:taskId/submit`

Submits a completed task with blockchain proof generation.

**Request Body:**

```json
{
  "submissionDetails": "Completed database schema with 12 tables and all relationships defined",
  "submissionUrl": "https://github.com/project/schema-design",
  "files": ["file1.sql", "file2.pdf"]
}
```

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Task submitted successfully with blockchain proof",
  "data": {
    "taskId": "uuid-v4-string",
    "status": "submitted",
    "submittedAt": "2025-11-02T10:30:00.000Z",
    "submissionHash": "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    "submissionTxId": "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
    "fileHash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
}
```

---

### 3. Review Task

**POST** `/task/:taskId/review`

Reviews a submitted task and approves or rejects it.

**Request Body:**

```json
{
  "approved": true,
  "reviewComments": "Excellent work! Schema is well-designed and meets all requirements."
}
```

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Task reviewed successfully",
  "data": {
    "taskId": "uuid-v4-string",
    "status": "approved",
    "reviewedAt": "2025-11-02T10:30:00.000Z",
    "reviewedBy": "uuid-v4-string",
    "reviewComments": "Excellent work! Schema is well-designed and meets all requirements.",
    "completedAt": "2025-11-02T10:30:00.000Z"
  }
}
```

---

### 4. Get Task by ID

**GET** `/task/:taskId`

Retrieves detailed information about a specific task.

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Task retrieved successfully",
  "data": {
    "taskId": "uuid-v4-string",
    "milestoneId": "uuid-v4-string",
    "title": "Database Schema Design",
    "description": "Design the complete database schema",
    "status": "approved",
    "submissionHash": "0x7f83...",
    "submissionTxId": "0x1a2b...",
    "blockchainProof": {
      "verified": true,
      "timestamp": "2025-11-02T10:30:00.000Z"
    }
  }
}
```

---

## Meeting Endpoints

These endpoints manage milestone meetings and AI-generated summaries.

**Authentication Required**: Yes (all endpoints)

### 1. Schedule Meeting

**POST** `/meeting/schedule`

Schedules a new meeting for a milestone.

**Request Body:**

```json
{
  "milestoneId": "uuid-v4-string",
  "title": "Sprint Planning Meeting",
  "description": "Plan tasks and discuss milestone progress",
  "scheduledAt": "2024-10-15T14:00:00.000Z",
  "duration": 60,
  "meetingUrl": "https://zoom.us/j/123456789",
  "attendees": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Meeting scheduled successfully",
  "data": {
    "meetingId": "uuid-v4-string",
    "milestoneId": "uuid-v4-string",
    "title": "Sprint Planning Meeting",
    "scheduledAt": "2024-10-15T14:00:00.000Z",
    "duration": 60,
    "status": "scheduled",
    "createdAt": "2025-11-02T10:30:00.000Z"
  }
}
```

---

### 2. Generate AI Meeting Summary

**POST** `/meeting/:meetingId/ai-summary`

Generates an AI-powered summary with action items from meeting notes.

**Request Body:**

```json
{
  "notes": "Discussion about database design progress, identified performance bottlenecks, assigned optimization tasks to team members",
  "duration": 45
}
```

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "AI summary generated successfully",
  "data": {
    "meetingId": "uuid-v4-string",
    "aiSummary": "Team discussed database optimization strategies. Key focus on indexing and query performance improvements.",
    "actionItems": [
      "Review current database indexes - Due: Oct 20",
      "Implement query optimization - Assigned: John Doe",
      "Performance testing - Due: Oct 25"
    ],
    "keyTopics": [
      "Database Performance",
      "Query Optimization",
      "Indexing Strategy"
    ],
    "generatedAt": "2025-11-02T10:30:00.000Z"
  }
}
```

---

### 3. Get Meeting by ID

**GET** `/meeting/:meetingId`

Retrieves detailed information about a meeting.

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Meeting retrieved successfully",
  "data": {
    "meetingId": "uuid-v4-string",
    "milestoneId": "uuid-v4-string",
    "title": "Sprint Planning Meeting",
    "description": "Plan tasks and discuss milestone progress",
    "scheduledAt": "2024-10-15T14:00:00.000Z",
    "duration": 60,
    "status": "completed",
    "notes": "Discussion about progress and next steps",
    "aiSummary": "Team made good progress on milestone objectives",
    "actionItems": ["Task 1", "Task 2"],
    "attendees": ["uuid-1", "uuid-2"]
  }
}
```

---

## Blockchain Proof Endpoints

These endpoints manage blockchain-based proof generation and verification.

**Authentication Required**: Yes (all endpoints)

### 1. Generate Blockchain Proof

**POST** `/blockchain/generate-proof`

Generates a blockchain proof for task submissions or milestone approvals.

**Request Body:**

```json
{
  "type": "task_submission",
  "entityId": "uuid-v4-string",
  "data": {
    "taskId": "uuid-v4-string",
    "submissionDetails": "Task completed successfully",
    "submissionUrl": "https://github.com/project/task",
    "fileHashes": ["sha256:abc123...", "sha256:def456..."]
  }
}
```

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Blockchain proof generated successfully",
  "data": {
    "proofId": "uuid-v4-string",
    "proofHash": "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    "transactionId": "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
    "blockNumber": 18234567,
    "timestamp": "2025-11-02T10:30:00.000Z",
    "verified": true
  }
}
```

---

### 2. Verify Blockchain Proof

**GET** `/blockchain/verify/:proofHash`

Verifies the authenticity of a blockchain proof.

**URL Parameters:**

- `proofHash`: The blockchain proof hash to verify

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Proof verification completed",
  "data": {
    "proofHash": "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    "isValid": true,
    "transactionId": "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
    "blockNumber": 18234567,
    "timestamp": "2025-11-02T10:30:00.000Z",
    "confirmations": 847,
    "networkStatus": "confirmed"
  }
}
```

---

### 3. Get Proof History

**GET** `/blockchain/proof-history/:entityId`

Retrieves the complete blockchain proof history for a task or milestone.

**URL Parameters:**

- `entityId`: UUID of the task or milestone

**Query Parameters:**

- `type` (optional): Filter by proof type (task_submission, milestone_approval)

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Proof history retrieved successfully",
  "data": {
    "entityId": "uuid-v4-string",
    "proofs": [
      {
        "proofId": "uuid-v4-string",
        "type": "task_submission",
        "proofHash": "0x7f83...",
        "transactionId": "0x1a2b...",
        "timestamp": "2025-11-02T10:30:00.000Z",
        "verified": true
      }
    ],
    "totalProofs": 1
  }
}
```

---

## AI Assistant Endpoints

These endpoints provide AI-powered chat assistance for projects and research.

**Authentication Required**: Yes (all endpoints)

### 1. Research Assistant Chat (Simple)

**POST** `/ai/research-assistant/chat`

Send a message to the research assistant and get a simple response.

**Request Body:**

```json
{
  "message": "How do I design a novel attention mechanism?",
  "context": {
    "researchId": "uuid-v4-string",
    "researchTitle": "Deep Learning in NLP"
  }
}
```

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Response generated successfully",
  "data": {
    "response": "To design a novel attention mechanism, consider...",
    "timestamp": "2025-11-02T10:30:00.000Z"
  }
}
```

---

### 2. Research Assistant Chat (Streaming)

**POST** `/ai/research-assistant/chat-stream`

Send a message to the research assistant and get a streaming response.

**Request Body:**

```json
{
  "message": "Explain transformer architecture",
  "context": {
    "researchId": "uuid-v4-string"
  }
}
```

**Response**: Server-Sent Events (SSE) stream

---

### 3. Project Assistant Chat

**POST** `/ai/project-assistant/chat`

Send a message to the project assistant and get a response.

**Request Body:**

```json
{
  "message": "How should I structure my database schema?",
  "context": {
    "projectId": "uuid-v4-string",
    "projectTitle": "Student Management System"
  }
}
```

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Response generated successfully",
  "data": {
    "response": "For a student management system, consider...",
    "timestamp": "2025-11-02T10:30:00.000Z"
  }
}
```

---

### 4. Project Assistant Chat (Streaming)

**POST** `/ai/project-assistant/chat-stream`

Send a message to the project assistant and get a streaming response.

**Request Body:**

```json
{
  "message": "Suggest API endpoints for my system",
  "context": {
    "projectId": "uuid-v4-string"
  }
}
```

**Response**: Server-Sent Events (SSE) stream

---

## Achievement Endpoints

These endpoints manage student achievements, awards, and accomplishments.

### 1. Create Achievement

**POST** `/achievement`

Creates a new achievement entry.

**Authentication Required**: Yes

**Request Body:**

```json
{
  "userId": "uuid-v4-string",
  "title": "Best Paper Award",
  "description": "Received best paper award at International Conference on AI",
  "category": "award",
  "date": "2024-06-15",
  "organization": "ICAI 2024",
  "certificateUrl": "https://example.com/certificate.pdf",
  "metadata": {
    "conference": "ICAI 2024",
    "location": "San Francisco"
  }
}
```

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Achievement created successfully",
  "data": {
    "achievementId": "uuid-v4-string",
    "userId": "uuid-v4-string",
    "title": "Best Paper Award",
    "description": "Received best paper award...",
    "category": "award",
    "date": "2024-06-15",
    "organization": "ICAI 2024",
    "certificateUrl": "https://example.com/certificate.pdf",
    "metadata": { "conference": "ICAI 2024" },
    "createdAt": "2025-11-02T10:30:00.000Z"
  }
}
```

---

### 2. List Achievements

**GET** `/achievement?userId=uuid&category=award`

Retrieves all achievements with optional filters.

**Authentication Required**: No

**Query Parameters:**

- `userId` (optional): Filter by user ID
- `category` (optional): Filter by category (award, publication, competition, certification, etc.)

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Achievements retrieved successfully",
  "data": [
    {
      "achievementId": "uuid-v4-string",
      "userId": "uuid-v4-string",
      "title": "Best Paper Award",
      "category": "award",
      "date": "2024-06-15",
      "organization": "ICAI 2024"
    }
  ]
}
```

---

### 3. Get Achievement by ID

**GET** `/achievement/:achievementId`

Retrieves a specific achievement by its ID.

**Authentication Required**: No

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Achievement retrieved successfully",
  "data": {
    "achievementId": "uuid-v4-string",
    "userId": "uuid-v4-string",
    "title": "Best Paper Award",
    "description": "Received best paper award...",
    "category": "award",
    "date": "2024-06-15",
    "createdAt": "2025-11-02T10:30:00.000Z"
  }
}
```

---

### 4. Update Achievement

**PUT** `/achievement/:achievementId`

Updates an existing achievement.

**Authentication Required**: Yes

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Achievement updated successfully",
  "data": {}
}
```

---

### 5. Delete Achievement

**DELETE** `/achievement/:achievementId`

Deletes an achievement.

**Authentication Required**: Yes

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Achievement deleted successfully",
  "data": {}
}
```

---

### 6. Get Achievement Statistics

**GET** `/achievement/admin/stats`

Retrieves statistics about achievements.

**Authentication Required**: Yes

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Achievement statistics retrieved successfully",
  "data": {
    "totalAchievements": 150,
    "byCategory": {
      "award": 45,
      "publication": 60,
      "competition": 30,
      "certification": 15
    }
  }
}
```

---

## Showcase Endpoints

These endpoints manage department showcases to highlight projects, research, and achievements.

### 1. Create Showcase

**POST** `/showcase`

Creates a new showcase entry.

**Authentication Required**: Yes

**Request Body:**

```json
{
  "title": "AI Research Lab Achievements 2024",
  "description": "Showcasing groundbreaking research in AI and Machine Learning",
  "achievements": ["achievement-id-1", "achievement-id-2"],
  "tags": ["AI", "Machine Learning", "Research"],
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "featured": true,
  "metadata": {
    "year": "2024",
    "department": "Computer Science"
  }
}
```

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Showcase created successfully",
  "data": {
    "showcaseId": "uuid-v4-string",
    "title": "AI Research Lab Achievements 2024",
    "description": "Showcasing groundbreaking research...",
    "achievements": ["achievement-id-1", "achievement-id-2"],
    "tags": ["AI", "Machine Learning", "Research"],
    "thumbnailUrl": "https://example.com/thumbnail.jpg",
    "featured": true,
    "publishedAt": "2025-11-02T10:30:00.000Z",
    "createdAt": "2025-11-02T10:30:00.000Z"
  }
}
```

---

### 2. List Showcases

**GET** `/showcase?featured=true&tags=AI,ML`

Retrieves all showcases with optional filters.

**Authentication Required**: No

**Query Parameters:**

- `featured` (optional): Filter by featured status (true/false)
- `tags` (optional): Filter by tags (comma-separated)

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Showcases retrieved successfully",
  "data": [
    {
      "showcaseId": "uuid-v4-string",
      "title": "AI Research Lab Achievements 2024",
      "description": "Showcasing groundbreaking research...",
      "thumbnailUrl": "https://example.com/thumbnail.jpg",
      "featured": true,
      "publishedAt": "2025-11-02T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Showcase by ID

**GET** `/showcase/:showcaseId`

Retrieves a specific showcase by its ID.

**Authentication Required**: No

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Showcase retrieved successfully",
  "data": {
    "showcaseId": "uuid-v4-string",
    "title": "AI Research Lab Achievements 2024",
    "description": "Showcasing groundbreaking research...",
    "achievements": ["achievement-id-1", "achievement-id-2"],
    "tags": ["AI", "Machine Learning"],
    "featured": true,
    "createdAt": "2025-11-02T10:30:00.000Z"
  }
}
```

---

### 4. Update Showcase

**PUT** `/showcase/:showcaseId`

Updates an existing showcase.

**Authentication Required**: Yes

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Showcase updated successfully",
  "data": {}
}
```

---

### 5. Delete Showcase

**DELETE** `/showcase/:showcaseId`

Soft deletes a showcase.

**Authentication Required**: Yes

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Showcase deleted successfully",
  "data": {}
}
```

---

## Competition Endpoints

These endpoints manage competitions, hackathons, and contests.

### 1. Create Competition

**POST** `/competition`

Creates a new competition.

**Authentication Required**: Yes

**Request Body:**

```json
{
  "title": "AI Hackathon 2024",
  "description": "Build innovative AI solutions",
  "startDate": "2024-12-01",
  "endDate": "2024-12-03",
  "registrationDeadline": "2024-11-25",
  "venue": "Tech Hub, Building A",
  "maxParticipants": 100,
  "tags": ["AI", "Hackathon", "Innovation"],
  "prizes": {
    "first": "$5000",
    "second": "$3000",
    "third": "$1000"
  },
  "metadata": {
    "sponsors": ["Company A", "Company B"]
  }
}
```

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Competition created successfully",
  "data": {
    "competitionId": "uuid-v4-string",
    "title": "AI Hackathon 2024",
    "description": "Build innovative AI solutions",
    "startDate": "2024-12-01",
    "endDate": "2024-12-03",
    "registrationDeadline": "2024-11-25",
    "venue": "Tech Hub, Building A",
    "maxParticipants": 100,
    "currentParticipants": 0,
    "status": "upcoming",
    "createdAt": "2025-11-02T10:30:00.000Z"
  }
}
```

---

### 2. List Competitions

**GET** `/competition?status=upcoming&tags=AI`

Retrieves all competitions with optional filters.

**Authentication Required**: No

**Query Parameters:**

- `status` (optional): Filter by status (upcoming, ongoing, completed)
- `tags` (optional): Filter by tags (comma-separated)

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Competitions retrieved successfully",
  "data": [
    {
      "competitionId": "uuid-v4-string",
      "title": "AI Hackathon 2024",
      "startDate": "2024-12-01",
      "endDate": "2024-12-03",
      "status": "upcoming",
      "currentParticipants": 45,
      "maxParticipants": 100
    }
  ]
}
```

---

### 3. Get Competition by ID

**GET** `/competition/:competitionId`

Retrieves detailed information about a competition.

**Authentication Required**: No

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Competition retrieved successfully",
  "data": {
    "competitionId": "uuid-v4-string",
    "title": "AI Hackathon 2024",
    "description": "Build innovative AI solutions",
    "startDate": "2024-12-01",
    "endDate": "2024-12-03",
    "venue": "Tech Hub, Building A",
    "prizes": { "first": "$5000" },
    "createdAt": "2025-11-02T10:30:00.000Z"
  }
}
```

---

### 4. Update Competition

**PUT** `/competition/:competitionId`

Updates an existing competition.

**Authentication Required**: Yes

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Competition updated successfully",
  "data": {}
}
```

---

### 5. Delete Competition

**DELETE** `/competition/:competitionId`

Deletes a competition.

**Authentication Required**: Yes

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Competition deleted successfully",
  "data": {}
}
```

---

### 6. List Admin Competitions

**GET** `/competition/admin/list`

Retrieves all competitions with admin privileges (includes unpublished).

**Authentication Required**: Yes

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Admin competitions retrieved successfully",
  "data": []
}
```

---

### 7. Get Admin Competition Details

**GET** `/competition/admin/:competitionId`

Retrieves detailed competition information with admin privileges.

**Authentication Required**: Yes

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Competition details retrieved successfully",
  "data": {}
}
```

---

### 8. Get Competition Statistics

**GET** `/competition/admin/stats`

Retrieves statistics about competitions.

**Authentication Required**: Yes

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Competition statistics retrieved successfully",
  "data": {
    "totalCompetitions": 25,
    "upcoming": 5,
    "ongoing": 3,
    "completed": 17,
    "totalParticipants": 1250
  }
}
```

---

## Higher Study Endpoints

These endpoints manage higher study opportunities (Masters, PhD programs, scholarships).

### 1. Create Higher Study Entry

**POST** `/higher-study`

Creates a new higher study opportunity.

**Authentication Required**: Yes

**Request Body:**

```json
{
  "title": "PhD in Computer Science - Stanford University",
  "description": "Fully funded PhD program in AI and Machine Learning",
  "institution": "Stanford University",
  "country": "USA",
  "degree": "PhD",
  "field": "Computer Science",
  "applicationDeadline": "2025-01-15",
  "scholarshipAvailable": true,
  "websiteUrl": "https://cs.stanford.edu/phd",
  "requirements": {
    "gpa": "3.5+",
    "gre": "Required",
    "toefl": "100+"
  },
  "metadata": {
    "duration": "5 years",
    "funding": "Full funding"
  }
}
```

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Higher study entry created successfully",
  "data": {
    "higherStudyId": "uuid-v4-string",
    "title": "PhD in Computer Science - Stanford University",
    "institution": "Stanford University",
    "country": "USA",
    "degree": "PhD",
    "field": "Computer Science",
    "applicationDeadline": "2025-01-15",
    "scholarshipAvailable": true,
    "createdAt": "2025-11-02T10:30:00.000Z"
  }
}
```

---

### 2. List Higher Study Opportunities

**GET** `/higher-study?country=USA&degree=PhD&field=Computer Science`

Retrieves all higher study opportunities with optional filters.

**Authentication Required**: No

**Query Parameters:**

- `country` (optional): Filter by country
- `degree` (optional): Filter by degree (Masters, PhD)
- `field` (optional): Filter by field of study
- `scholarshipAvailable` (optional): Filter by scholarship availability (true/false)

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Higher study opportunities retrieved successfully",
  "data": [
    {
      "higherStudyId": "uuid-v4-string",
      "title": "PhD in Computer Science - Stanford",
      "institution": "Stanford University",
      "country": "USA",
      "degree": "PhD",
      "field": "Computer Science",
      "scholarshipAvailable": true,
      "applicationDeadline": "2025-01-15"
    }
  ]
}
```

---

### 3. Get Higher Study by ID

**GET** `/higher-study/:higherStudyId`

Retrieves detailed information about a higher study opportunity.

**Authentication Required**: No

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Higher study opportunity retrieved successfully",
  "data": {
    "higherStudyId": "uuid-v4-string",
    "title": "PhD in Computer Science - Stanford",
    "description": "Fully funded PhD program...",
    "institution": "Stanford University",
    "country": "USA",
    "websiteUrl": "https://cs.stanford.edu/phd",
    "requirements": { "gpa": "3.5+" },
    "createdAt": "2025-11-02T10:30:00.000Z"
  }
}
```

---

### 4. Update Higher Study Entry

**PUT** `/higher-study/:higherStudyId`

Updates an existing higher study opportunity.

**Authentication Required**: Yes

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Higher study entry updated successfully",
  "data": {}
}
```

---

### 5. Delete Higher Study Entry

**DELETE** `/higher-study/:higherStudyId`

Deletes a higher study opportunity.

**Authentication Required**: Yes

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Higher study entry deleted successfully",
  "data": {}
}
```

---

### 6. Get Higher Study Statistics

**GET** `/higher-study/admin/stats`

Retrieves statistics about higher study opportunities.

**Authentication Required**: Yes

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Higher study statistics retrieved successfully",
  "data": {
    "totalOpportunities": 150,
    "byDegree": {
      "Masters": 80,
      "PhD": 70
    },
    "byCountry": {
      "USA": 50,
      "UK": 30,
      "Canada": 25
    },
    "withScholarship": 95
  }
}
```

---

## Job Posting Endpoints

These endpoints manage job postings and career opportunities.

### 1. Create Job Posting

**POST** `/job`

Creates a new job posting.

**Authentication Required**: Yes

**Request Body:**

```json
{
  "title": "Senior Software Engineer",
  "company": "Tech Corp Inc.",
  "location": "San Francisco, CA",
  "jobType": "Full-time",
  "experience": "3-5 years",
  "salary": "$120,000 - $150,000",
  "description": "We are looking for an experienced software engineer...",
  "requirements": [
    "Bachelor's in CS",
    "5+ years experience",
    "Python, JavaScript"
  ],
  "applicationDeadline": "2024-12-31",
  "applicationUrl": "https://techcorp.com/careers/apply",
  "skills": ["Python", "JavaScript", "AWS", "Docker"],
  "metadata": {
    "benefits": ["Health insurance", "401k", "Remote work"],
    "remote": true
  }
}
```

**Response (201 Created):**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Job posting created successfully",
  "data": {
    "jobId": "uuid-v4-string",
    "title": "Senior Software Engineer",
    "company": "Tech Corp Inc.",
    "location": "San Francisco, CA",
    "jobType": "Full-time",
    "experience": "3-5 years",
    "salary": "$120,000 - $150,000",
    "applicationDeadline": "2024-12-31",
    "createdAt": "2025-11-02T10:30:00.000Z"
  }
}
```

---

### 2. List Job Postings

**GET** `/job?jobType=Full-time&location=San Francisco&skills=Python,AWS`

Retrieves all job postings with optional filters.

**Authentication Required**: No

**Query Parameters:**

- `jobType` (optional): Filter by job type (Full-time, Part-time, Internship, Contract)
- `location` (optional): Filter by location
- `company` (optional): Filter by company name
- `skills` (optional): Filter by required skills (comma-separated)
- `experience` (optional): Filter by experience level

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Job postings retrieved successfully",
  "data": [
    {
      "jobId": "uuid-v4-string",
      "title": "Senior Software Engineer",
      "company": "Tech Corp Inc.",
      "location": "San Francisco, CA",
      "jobType": "Full-time",
      "salary": "$120,000 - $150,000",
      "applicationDeadline": "2024-12-31",
      "skills": ["Python", "JavaScript", "AWS"]
    }
  ]
}
```

---

### 3. Get Job by ID

**GET** `/job/:jobId`

Retrieves detailed information about a job posting.

**Authentication Required**: No

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Job posting retrieved successfully",
  "data": {
    "jobId": "uuid-v4-string",
    "title": "Senior Software Engineer",
    "company": "Tech Corp Inc.",
    "location": "San Francisco, CA",
    "description": "We are looking for...",
    "requirements": ["Bachelor's in CS", "5+ years experience"],
    "applicationUrl": "https://techcorp.com/careers/apply",
    "skills": ["Python", "JavaScript", "AWS"],
    "createdAt": "2025-11-02T10:30:00.000Z"
  }
}
```

---

### 4. Update Job Posting

**PUT** `/job/:jobId`

Updates an existing job posting.

**Authentication Required**: Yes

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Job posting updated successfully",
  "data": {}
}
```

---

### 5. Delete Job Posting

**DELETE** `/job/:jobId`

Deletes a job posting.

**Authentication Required**: Yes

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Job posting deleted successfully",
  "data": {}
}
```

---

### 6. Get Job Statistics

**GET** `/job/admin/stats`

Retrieves statistics about job postings.

**Authentication Required**: Yes

**Response (200 OK):**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Job statistics retrieved successfully",
  "data": {
    "totalJobs": 250,
    "byJobType": {
      "Full-time": 150,
      "Part-time": 50,
      "Internship": 30,
      "Contract": 20
    },
    "activeJobs": 180,
    "expiredJobs": 70
  }
}
```

```

```
