# Murai Server

A Node.js/Express server for the Murai family safety platform, providing group management, extension settings, and content filtering APIs.

## 🏗️ Architecture

The server follows a clean, modular architecture with clear separation of concerns:

```
server/
├── app.js                 # Main application configuration
├── server.js             # Server startup
├── config/               # Configuration files
│   ├── app.js           # Express app setup
│   ├── cors.js          # CORS configuration
│   ├── passport.js      # Authentication strategies
│   ├── rateLimit.js     # Rate limiting config
│   └── session.js       # Session configuration
├── controllers/          # Business logic
│   ├── authController.js
│   ├── extensionSettingsController.js
│   ├── groupController.js
│   └── reportController.js
├── middleware/           # Custom middleware
│   ├── auth.js          # Authentication middleware
│   ├── requestLogger.js # Request logging
│   └── validation.js    # Input validation
├── models/              # Database schemas
│   ├── billingModel.js
│   ├── detectionModel.js
│   ├── extensionSettingsModel.js
│   ├── groupModel.js
│   ├── invitationModel.js
│   ├── report.js
│   └── userModel.js
├── routes/              # API route definitions
│   ├── auth.js
│   ├── email.js
│   ├── extensionSettings.js
│   ├── groups.js
│   └── reports.js
├── services/            # External services
│   └── emailService.js
└── utils/               # Utility functions
    ├── logger.js        # Logging utility
    └── response.js      # Standardized responses
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB 4.4+
- npm or yarn

### Installation

1. **Clone and navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   npm run setup  # Creates .env file with defaults
   ```

4. **Configure your .env file:**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/murai
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173
   
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=noreply@murai.com
   FROM_NAME=Murai
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   BACKEND_URL=http://localhost:5000
   ```

5. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### Groups
- `GET /api/groups/:groupId/members` - Get group members
- `POST /api/groups/:groupId/invite` - Invite member to group
- `POST /api/groups/accept-invitation` - Accept group invitation
- `PUT /api/groups/:groupId/members/:memberId/role` - Update member role
- `DELETE /api/groups/:groupId/members/:memberId` - Remove member
- `GET /api/groups/invitation/:token` - Get invitation details

### Extension Settings
- `GET /api/extension-settings` - Get user's extension settings
- `PUT /api/extension-settings` - Update extension settings
- `GET /api/extension-settings/sync` - Sync settings
- `POST /api/extension-settings/reset` - Reset to defaults
- `GET /api/extension-settings/group` - Get group settings (admin)
- `PUT /api/extension-settings/group` - Update group settings (admin)

### Reports
- `POST /api/reports` - Create new report
- `GET /api/reports` - Get user's reports
- `GET /api/reports/stats` - Get report statistics
- `GET /api/reports/:reportId` - Get specific report
- `PATCH /api/reports/:reportId/status` - Update report status
- `PATCH /api/reports/:reportId/resolve` - Resolve report

### System
- `GET /health` - Health check endpoint

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/murai` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

### CORS Configuration

The server is configured to allow requests from:
- Configured frontend URL
- Chrome extension origins
- Major social media platforms (for extension functionality)

### Security Features

- **Helmet.js** - Security headers
- **Rate limiting** - Prevents abuse
- **CORS protection** - Controlled cross-origin access
- **JWT authentication** - Secure API access
- **Input validation** - Prevents malicious input
- **Request logging** - Audit trail

## 📝 Logging

The server includes comprehensive logging:

- **Request logging** - All HTTP requests with timing
- **Error logging** - Detailed error information
- **Security logging** - Authentication and authorization events
- **Application logging** - Business logic events

Logs are written to:
- `logs/app.log` - All application logs
- `logs/error.log` - Error logs only
- `logs/access.log` - HTTP request logs
- `logs/security.log` - Security events
- `logs/debug.log` - Debug information (development only)

## 🧪 Development

### Scripts

```bash
npm run dev      # Start development server with auto-reload
npm start        # Start production server
npm run setup    # Create .env file with defaults
```

### Code Style

- ES6+ modules
- Async/await for asynchronous operations
- Consistent error handling with ResponseUtil
- Comprehensive logging with custom logger
- Input validation on all endpoints

### Adding New Features

1. **Create model** (if needed) in `models/`
2. **Create controller** in `controllers/`
3. **Add routes** in `routes/`
4. **Add validation** in `middleware/validation.js`
5. **Update documentation**

## 🔍 Monitoring

### Health Check

The `/health` endpoint provides:
- Server status
- Uptime information
- Memory usage
- Application version

### Logs

Monitor the application through log files or integrate with logging services like:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- DataDog
- New Relic

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change PORT in .env or kill existing process
   lsof -ti:5000 | xargs kill -9
   ```

2. **MongoDB connection failed**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env
   - Verify network connectivity

3. **Google OAuth errors**
   - Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
   - Verify callback URL in Google Console

4. **Email service errors**
   - Check SMTP credentials
   - Verify email provider settings
   - Test with email service provider

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your .env file.

## 📄 License

MIT License - see LICENSE file for details.
