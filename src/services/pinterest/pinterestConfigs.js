import { PINTEREST_CLIENT_ID, PINTEREST_CLIENT_SECRET } from '@env';

export const PINTEREST_CONFIG = {
  CLIENT_ID: PINTEREST_CLIENT_ID,
  CLIENT_SECRET: PINTEREST_CLIENT_SECRET,
  REDIRECT_URI: 'collecti://oauth/',
  SCOPE: 'user_accounts:read,pins:read,pins:read_secret,boards:read,boards:read_secret',
  AUTH_URL: 'https://www.pinterest.com/oauth/',
  TOKEN_URL: 'https://api.pinterest.com/v5/oauth/token',
  API_URL: 'https://api.pinterest.com/v5'
};

/*
  Pinterest API Configuration

  Implements config for OAuth 2.0
  Test link for auth:

  https://www.pinterest.com/oauth/?client_id=1507461
  &redirect_uri=collecti://oauth
  &response_type=code
  &scope=user_accounts:read,pins:read,pins:read_secret,boards:read,boards:read_secret
*/
