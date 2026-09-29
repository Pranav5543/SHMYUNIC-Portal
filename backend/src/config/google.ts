export const googleOAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id.apps.googleusercontent.com',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret',
  callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback'
};
