export const PINTEREST_CONFIG = {
  CLIENT_ID: '1507461',
  CLIENT_SECRET: 'e33c5528a1ccf8fe350fb6d0e440bc0f93ff66f4',
  REDIRECT_URI: 'collecti://oauth',
  SCOPE: 'user_accounts:read,boards:read,pins:read',
  AUTH_URL_APP: 'pinterest://oauth/authorize',
  AUTH_URL_WEB: 'https://www.pinterest.com/oauth',
  TOKEN_URL: 'https://api.pinterest.com/v5/oauth/token'
};

//   https://www.pinterest.com/oauth/?client_id=1507462
//   &redirect_uri=collecti://oauth
//   &response_type=code
//   &scope=user_accounts:read,boards:read,pins:read