# MongoDB Setup Guide

This guide will help you set up MongoDB Atlas for storing user data, progress, and attempts.

## Why MongoDB?

MongoDB stores:
- ✅ User accounts (name, email, password)
- ✅ User progress and attempts
- ✅ STAR stories
- ✅ All evaluation history
- ✅ Cross-session persistence

## Step-by-Step Setup

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click "Try Free" or "Sign Up"
3. Sign up with your email or Google account
4. Complete the registration

### 2. Create a Free Cluster

1. After logging in, click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
   - ✅ 512 MB storage
   - ✅ Shared RAM
   - ✅ Perfect for development and small apps
3. Select a cloud provider and region:
   - Choose **AWS** or **Google Cloud**
   - Pick a region close to your Render deployment (e.g., Oregon for US West)
4. Name your cluster (e.g., "interview-prep-cluster")
5. Click "Create"
6. Wait 1-3 minutes for cluster creation

### 3. Create Database User

1. Click "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication method
4. Enter:
   - **Username**: e.g., `admin` or your preferred username
   - **Password**: Generate a secure password (use the auto-generate button)
   - **Important**: Copy and save this password securely!
5. Set user privileges to "Read and write to any database"
6. Click "Add User"

### 4. Configure Network Access

1. Click "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - This adds `0.0.0.0/0` to whitelist
   - **Note**: In production, you can restrict this to your Render IP
4. Click "Confirm"

### 5. Get Connection String

1. Go back to "Database" in the left sidebar
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Select:
   - **Driver**: Node.js
   - **Version**: 4.1 or later
5. Copy the connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual database user password
7. Replace `username` if you used a different username

### Example Connection String:
```
mongodb+srv://admin:MySecurePass123@interview-prep-cluster.abc123.mongodb.net/?retryWrites=true&w=majority
```

### 6. Add to Environment Variables

#### For Local Development (.env file):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=interview_prep
JWT_SECRET=your_random_32_character_secret_here
```

#### For Render Deployment:
1. Go to Render Dashboard
2. Select your service
3. Click "Environment"
4. Add:
   - Key: `MONGODB_URI`
   - Value: Your connection string
   - Check "Secret" to hide it
5. Add:
   - Key: `JWT_SECRET`
   - Value: A random 32+ character string
   - Check "Secret" to hide it

## Testing Your Connection

### Local Test:
```bash
# Install dependencies
npm install

# Start the server
npm run dev

# Server should start without MongoDB connection errors
```

### Render Test:
After deployment, check the logs:
1. Go to Render Dashboard
2. Click your service
3. Click "Logs" tab
4. Look for successful connection messages

## Database Collections

The app automatically creates these collections:

- **users**: User accounts
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "hashed_password",
    "createdAt": "2026-01-15T10:30:00Z",
    "lastActive": "2026-01-16T08:15:00Z"
  }
  ```

- **attempts**: User practice attempts
  ```json
  {
    "userId": "user_id",
    "id": "attempt_id",
    "questionId": "question_id",
    "module": "communication",
    "rawText": "User response...",
    "submittedAt": "2026-01-15T10:30:00Z",
    "evaluation": { ... }
  }
  ```

- **stories**: STAR stories
  ```json
  {
    "userId": "user_id",
    "id": "story_id",
    "competency": "Leadership",
    "situation": "...",
    "task": "...",
    "action": "...",
    "result": "...",
    "lastUpdated": "2026-01-15T10:30:00Z"
  }
  ```

## Viewing Your Data

1. Go to MongoDB Atlas Dashboard
2. Click "Browse Collections"
3. Select your database (`interview_prep`)
4. View/edit documents in each collection

## Security Best Practices

### ✅ Do:
- Use strong database user passwords
- Keep your connection string secret
- Use environment variables, never hardcode
- Enable MongoDB Atlas IP whitelist in production
- Rotate JWT_SECRET periodically

### ❌ Don't:
- Commit connection strings to Git
- Share your MongoDB credentials
- Use weak passwords
- Expose connection strings in frontend code

## Troubleshooting

### Connection Timeout
- Check network access settings
- Ensure `0.0.0.0/0` is whitelisted
- Verify connection string format

### Authentication Failed
- Double-check username and password
- Ensure password special characters are URL-encoded
- Verify database user has correct permissions

### Database Not Found
- MongoDB creates databases automatically on first write
- Collections are created when first document is inserted
- No manual setup needed

### URL Encoding Passwords

If your password contains special characters, encode them:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`
- `[` → `%5B`
- `]` → `%5D`

Example:
```
Original password: MyPass@123
Encoded: MyPass%40123
Connection string: mongodb+srv://admin:MyPass%40123@cluster.mongodb.net/
```

## Free Tier Limits

MongoDB Atlas Free Tier (M0):
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ No credit card required
- ✅ Never expires
- ✅ Perfect for small apps and development

This should be sufficient for:
- Hundreds of users
- Thousands of attempts
- Years of practice history

## Upgrading

If you need more:
1. Go to MongoDB Atlas
2. Click "Upgrade" on your cluster
3. Choose M2 or higher tier
4. Paid plans start at $9/month

## Support

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB University (Free Courses)](https://university.mongodb.com/)
- [MongoDB Community Forums](https://www.mongodb.com/community/forums/)
