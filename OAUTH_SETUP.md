# Supabase OAuth Configuration Guide

This guide will help you set up Google and GitHub OAuth providers for your Doccoder application.

## Prerequisites

- Access to your Supabase project dashboard
- Google Cloud Console account (for Google OAuth)
- GitHub account (for GitHub OAuth)

## Google OAuth Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure the OAuth consent screen if prompted:
   - User Type: External
   - App name: Doccoder
   - User support email: Your email
   - Developer contact: Your email
6. Select **Web application** as the application type
7. Add authorized redirect URIs:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   Replace `<your-project-ref>` with your Supabase project reference ID
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

### 2. Configure in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and toggle it on
5. Paste your **Client ID** and **Client Secret**
6. Click **Save**

## GitHub OAuth Setup

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the application details:
   - **Application name**: Doccoder
   - **Homepage URL**: `https://yourdomain.com` (or `http://localhost:3000` for development)
   - **Authorization callback URL**:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** and copy it

### 2. Configure in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **GitHub** and toggle it on
5. Paste your **Client ID** and **Client Secret**
6. Click **Save**

## Email Confirmation Settings

To enable email verification for new signups:

1. In Supabase Dashboard, go to **Authentication** → **Settings**
2. Under **Email Auth**, ensure **Enable email confirmations** is checked
3. Customize the email templates if desired under **Email Templates**

## Testing OAuth Flow

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the signup page: `http://localhost:3000/auth/sign-up`

3. Click **Continue with Google** or **Continue with GitHub**

4. Complete the OAuth flow

5. You should be redirected to `/ai-transformer` after successful authentication

## Troubleshooting

### "Redirect URI mismatch" error
- Ensure the callback URL in your OAuth app matches exactly: `https://<project-ref>.supabase.co/auth/v1/callback`
- Check for trailing slashes or typos

### OAuth button doesn't work
- Check browser console for errors
- Verify OAuth provider is enabled in Supabase
- Ensure Client ID and Secret are correctly configured

### Users not redirected after sign-in
- Check the callback route at `/app/auth/callback/route.ts`
- Verify the redirect URL is correct

## Security Notes

- Never commit OAuth credentials to version control
- Use environment variables for sensitive data in production
- Regularly rotate OAuth secrets
- Monitor OAuth usage in provider dashboards
