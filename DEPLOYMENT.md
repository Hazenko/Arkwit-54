# Deployment Guide for Arkwit 54

This guide explains how to deploy Arkwit 54 to Render.com.

## Prerequisites

1. A Render.com account (free tier available)
2. A PostgreSQL database (Render provides free PostgreSQL databases)
3. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Create a PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "PostgreSQL"
3. Configure your database:
   - **Name**: `arkwit-54-db` (or any name you prefer)
   - **Database**: `arkwit54`
   - **User**: Will be auto-generated
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid for production)
4. Click "Create Database"
5. **Important**: Save the "Internal Database URL" - you'll need it for environment variables

## Step 2: Deploy the Web Service

1. In Render Dashboard, click "New +" and select "Web Service"
2. Connect your Git repository
3. Configure your web service:
   - **Name**: `arkwit-54` (or any name you prefer)
   - **Region**: Same as your database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (unless your code is in a subdirectory)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for production)

## Step 3: Configure Environment Variables

In the "Environment" section of your web service settings, add the following environment variables:

### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Sets the app to production mode |
| `DATABASE_URL` | `[Your Internal Database URL]` | PostgreSQL connection string from Step 1 |
| `JWT_SECRET` | `[Generate a random secret]` | Used for JWT token signing - use a long random string |
| `PORT` | `10000` | Render uses port 10000 by default |

### Optional Variables (for customizing the admin account)

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `ADMIN_EMAIL` | `admin@example.com` | Admin user email |
| `ADMIN_PASSWORD` | `admin123456` | Admin user password |
| `ADMIN_FULLNAME` | `المشرف الرئيسي` | Admin user full name |
| `ADMIN_PHONE` | `+966500000000` | Admin user phone |

### How to Generate JWT_SECRET

Run this command in your terminal to generate a secure random secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or use any long random string (minimum 32 characters recommended).

## Step 4: Initialize the Database

After your web service is deployed:

1. Go to your web service's "Shell" tab in Render Dashboard
2. Run the following commands to set up the database schema:

```bash
npm run db:push
```

3. Optionally, seed the database with demo data:

```bash
npm run db:seed
```

This will create:
- An admin user (use credentials from environment variables)
- 4 demo users (password: `123456` for all)
- 3 demo posts
- Several demo comments with nested replies

## Step 5: Access Your Application

1. Your app will be available at: `https://your-service-name.onrender.com`
2. Login with the admin credentials you set (or default: `admin@example.com` / `admin123456`)
3. **Important**: Change the admin password immediately after first login!

## Important Notes

### Database Migrations

If you make schema changes, push them with:
```bash
npm run db:push
```

### Environment Variables

- Never commit `.env` file to Git
- Use `.env.example` as a template
- Set all variables in Render's dashboard

### Security Checklist

- ✅ Change default admin password
- ✅ Use a strong JWT_SECRET
- ✅ Enable Render's "Auto-Deploy" for automatic updates
- ✅ Set up health checks in Render dashboard
- ✅ Enable HTTPS (Render provides this automatically)

### Monitoring

Render provides:
- Automatic HTTPS
- Health checks
- Logs (view in the "Logs" tab)
- Metrics (CPU, Memory usage)
- Auto-sleep on free tier (wakes up on request)

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Verify Node version compatibility
- Check build logs for specific errors

### Database Connection Fails

- Verify `DATABASE_URL` is correct
- Ensure database and web service are in same region for best performance
- Check database is running and accessible

### App Crashes After Deploy

- Check the logs in Render dashboard
- Verify all required environment variables are set
- Ensure database schema is initialized with `npm run db:push`

### Can't Login

- Verify JWT_SECRET is set
- Check database has been seeded or admin user exists
- Try resetting password or running seed script again

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Environment Variables](https://render.com/docs/environment-variables)

## Support

For issues with:
- Render platform: Check [Render Status](https://status.render.com/)
- Application: Check application logs in Render dashboard
- Database: Check database logs and metrics in Render dashboard
