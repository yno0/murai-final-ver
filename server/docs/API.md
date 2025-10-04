# Murai Server API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "OPTIONAL_ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "userId": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "userId": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt_token_here"
  }
}
```

#### GET /auth/me
Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "User data retrieved",
  "data": {
    "userId": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Groups

#### GET /groups/:groupId/members
Get all members of a group.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Group members retrieved",
  "data": [
    {
      "userId": "user_id",
      "email": "member@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "member",
      "joinedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /groups/:groupId/invite
Invite a user to join a group.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "role": "member"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "data": {
    "invitationId": "invitation_id",
    "email": "newmember@example.com",
    "expiresAt": "2024-01-08T00:00:00.000Z"
  }
}
```

### Extension Settings

#### GET /extension-settings
Get user's extension settings.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Settings retrieved successfully",
  "data": {
    "userId": "user_id",
    "profanityFilter": {
      "enabled": true,
      "strictMode": false,
      "customWords": ["word1", "word2"]
    },
    "contentBlocking": {
      "enabled": true,
      "categories": ["adult", "violence"]
    },
    "notifications": {
      "enabled": true,
      "email": true,
      "browser": false
    }
  }
}
```

#### PUT /extension-settings
Update user's extension settings.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "profanityFilter": {
    "enabled": true,
    "strictMode": true,
    "customWords": ["newword"]
  },
  "contentBlocking": {
    "enabled": false
  }
}
```

### Reports

#### POST /reports
Create a new content report.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "detectionId": "detection_id",
  "reason": "inappropriate_content",
  "details": "This content contains inappropriate material",
  "severity": "high",
  "reportSource": "extension"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report created successfully",
  "data": {
    "reportId": "report_id",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /reports
Get user's reports with pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status
- `severity` (optional): Filter by severity

**Response:**
```json
{
  "success": true,
  "message": "Reports retrieved successfully",
  "data": [
    {
      "reportId": "report_id",
      "reason": "inappropriate_content",
      "status": "resolved",
      "severity": "medium",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict |
| `RATE_LIMITED` | Too many requests |
| `SERVER_ERROR` | Internal server error |

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- **Default**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **File uploads**: 10 requests per hour per user

When rate limited, the API returns a 429 status code with retry information.

## CORS Policy

The API accepts requests from:
- Configured frontend origins
- Chrome extension contexts
- Whitelisted domains

## Security Headers

All responses include security headers:
- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`
