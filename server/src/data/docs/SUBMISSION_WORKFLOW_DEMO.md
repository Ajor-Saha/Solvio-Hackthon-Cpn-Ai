# Task Submission Workflow - User Demo Guide

## 🎬 Step-by-Step Demo

### Scenario

**Student**: Sarah Johnson
**Course**: CSE450 - Software Engineering
**Project**: E-Commerce Platform
**Milestone**: Backend API Development
**Task**: Implement User Authentication API

---

## 📱 User Interface Walkthrough

### Step 1: Navigate to Milestone Page

```
Path: Course → Projects Tab → Project → Milestone
URL: /semester/4/1/project/[projectId]/milestone/[milestoneId]
```

**What You See**:

- Milestone title and details at top
- List of tasks below
- Each task shows:
  - Title and description
  - Status badge (Pending, In Progress, Submitted, Approved, Rejected)
  - Due date
  - Assigned student
  - Action buttons based on status

**Task Card Example**:

```
┌─────────────────────────────────────────────────────┐
│ 📋 Implement User Authentication API                │
│ Status: In Progress  📅 Due: Jan 15, 2025          │
│ Assigned to: Sarah Johnson                          │
│                                                      │
│ Create REST API endpoints for user authentication   │
│ including login, register, and token refresh        │
│                                                      │
│ [▶ Start Task]  [📤 Submit Task]                   │
└─────────────────────────────────────────────────────┘
```

---

### Step 2: Click "Submit Task" Button

**Button Location**: Bottom right of task card
**Button Style**: Purple background with upload icon

**What Happens**:

- Dialog opens (768px wide, centered)
- Form loads with empty fields
- Upload zone is ready

---

### Step 3: Fill in Submission Details

**Dialog Title**: "Submit Task: Implement User Authentication API"

#### Field 1: Submission Details ⭐ REQUIRED

```
Label: 📝 Submission Details *
Minimum: 50 characters
Current: 0 characters (shown in real-time)

Example Input:
─────────────────────────────────────────────────────
I have successfully implemented the User Authentication
API with the following features:

✅ User Registration Endpoint (/api/auth/register)
   - Email validation
   - Password hashing with bcrypt
   - Duplicate email check

✅ User Login Endpoint (/api/auth/login)
   - Email/password authentication
   - JWT token generation
   - Refresh token support

✅ Token Refresh Endpoint (/api/auth/refresh)
   - Validates refresh token
   - Issues new access token

Challenges Faced:
- Initial issue with JWT expiry configuration
- Resolved by implementing proper token rotation

Testing:
- Unit tests: 15/15 passing
- Integration tests: 8/8 passing
- Postman collection attached
─────────────────────────────────────────────────────
Character Count: 487 characters ✅
```

---

#### Field 2: External URL (Optional)

```
Label: 🔗 External URL (Optional)
Type: URL input

Example Input:
https://github.com/sarahjohnson/ecommerce-backend/tree/feature/auth

Purpose: Link to GitHub branch, PR, or Google Drive
```

---

### Step 4: Upload Files

#### Upload Zone

```
┌───────────────────────────────────────────────┐
│                                                │
│            ╔════════════════╗                 │
│            ║   📤 Upload    ║                 │
│            ╚════════════════╝                 │
│                                                │
│     Click to upload or drag and drop          │
│                                                │
│   PDF, DOC, Images, or ZIP (Max 10MB per file)│
│                                                │
└───────────────────────────────────────────────┘
```

**Supported File Types**:

- 📄 PDF: Documentation, reports
- 📝 DOC/DOCX: Written reports
- 🖼️ PNG/JPG/JPEG: Screenshots, diagrams
- 📦 ZIP: Code archives, multiple files
- 📃 TXT: Plain text documentation

#### File Selection Methods

1. **Click Upload Zone** → File picker opens
2. **Drag Files** → Drop onto zone (future enhancement)

---

### Step 5: Review Selected Files

**Files Appear Below Upload Zone**:

```
Selected Files (3)
┌─────────────────────────────────────────────────┐
│ 📤 auth-api-documentation.pdf                   │
│ 142.58 KB                                       │
│ Hash: sha256:a7f3c9d2e4b8... (calculated)      │
│                                          [✖]    │
├─────────────────────────────────────────────────┤
│ 📤 postman-collection.json                      │
│ 28.42 KB                                        │
│ Hash: sha256:b3e8f1a9c7d4... (calculating...)  │
│                                          [✖]    │
├─────────────────────────────────────────────────┤
│ 📤 test-results-screenshot.png                  │
│ 215.67 KB                                       │
│ Hash: sha256:c9d4e2f7b8a3... (calculated)      │
│                                          [✖]    │
└─────────────────────────────────────────────────┘
```

**Features**:

- ✅ Animated entry (fade + slide up)
- ✅ File size display
- ✅ Real-time hash calculation
- ✅ Remove button (X) to delete file
- ✅ Scroll if more than 4-5 files

---

### Step 6: Review Blockchain Info

**Info Box (Purple Theme)**:

```
┌─────────────────────────────────────────────────┐
│ 🛡️ Blockchain Verification                      │
│                                                  │
│ Your submission will be cryptographically hashed│
│ and recorded on blockchain. This creates an     │
│ immutable proof of your work with timestamp     │
│ verification.                                    │
│                                                  │
│ Submission Hash:                                 │
│ ┌───────────────────────────────────────────┐   │
│ │ 0x7f8e9d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8│   │
│ └───────────────────────────────────────────┘   │
│ (Generated after submission)                     │
└─────────────────────────────────────────────────┘
```

---

### Step 7: Submit Task

#### Action Buttons

```
┌─────────────────────────────────────────────────┐
│                          [Cancel]  [Submit Task]│
└─────────────────────────────────────────────────┘
```

**Cancel Button**:

- Resets form (clears all fields)
- Removes selected files
- Closes dialog

**Submit Task Button**:

- Disabled if:
  - ❌ Less than 50 characters in details
  - ❌ Currently submitting
- Enabled when:
  - ✅ Details ≥ 50 characters
  - ✅ Not currently processing

---

### Step 8: Submission Processing

**Button Changes During Submission**:

```
Before: [📤 Submit Task]
During: [⏳ Submitting...] (spinning icon, disabled)
```

**Behind the Scenes** (2-3 seconds):

1. **Second 0.0-0.5**: Calculate file hashes (SHA-256)

   - `auth-api-documentation.pdf` → `sha256:a7f3c9d2e4b8...`
   - `postman-collection.json` → `sha256:b3e8f1a9c7d4...`
   - `test-results-screenshot.png` → `sha256:c9d4e2f7b8a3...`

2. **Second 0.5-1.0**: Create submission object

   ```json
   {
     "taskId": "task-uuid-123",
     "milestoneId": "milestone-uuid-456",
     "studentId": "user-uuid-789",
     "submittedAt": "2025-01-12T14:30:00.000Z",
     "submissionDetails": "I have successfully implemented...",
     "submissionUrl": "https://github.com/sarahjohnson/...",
     "files": [
       { "name": "auth-api-documentation.pdf", "hash": "sha256:..." },
       { "name": "postman-collection.json", "hash": "sha256:..." },
       { "name": "test-results-screenshot.png", "hash": "sha256:..." }
     ]
   }
   ```

3. **Second 1.0-1.5**: Calculate submission hash

   - Hash entire JSON object
   - Result: `0x7f8e9d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d2c3b4a5f6e7d8c9b0a1f2e`

4. **Second 1.5-3.5**: Simulate blockchain transaction (2s delay)

   - Generate TX ID: `0xa3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4`
   - "Write" to blockchain
   - Confirm transaction

5. **Second 3.5-4.0**: Update task status
   - Status: "in_progress" → "submitted"
   - Store all hashes and TX ID
   - Update UI

---

### Step 9: Success Dialog Appears

**Proof Receipt Dialog Opens**:

```
┌───────────────────────────────────────────────────────┐
│ ✅ Submission Successful!                              │
│                                                        │
│ Your task has been submitted with blockchain          │
│ verification. Download your proof receipt below.      │
├───────────────────────────────────────────────────────┤
│                                                        │
│                    ╔════════╗                          │
│                    ║   ✓    ║  (Bouncing animation)   │
│                    ║ Verified║                         │
│                    ╚════════╝                          │
│                                                        │
├───────────────────────────────────────────────────────┤
│ Task                                  [Submitted]      │
│ Implement User Authentication API                     │
│                                                        │
│ Student                                                │
│ Sarah Johnson                                          │
│                                                        │
│ Submitted At                                           │
│ January 12, 2025 at 2:30:00 PM                        │
├───────────────────────────────────────────────────────┤
│ 🛡️ Blockchain Verification                            │
│                                                        │
│ Submission Hash                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │ 0x7f8e9d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d2c│  │
│ │ 3b4a5f6e7d8c9b0a1f2e                            │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ Blockchain Transaction ID                              │
│ ┌──────────────────────────────────────────────────┐  │
│ │ 0xa3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4│  │
│ │ e5f6a7b8c9d0e1f2a3b4                            │  │
│ └──────────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────────┤
│ # File Hashes (3)                                      │
│ ┌──────────────────────────────────────────────────┐  │
│ │ auth-api-documentation.pdf                       │  │
│ │ sha256:a7f3c9d2e4b8f1a3c5d7e9f0b2a4c6d8e0f1a2...│  │
│ │                                                  │  │
│ │ postman-collection.json                          │  │
│ │ sha256:b3e8f1a9c7d4e2f6a8b0c1d3e5f7a9b1c3d5...  │  │
│ │                                                  │  │
│ │ test-results-screenshot.png                      │  │
│ │ sha256:c9d4e2f7b8a3c1d5e6f8a0b2c4d6e8f0a1b3...  │  │
│ └──────────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────────┤
│                      [🔗 Copy Verify Link]            │
│                      [📥 Download Proof]              │
└───────────────────────────────────────────────────────┘
```

---

### Step 10: Download Proof Receipt

**Click "Download Proof" Button**:

**Downloaded File**: `submission-proof-1736695800000.txt`

**File Contents**:

```
BLOCKCHAIN SUBMISSION PROOF
═══════════════════════════════════════

Task: Implement User Authentication API
Student: Sarah Johnson
Submitted: 1/12/2025, 2:30:00 PM

BLOCKCHAIN VERIFICATION
─────────────────────────────────────
Submission Hash: 0x7f8e9d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d2c3b4a5f6e7d8c9b0a1f2e
Transaction ID: 0xa3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4

FILES SUBMITTED (3)
─────────────────────────────────────
auth-api-documentation.pdf
Hash: sha256:a7f3c9d2e4b8f1a3c5d7e9f0b2a4c6d8e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5

postman-collection.json
Hash: sha256:b3e8f1a9c7d4e2f6a8b0c1d3e5f7a9b1c3d5e7f9a0b2c4d6e8f0a1b3c5d7e9f0

test-results-screenshot.png
Hash: sha256:c9d4e2f7b8a3c1d5e6f8a0b2c4d6e8f0a1b3c5d7e9f0a2b4c6d8e0f1a3b5c7d9

This is a cryptographically secure proof of submission.
Verify at: http://localhost:3000/verify/0xa3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4
```

**Toast Notification**: "Proof receipt downloaded! ✅"

---

### Step 11: Copy Verification Link

**Click "Copy Verify Link" Button**:

**Copied to Clipboard**:

```
http://localhost:3000/verify/0xa3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4
```

**Toast Notification**: "Verification link copied to clipboard! ✅"

**Use Case**: Share with instructor, include in documentation, verify later

---

### Step 12: View Updated Task Card

**Back to Milestone Page**:

```
┌─────────────────────────────────────────────────────┐
│ 📋 Implement User Authentication API                │
│ Status: Submitted  📅 Due: Jan 15, 2025            │
│ Submitted by: Sarah Johnson on Jan 12, 2025        │
│                                                      │
│ ✅ Submission verified on blockchain                │
│ 🔐 TX: 0xa3b4c5d6...e1f2a3b4                       │
│                                                      │
│ [📥 Download Certificate]  [👁️ View Details]       │
└─────────────────────────────────────────────────────┘
```

**Status Change**:

- ❌ Before: "In Progress" (blue badge)
- ✅ After: "Submitted" (green badge)

**New Buttons**:

- **Download Certificate**: Get blockchain proof
- **View Details**: See submission details

---

## 🎯 Key Features Demonstrated

### 1. **User-Friendly Form**

- ✅ Clear labels with icons
- ✅ Character counter for minimum requirement
- ✅ Helpful placeholders
- ✅ Optional fields clearly marked

### 2. **File Management**

- ✅ Multiple file upload
- ✅ Individual file removal
- ✅ Real-time hash calculation
- ✅ File size display

### 3. **Blockchain Integration**

- ✅ Submission hash (combined from all data)
- ✅ Individual file hashes
- ✅ Transaction ID generation
- ✅ Immutable timestamp

### 4. **Proof Receipt**

- ✅ Comprehensive verification document
- ✅ Downloadable in seconds
- ✅ Copy-to-clipboard for easy sharing
- ✅ Professional formatting

### 5. **Real-Time Feedback**

- ✅ Loading states during submission
- ✅ Success animations
- ✅ Toast notifications
- ✅ Immediate UI updates

---

## 🔍 Verification Process (Future)

**Public Verification Page** (Not yet implemented):

1. Student shares verification link
2. Anyone opens link: `/verify/{txId}`
3. Page displays:
   - Task title
   - Student name
   - Submission timestamp
   - Submission hash
   - File hashes
   - "Verified ✅" badge

**How to Verify Manually**:

1. Open proof receipt file
2. Note submission hash
3. Re-download submitted files
4. Recalculate hashes using SHA-256
5. Compare with hashes in proof
6. If match → Verified ✅

---

## 🎨 Visual Design

### Color Scheme

- **Purple**: Blockchain/verification elements (#7c3aed)
- **Green**: Success states (#16a34a)
- **Blue**: In-progress tasks (#3b82f6)
- **Red**: Rejected/error states (#dc2626)
- **Gray**: Secondary text/borders (#6b7280)

### Typography

- **Headings**: Bold, 1.5rem
- **Body**: Regular, 0.875rem
- **Monospace**: Hashes and TX IDs (Courier/Monaco)

### Spacing

- **Form Fields**: 1.5rem gap
- **Sections**: 1rem padding
- **Dialog**: 1rem padding, 768px max width

---

## 📱 Responsive Design

### Desktop (≥768px)

- Dialog: 768px wide
- 2-column layout for info boxes
- Full-width file list

### Tablet (≥640px, <768px)

- Dialog: 90% width
- Single column layout
- Stacked buttons

### Mobile (<640px)

- Dialog: Full width with padding
- Vertical button layout
- Scrollable dialogs

---

## 🚀 Performance

### Hash Calculation

- **Small files** (<1MB): < 100ms
- **Medium files** (1-5MB): 100-500ms
- **Large files** (5-10MB): 500ms-2s

### Submission Process

- **Total time**: 2-4 seconds
- **Breakdown**:
  - Hash calculation: Varies by file size
  - Submission hash: <50ms
  - Blockchain TX: 2s (mock delay)
  - UI update: <100ms

---

## 🎉 Success Criteria

✅ **Student Can**:

- Fill out submission form easily
- Upload multiple files
- See real-time hash calculation
- Submit with one click
- Download proof receipt
- Share verification link

✅ **Instructor Can**:

- See submitted tasks
- Download blockchain certificate
- Verify submission integrity
- Review with confidence

✅ **System Provides**:

- Cryptographic proof
- Immutable timestamp
- Tamper-evident records
- Professional documentation

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue 1: "Submit Task" button disabled**

- ✅ Check submission details (min 50 characters)
- ✅ Wait for hash calculation to complete

**Issue 2: File upload not working**

- ✅ Check file type (PDF, DOC, images, ZIP only)
- ✅ Check file size (max 10MB per file)

**Issue 3: Proof receipt not downloading**

- ✅ Check browser's download settings
- ✅ Allow pop-ups for this site

**Issue 4: Hashes taking long time**

- ✅ Large files take longer (expected)
- ✅ Wait for "calculated" to appear

---

## 🏆 Demo Complete!

You've successfully walked through the entire Task Submission Workflow. The system is now ready for:

- ✅ Student submissions
- ✅ Blockchain verification
- ✅ Proof generation
- ✅ Faculty review

**Next Steps**:

1. Test with real files
2. Share with team for feedback
3. Prepare for backend integration
4. Plan verification page implementation

**Enjoy the blockchain-powered submission experience! 🚀**
