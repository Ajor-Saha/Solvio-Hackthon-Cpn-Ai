# User Management Feature

This feature allows department administrators to add students and faculty members to their department, either individually or via CSV file upload.

## Features

- ✅ Add single student or faculty member
- ✅ Bulk upload via CSV file
- ✅ Auto-generated passwords for new users
- ✅ Department admin access control
- ✅ View all department users with optional role filtering
- ✅ Credentials returned for manual sharing

## API Endpoints

### 1. Add Single User

**POST** `/api/user-management/add-user`

Add a single student or faculty member.

**Authentication**: Required (Department Admin only)

**Request:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "student"
}
```

**Response:**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Student added successfully",
  "data": {
    "user": { ... },
    "credentials": {
      "email": "john.doe@example.com",
      "password": "john1234"
    }
  }
}
```

### 2. Add Multiple Users via CSV

**POST** `/api/user-management/add-users-csv`

Upload a CSV file to add multiple users at once.

**Authentication**: Required (Department Admin only)

**Request:**

- Content-Type: `multipart/form-data`
- Form field: `file` (CSV file)

**CSV Format:**

```csv
firstName,lastName,email,role
John,Doe,john.doe@example.com,student
Jane,Smith,jane.smith@example.com,faculty
```

**Response:**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Processed 2 users. 2 added successfully, 0 failed.",
  "data": {
    "summary": {
      "total": 2,
      "successful": 2,
      "failed": 0
    },
    "successfulUsers": [...],
    "failedUsers": []
  }
}
```

### 3. Get Department Users

**GET** `/api/user-management/department-users?role=student`

Get all users in the department, optionally filtered by role.

**Authentication**: Required (Department Admin only)

**Query Parameters:**

- `role` (optional): `student`, `faculty`, or `department_admin`

## Usage Examples

### Using cURL

#### 1. Login as Department Admin

```bash
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

#### 2. Add Single Student

```bash
curl -X POST http://localhost:8000/api/user-management/add-user \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "student"
  }'
```

#### 3. Upload CSV File

```bash
curl -X POST http://localhost:8000/api/user-management/add-users-csv \
  -b cookies.txt \
  -F "file=@sample-users.csv"
```

#### 4. Get All Students

```bash
curl -X GET "http://localhost:8000/api/user-management/department-users?role=student" \
  -b cookies.txt
```

## CSV File Format

### Required Columns:

- `firstName` - User's first name (required)
- `lastName` - User's last name (optional, can be empty)
- `email` - User's email address (required, must be unique)
- `role` - Either `student` or `faculty` (required)

### Sample CSV File:

See `sample-users.csv` in the server directory.

### CSV Rules:

1. First row must contain column headers
2. Email addresses must be unique
3. Role must be either `student` or `faculty`
4. Empty lines are automatically skipped
5. Duplicate emails will be skipped with error message

## Password Generation

Passwords are automatically generated using the pattern:

```
{firstName}{randomNumber}
```

Example: If firstName is "John", password might be "john1234"

**Important**: The department admin must manually share these credentials with each user.

## Access Control

- Only users with role `department_admin` can access these endpoints
- Department admins can only add users to their own department
- Users are automatically verified (no email verification required)

## Error Handling

### Single User Addition:

- `400`: Missing required fields or user already exists
- `403`: User is not a department admin
- `404`: Department not found
- `500`: Internal server error

### CSV Upload:

- Returns summary with successful and failed users
- Each failed user includes the reason for failure
- Possible reasons:
  - Missing required fields
  - Invalid role
  - User already exists
  - Processing error

## Security Features

1. **JWT Authentication**: All endpoints require valid JWT token
2. **Role-based Access**: Only department admins can access these endpoints
3. **Department Isolation**: Admins can only manage users in their department
4. **Password Hashing**: All passwords are hashed using bcrypt
5. **Auto-verification**: Users are pre-verified for immediate access

## Database Schema

Users are stored in the `tbl_user` table with the following key fields:

- `userId` - UUID primary key
- `firstName` - User's first name
- `lastName` - User's last name (nullable)
- `email` - Unique email address
- `password` - Bcrypt hashed password
- `role` - User role enum (student, faculty, department_admin)
- `departmentId` - Foreign key to department
- `isVerified` - Boolean (always true for admin-added users)
- `avatar` - Profile picture URL (nullable)
- `createdAt` - Timestamp
- `updatedAt` - Timestamp
- `deletedAt` - Soft delete timestamp (nullable)

## Best Practices

1. **Credential Management**:

   - Store returned credentials securely
   - Share credentials through secure channels
   - Encourage users to change passwords on first login

2. **CSV File Preparation**:

   - Use UTF-8 encoding
   - Validate emails before upload
   - Check for duplicates
   - Keep file size under 10MB

3. **Error Handling**:

   - Review failed users in CSV upload response
   - Fix issues and re-upload failed records
   - Log credential distribution

4. **User Communication**:
   - Inform users before adding them
   - Provide login instructions
   - Share support contact information

## Future Enhancements

Potential features for future versions:

- [ ] Email credentials to users automatically
- [ ] Bulk delete/deactivate users
- [ ] Import from other formats (Excel, JSON)
- [ ] Password reset by admin
- [ ] User role updates
- [ ] Export user list
- [ ] Activity logs
