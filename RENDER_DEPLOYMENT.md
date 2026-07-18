# Render Deployment Guide

## Prerequisites
- A [Render](https://render.com) account
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Quick Deployment Steps

### 1. Get Your Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key (you'll need it in step 3)

### 2. Connect Your Repository to Render
1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" and select "Web Service"
3. Connect your Git repository
4. Select the repository containing this project

### 3. Configure Your Web Service

Render will auto-detect the `render.yaml` file. Verify these settings:

- **Name**: interview-prep-app (or customize)
- **Region**: Oregon (or choose closest to you)
- **Branch**: main (or your default branch)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Plan**: Free

### 4. Add Environment Variables

In the Render dashboard, add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `GEMINI_API_KEY` | Your Gemini API key from step 1 |
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | A random secure string (e.g., use password generator) |
| `PORT` | Automatically set by Render (no need to add) |

**Important**: Mark all sensitive values as secret/hidden!

#### Getting MongoDB Connection String:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account (if you don't have one)
3. Create a new cluster (free M0 tier available)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
6. Replace `<password>` with your database password
7. Add this as the `MONGODB_URI` environment variable

#### Generating JWT Secret:

Use a password generator to create a random 32+ character string, or run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your app
3. Wait for the deployment to complete (usually 2-5 minutes)
4. Your app will be live at `https://your-app-name.onrender.com`

## Environment Variables Explained

### Required
- **GEMINI_API_KEY**: Your Google Gemini API key for AI evaluations
  - Get it from: https://aistudio.google.com/app/apikey
  - This is required for the app to function

- **MONGODB_URI**: Your MongoDB connection string for user data storage
  - Get from: https://cloud.mongodb.com
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/`
  - Free tier available (M0 cluster)

- **JWT_SECRET**: Secret key for authentication tokens
  - Generate a random 32+ character string
  - Keep this secret and never share it

### Automatically Set by Render
- **PORT**: Render automatically sets this (typically 10000)
- **NODE_ENV**: Set to `production` for production builds

## Manual Deployment (Alternative)

If you prefer not to use `render.yaml`, you can configure manually:

1. In Render Dashboard, click "New +" → "Web Service"
2. Connect your repository
3. Configure:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Node Version**: 20 (specified in .nvmrc)
4. Add environment variables as described above
5. Click "Create Web Service"

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node version compatibility (v20 recommended)
- Check build logs in Render dashboard

### App Crashes on Start
- Verify `GEMINI_API_KEY` is set correctly
- Check start command logs in Render dashboard
- Ensure `NODE_ENV=production` is set

### API Errors
- Verify your Gemini API key is valid
- Check if you've exceeded API quota
- Review application logs in Render dashboard

## Updating Your App

Render automatically deploys when you push to your connected branch:

```bash
git add .
git commit -m "Update application"
git push origin main
```

Render will detect the push and redeploy automatically.

## Custom Domain (Optional)

1. Go to your service in Render Dashboard
2. Click "Settings" → "Custom Domain"
3. Add your domain and follow DNS configuration instructions

## Monitoring

- **Logs**: Available in Render Dashboard under "Logs" tab
- **Metrics**: View CPU, memory usage in "Metrics" tab
- **Events**: Track deployments in "Events" tab

## Cost

- **Free Tier**: Includes 750 hours/month, auto-sleeps after 15 min of inactivity
- **Paid Tiers**: Start at $7/month for always-on instances
- **Gemini API**: Free tier includes generous quotas, check [pricing](https://ai.google.dev/pricing)

## Support

- [Render Documentation](https://render.com/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)
