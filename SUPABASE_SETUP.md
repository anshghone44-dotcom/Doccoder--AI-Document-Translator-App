# Complete Supabase Cloud Setup Guide

This guide will help you properly configure your Supabase cloud system for the Doccoder AI Document Translator app.

## 🚀 Quick Setup Checklist

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Fill in project details:
   - **Name**: `Doccoder` or your preferred name
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
5. Wait for project creation (usually 2-3 minutes)

### 2. Get API Credentials
1. Go to your project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`
   - **service_role key**: Another long string (keep this secret!)

### 3. Configure Environment Variables
Update your `.env.local` file with the actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
DATABASE_URL=postgresql://postgres:[password]@db.your-project-ref.supabase.co:5432/postgres
```

### 4. Run Database Setup
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `scripts/003_complete_supabase_setup.sql`
3. Click **Run** to execute the migration

### 5. Configure Authentication
1. Go to **Authentication** → **Settings**
2. Configure site URL: `http://localhost:3000` (for development)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (for production)

### 6. Set Up OAuth Providers (Optional but Recommended)

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select a project
3. Enable Google+ API
4. Create OAuth credentials
5. Add authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
6. In Supabase: **Authentication** → **Providers** → **Google**
7. Paste your Client ID and Client Secret

#### GitHub OAuth:
1. Go to GitHub **Settings** → **Developer settings** → **OAuth Apps**
2. Create new OAuth App
3. Set Authorization callback URL: `https://your-project-ref.supabase.co/auth/v1/callback`
4. In Supabase: **Authentication** → **Providers** → **GitHub**
5. Paste your Client ID and Client Secret

## 🔧 Troubleshooting Common Issues

### Issue: "Missing Supabase environment variables"
**Solution**: Check that your `.env.local` file has the correct values and restart your dev server.

### Issue: "Table doesn't exist" errors
**Solution**: Make sure you ran the database migration script in Supabase SQL Editor.

### Issue: Authentication not working
**Solution**:
1. Check that your site URL is configured in Supabase Auth settings
2. Verify redirect URLs are correct
3. Ensure OAuth providers are properly configured

### Issue: RLS policy errors
**Solution**: The database script includes proper RLS policies. If you get permission errors, check that the policies were created correctly.

### Issue: OAuth redirect not working
**Solution**:
1. Verify the redirect URLs in OAuth provider settings
2. Check that the callback route in your app is working
3. Ensure the site URL in Supabase matches your app's URL

## 🧪 Testing Your Setup

### Test Authentication:
1. Start your app: `npm run dev`
2. Try signing up with email/password
3. Try signing in with OAuth (if configured)
4. Check that you can access protected routes

### Test Database:
1. Try creating a translation
2. Check that it appears in your Supabase dashboard under **Table Editor**
3. Verify that user profiles are created automatically

### Test API Routes:
1. Try uploading and transforming a document
2. Check the API usage statistics in your database

## 📊 Monitoring & Analytics

### View Database:
- Go to **Table Editor** in Supabase dashboard
- Check tables: `profiles`, `user_preferences`, `translation_history`, `api_usage_stats`

### Monitor Auth:
- Go to **Authentication** → **Users** to see registered users
- Check **Logs** for any authentication issues

### API Monitoring:
- Use the `api_usage_stats` table to track usage
- Monitor performance and errors

## 🚀 Production Deployment

### Before Deploying:
1. Update environment variables in your hosting platform
2. Change Supabase site URL to your production domain
3. Update OAuth redirect URLs to production domain
4. Run database migrations on production

### Environment Variables for Production:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key
```

## 🔒 Security Best Practices

1. **Never commit secrets**: Keep `.env.local` in `.gitignore`
2. **Use service role key only server-side**: Never expose it in client code
3. **Enable RLS**: All tables have Row Level Security enabled
4. **Regular backups**: Supabase provides automatic backups
5. **Monitor usage**: Keep track of API usage and costs

## 📞 Support

If you encounter issues:
1. Check the Supabase [documentation](https://supabase.com/docs)
2. Review the [troubleshooting guide](https://supabase.com/docs/guides/troubleshooting)
3. Check your browser console and server logs for error messages
4. Verify all environment variables are set correctly

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Authentication configured
- [ ] OAuth providers set up (optional)
- [ ] App runs without errors
- [ ] User registration works
- [ ] Translation features work
- [ ] Data is properly stored in database

Once all items are checked, your cloud system is fully configured! 🎉