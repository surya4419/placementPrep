# Authentication System Guide

## Overview

The application now includes a complete authentication system with:
- ✅ User signup and login
- ✅ Secure password hashing (bcrypt)
- ✅ JWT-based authentication
- ✅ User-specific progress tracking
- ✅ Profile management
- ✅ Password reset functionality
- ✅ MongoDB data persistence

## Features

### 1. User Signup
- Name, email, and password required
- Password must be at least 6 characters
- Email uniqueness validation
- Passwords hashed with bcrypt (10 rounds)
- Automatic login after signup

### 2. User Login
- Email and password authentication
- 30-day JWT token expiration
- Token stored in HTTP-only cookies and localStorage
- Automatic session restoration on page refresh

### 3. Profile Management
- View user information (name, email)
- Password reset functionality
- Logout option

### 4. Password Reset
- Request reset link via email
- Token-based reset (1-hour expiration)
- Secure password update

### 5. User-Specific Data
- Each user has their own:
  - Practice attempts history
  - STAR stories bank
  - Progress tracking
  - Streak calculation
- Data isolated per user in MongoDB

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

#### POST `/api/auth/login`
Login to existing account

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

#### GET `/api/auth/me`
Get current user (requires authentication)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/auth/logout`
Logout current user

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### POST `/api/auth/forgot-password`
Request password reset

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "If an account exists, a reset link will be sent",
  "resetToken": "reset_token_here"
}
```

#### POST `/api/auth/reset-password`
Reset password with token

**Request:**
```json
{
  "resetToken": "reset_token_from_email",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

### User Data Endpoints (Protected)

All these endpoints require authentication via JWT token.

#### POST `/api/user/attempts`
Save a practice attempt

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "attempt": {
    "id": "attempt_id",
    "questionId": "question_id",
    "module": "communication",
    "rawText": "User response text...",
    "submittedAt": "2026-01-15T10:30:00Z",
    "evaluation": { ... }
  }
}
```

#### GET `/api/user/attempts`
Get all user's attempts

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "attempts": [
    {
      "id": "attempt_id",
      "userId": "user_id",
      "module": "communication",
      ...
    }
  ]
}
```

#### POST `/api/user/stories`
Save/update STAR story

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "story": {
    "id": "story_id",
    "questionId": "question_id",
    "competency": "Leadership",
    "situation": "...",
    "task": "...",
    "action": "...",
    "result": "...",
    "reflection": "...",
    "lastUpdated": "2026-01-15T10:30:00Z"
  }
}
```

#### GET `/api/user/stories`
Get all user's STAR stories

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "stories": [
    {
      "id": "story_id",
      "userId": "user_id",
      "competency": "Leadership",
      ...
    }
  ]
}
```

## Frontend Components

### Auth Component (`src/components/Auth.tsx`)
- Login/signup toggle tabs
- Form validation
- Error handling
- Password visibility toggle
- Forgot password flow

### Profile Component (`src/components/Profile.tsx`)
- User info display
- Password reset
- Logout functionality
- Modal interface

### App Integration
- Automatic authentication check on load
- Session restoration from localStorage
- Redirect to login if not authenticated
- User-specific data loading

## Security Features

### Password Security
- Bcrypt hashing with 10 rounds
- Minimum 6 character requirement
- No plain-text password storage

### Token Security
- HTTP-only cookies (prevents XSS)
- Secure flag in production (HTTPS only)
- SameSite strict policy (prevents CSRF)
- 30-day expiration
- Backup localStorage storage for client-side access

### API Security
- Authentication middleware for protected routes
- Token verification on each request
- User ID extraction from JWT
- Automatic token refresh on valid requests

## Data Flow

### Signup Flow:
1. User fills signup form
2. Frontend sends POST to `/api/auth/signup`
3. Backend validates and hashes password
4. User created in MongoDB
5. JWT token generated
6. Token sent in cookie and response
7. Frontend stores token in localStorage
8. User redirected to dashboard

### Login Flow:
1. User fills login form
2. Frontend sends POST to `/api/auth/login`
3. Backend validates credentials
4. Password compared with bcrypt
5. JWT token generated if valid
6. Token sent in cookie and response
7. Frontend stores token
8. User data loaded from database
9. Dashboard displayed

### Data Save Flow:
1. User completes practice attempt
2. Frontend sends POST to `/api/user/attempts`
3. Token validated by middleware
4. User ID extracted from token
5. Attempt saved with userId in MongoDB
6. Local state updated
7. Dashboard refreshed

## Environment Variables

Required for authentication:

```env
# MongoDB connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=interview_prep

# JWT secret for token signing
JWT_SECRET=your_secure_random_32_character_secret

# Node environment
NODE_ENV=production
```

## Database Schema

### users collection:
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, lowercase),
  password: String (bcrypt hashed),
  createdAt: ISO Date String,
  lastActive: ISO Date String,
  resetToken: String (optional),
  resetTokenExpiry: ISO Date String (optional)
}
```

### attempts collection:
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to users),
  id: String,
  questionId: String,
  module: String,
  rawText: String,
  code: String (optional),
  thinkAloudText: String (optional),
  submittedAt: ISO Date String,
  evaluation: Object,
  createdAt: ISO Date String
}
```

### stories collection:
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to users),
  id: String,
  competency: String,
  questionId: String,
  questionText: String,
  situation: String,
  task: String,
  action: String,
  result: String,
  reflection: String,
  lastUpdated: ISO Date String,
  updatedAt: ISO Date String
}
```

## Testing Authentication

### Local Testing:

1. Start MongoDB (Atlas or local)
2. Add environment variables to `.env`
3. Run `npm run dev`
4. Open http://localhost:3000
5. Try signup/login

### Production Testing:

1. Deploy to Render
2. Add environment variables in Render dashboard
3. Open deployed URL
4. Test signup/login flow
5. Verify data persistence

## Troubleshooting

### "Authentication required" error
- Check if token is valid
- Verify JWT_SECRET matches
- Ensure token hasn't expired
- Check browser cookies

### "User not found" error
- Verify MongoDB connection
- Check if user exists in database
- Ensure ObjectId format is correct

### Login fails with correct password
- Check if email is lowercase in database
- Verify bcrypt comparison
- Ensure password was hashed during signup

### Data not persisting
- Verify MongoDB connection
- Check authentication token
- Ensure API calls include Authorization header
- Check browser console for errors

## Future Enhancements

Potential additions:
- Email verification
- OAuth login (Google, GitHub)
- Two-factor authentication
- Rate limiting
- Session management dashboard
- Account deletion
- Data export
- Email notifications for password reset

## Support

For issues:
1. Check MongoDB connection
2. Verify environment variables
3. Check browser console logs
4. Review server logs
5. Test API endpoints with Postman
