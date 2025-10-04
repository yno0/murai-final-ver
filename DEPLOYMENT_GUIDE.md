# MURAI Web Single-Service Deployment Guide for Render

This guide will help you deploy both the frontend and backend of your MURAI application as **one single service** on Render. This is simpler, more cost-effective, and perfect for development/testing.

## Prerequisites

1. A Render account (free tier available)
2. Your code pushed to a GitHub repository
3. MongoDB Atlas account for database hosting

## Deployment Steps

### 1. Prepare Environment Variables

You only need to set up environment variables for **one service** since everything runs together:

#### Environment Variables (murai-web service):
- `NODE_ENV`: `production`
- `PORT`: `10000` (automatically set by Render)
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secure random string for JWT tokens
- `SESSION_SECRET`: A secure random string for sessions
- `SERVE_FRONTEND`: `true` (enables serving React app from Express server)

### 2. Deploy Using render.yaml (Recommended)

1. **Push the render.yaml file** to your repository root
2. **Connect your repository** to Render
3. **Create a new Blueprint** and select your repository
4. **Set environment variables** in the Render dashboard

### 3. Manual Deployment (Alternative)

If you prefer manual setup:

1. Create a new **Web Service** in Render
2. Connect your GitHub repository
3. Set the following:
   - **Build Command**: `npm install && npm run build && cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment**: Node
   - **Plan**: Free
4. Add all environment variables listed above
5. Deploy

**That's it!** Both frontend and backend will be served from the same URL.

### 4. Database Setup

1. **Create MongoDB Atlas cluster** (free tier available)
2. **Create database user** with read/write permissions
3. **Whitelist Render's IP addresses** or use 0.0.0.0/0 for all IPs
4. **Copy connection string** and add to `MONGODB_URI` environment variable

### 5. Post-Deployment

1. **Test health endpoint**: Visit `https://your-api-url.onrender.com/health`
2. **Test frontend**: Visit your frontend URL
3. **Check logs** in Render dashboard for any issues
4. **Update CORS settings** if needed in `server/config/cors.js`

## Important Notes

- **Free tier limitations**: Services may sleep after 15 minutes of inactivity
- **Cold starts**: First request after sleep may take 30+ seconds
- **Build time**: Initial deployment may take 5-10 minutes
- **Environment variables**: Must be set before deployment

## Troubleshooting

### Common Issues:

1. **Build failures**: Check that all dependencies are in package.json
2. **CORS errors**: Ensure frontend URL is added to CORS configuration
3. **Database connection**: Verify MongoDB URI and network access
4. **Environment variables**: Double-check all required variables are set

### Logs:
- Check Render service logs for detailed error messages
- Backend logs available in Render dashboard
- Frontend build logs show any compilation issues

## Security Considerations

- Use strong, unique values for JWT_SECRET and SESSION_SECRET
- Restrict MongoDB access to specific IPs when possible
- Enable HTTPS (automatically provided by Render)
- Review CORS settings for production use

## Monitoring

- Render provides basic monitoring and logs
- Set up uptime monitoring for production use
- Monitor database usage in MongoDB Atlas
