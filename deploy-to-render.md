# 🚀 Quick Deploy to Render - Single Service

## Step-by-Step Deployment Guide

### 1. 📋 Prerequisites Checklist
- [ ] GitHub account
- [ ] Render account (free at https://render.com)
- [ ] MongoDB Atlas account (free at https://cloud.mongodb.com)

### 2. 🗄️ Set Up MongoDB Atlas (5 minutes)

1. **Create MongoDB Atlas Account**
   - Go to https://cloud.mongodb.com
   - Sign up for free account
   - Create a new project

2. **Create Database Cluster**
   - Click "Build a Database"
   - Choose "M0 Sandbox" (FREE)
   - Select a region close to you
   - Name your cluster (e.g., "murai-cluster")

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `murai-user`
   - Generate secure password (save it!)
   - Database User Privileges: "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow access from anywhere" (0.0.0.0/0)
   - Confirm

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your user password
   - Replace `<dbname>` with `murai`

### 3. 🔐 Generate Secure Secrets

Run these commands in your terminal to generate secure secrets:

```bash
# Generate JWT Secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Generate Session Secret  
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

Save these values - you'll need them for Render!

### 4. 📤 Push to GitHub

```bash
git add .
git commit -m "Add single-service Render deployment configuration"
git push origin main
```

### 5. 🚀 Deploy to Render

1. **Go to Render Dashboard**
   - Visit https://render.com
   - Sign in to your account

2. **Create New Blueprint**
   - Click "New +"
   - Select "Blueprint"
   - Connect your GitHub account
   - Select your repository
   - Click "Connect"

3. **Set Environment Variables**
   Click on your service and add these environment variables:
   
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://murai-user:YOUR_PASSWORD@cluster.mongodb.net/murai?retryWrites=true&w=majority
   JWT_SECRET=your-generated-jwt-secret-here
   SESSION_SECRET=your-generated-session-secret-here
   SERVE_FRONTEND=true
   ```

4. **Deploy**
   - Click "Create Blueprint"
   - Wait for deployment (5-10 minutes)
   - Your app will be available at: `https://murai-web.onrender.com`

### 6. ✅ Test Your Deployment

1. **Check Health Endpoint**
   - Visit: `https://your-app-name.onrender.com/health`
   - Should return JSON with server status

2. **Test Frontend**
   - Visit: `https://your-app-name.onrender.com`
   - Should load your React application

3. **Test API**
   - Visit: `https://your-app-name.onrender.com/api/health`
   - Should return API health status

### 🎉 You're Done!

Your MURAI web application is now live with:
- ✅ Frontend and backend in one service
- ✅ MongoDB Atlas database
- ✅ HTTPS enabled automatically
- ✅ Free hosting on Render

### 🔧 Troubleshooting

**Build Failed?**
- Check the build logs in Render dashboard
- Ensure all dependencies are in package.json

**Can't Connect to Database?**
- Verify MongoDB connection string
- Check network access settings in Atlas
- Ensure password is correct (no special characters that need encoding)

**Frontend Not Loading?**
- Check that `SERVE_FRONTEND=true` is set
- Verify build completed successfully
- Check server logs for errors

**API Errors?**
- Check environment variables are set correctly
- Verify JWT_SECRET and SESSION_SECRET are set
- Check server logs in Render dashboard

### 💡 Pro Tips

- **Free Tier Limitations**: Service sleeps after 15 minutes of inactivity
- **Cold Starts**: First request after sleep takes 30+ seconds
- **Monitoring**: Check Render dashboard for logs and metrics
- **Updates**: Push to GitHub to trigger automatic redeployment
