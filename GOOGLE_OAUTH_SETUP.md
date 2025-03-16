# Google OAuth Setup Guide

This guide will walk you through the process of setting up Google OAuth for the CS24 application.

## Prerequisites

1. A Google account with access to the [Google Cloud Console](https://console.cloud.google.com/)
2. A Supabase project
3. Your application deployed or running locally

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click on "New Project"
4. Enter a name for your project (e.g., "CS24 Site")
5. Click "Create"

## Step 2: Configure the OAuth Consent Screen

1. In your new project, go to "APIs & Services" > "OAuth consent screen"
2. Select "External" as the user type (unless you have a Google Workspace organization)
3. Click "Create"
4. Fill in the required information:
   - App name: "CS24 Site"
   - User support email: Your email address
   - Developer contact information: Your email address
5. Click "Save and Continue"
6. Under "Scopes", add the following scopes:
   - `email`
   - `profile`
   - `openid`
7. Click "Save and Continue"
8. Add test users if you're in testing mode
9. Click "Save and Continue"
10. Review your settings and click "Back to Dashboard"

## Step 3: Create OAuth Client ID

1. In your project, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Name: "CS24 Web Client"
5. Add Authorized JavaScript origins:
   - For local development: `http://localhost:3000`
   - For production: Your production URL (e.g., `https://cs24.example.com`)
   - **Important**: Add your Supabase project URL (e.g., `https://yourproject.supabase.co`)
6. Add Authorized redirect URIs:
   - For local development: `http://localhost:3000/auth/callback`
   - For production: Your production redirect URL (e.g., `https://cs24.example.com/auth/callback`)
   - **Important**: Add Supabase callback URLs:
     - `https://yourproject.supabase.co/auth/v1/callback`
     - `https://yourproject.supabase.co/auth/v1/callback/google`
7. Click "Create"
8. Note down the Client ID and Client Secret (you'll need both for Supabase configuration)

## Step 4: Configure Supabase

1. Go to your Supabase dashboard
2. Navigate to Authentication > Providers
3. Find Google in the list and click "Edit"
4. Enable the Google provider
5. Enter the Client ID you obtained in Step 3
6. Enter the Client Secret you obtained in Step 3
7. Set the Authorized redirect URL to match your application's callback URL:
   - For local development: `http://localhost:3000/auth/callback`
   - For production: Your production URL (e.g., `https://cs24.example.com/auth/callback`)
8. Save the changes

## Step 5: Configure Your Application

1. Open your `.env` file (or create one based on `.env.example`)
2. Set the `REACT_APP_GOOGLE_CLIENT_ID` to the Client ID you obtained in Step 3
3. Make sure your Supabase URL and anon key are also set correctly:
   ```
   REACT_APP_SUPABASE_URL=https://yourproject.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
   ```

## Step 6: Test the Authentication

1. Start your application
2. Click on the login button
3. You should be redirected to Google's consent screen
4. After granting permission, you should be redirected back to your application and logged in

## Troubleshooting

### Error: "redirect_uri_mismatch"

This error occurs when the redirect URI in your request doesn't match any of the authorized redirect URIs in your Google Cloud Console project.

**Solution:**
- Double-check that all necessary redirect URIs are added to your Google Cloud Console project:
  - Your application's callback URL
  - Supabase callback URLs (both `/auth/v1/callback` and `/auth/v1/callback/google`)
- Remember that URIs are case-sensitive and must match exactly, including trailing slashes.

### Error: "client_secret is missing"

This error occurs when trying to exchange an authorization code without providing a client secret.

**Solution:**
- Make sure you've configured the Google provider in Supabase with both the Client ID and Client Secret
- Ensure you're using Supabase's built-in OAuth flow which handles the client secret securely

### Error: "invalid_grant"

This error can occur for several reasons:
- The authorization code has already been used
- The code verifier doesn't match the code challenge
- The authorization code has expired

**Solution:**
- Try logging in again to get a fresh authorization code
- Check that your code verifier is being stored and retrieved correctly
- Ensure your clock is synchronized

### Error: "invalid_client"

This error occurs when the client ID or client secret is incorrect or not authorized.

**Solution:**
- Verify that the client ID and client secret in your Supabase configuration match the ones in your Google Cloud Console project
- Make sure the OAuth consent screen is properly configured

## Additional Resources

- [Google OAuth 2.0 for Client-side Web Applications](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [PKCE Flow Explained](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-proof-key-for-code-exchange-pkce) 