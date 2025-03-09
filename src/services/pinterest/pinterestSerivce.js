import { PINTEREST_CONFIG } from './pinterestConfig';

export class PinterestService {
  static getAuthUrl() {
    return `${PINTEREST_CONFIG.AUTH_URL}?` + 
           `client_id=${PINTEREST_CONFIG.CLIENT_ID}&` +
           `redirect_uri=${encodeURIComponent(PINTEREST_CONFIG.REDIRECT_URI)}&` +
           `response_type=code&` +
           `scope=${PINTEREST_CONFIG.SCOPE}`;
  }

  static async getAccessToken(code) {
    try {
      const response = await fetch(PINTEREST_CONFIG.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: PINTEREST_CONFIG.CLIENT_ID,
          client_secret: PINTEREST_CONFIG.CLIENT_SECRET,
          redirect_uri: PINTEREST_CONFIG.REDIRECT_URI,
        })
      });

      if (!response.ok) {
        throw new Error('Token request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Pinterest token error:', error);
      throw error;
    }
  }

  static async getUserProfile(accessToken) {
    try {
      const response = await fetch('https://api.pinterest.com/v5/user_account', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Profile request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Pinterest profile error:', error);
      throw error;
    }
  }
}