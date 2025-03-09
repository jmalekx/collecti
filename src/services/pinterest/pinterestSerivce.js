import { PINTEREST_CONFIG } from './pinterestConfig';

export class PinterestService {
  static getAuthUrl() {
    const encodedRedirect = encodeURIComponent(PINTEREST_CONFIG.REDIRECT_URI);
    const encodedScope = encodeURIComponent(PINTEREST_CONFIG.SCOPE);
    
    return `${PINTEREST_CONFIG.AUTH_URL}` +
           `?client_id=${PINTEREST_CONFIG.CLIENT_ID}` +
           `&redirect_uri=${encodedRedirect}` +
           `&response_type=code` +
           `&scope=${encodedScope}` +
           `&state=${Math.random().toString(36).substring(7)}`;
  }

  static async getAccessToken(code) {
    try {
      const formData = new URLSearchParams();
      formData.append('grant_type', 'authorization_code');
      formData.append('code', code);
      formData.append('client_id', PINTEREST_CONFIG.CLIENT_ID);
      formData.append('client_secret', PINTEREST_CONFIG.CLIENT_SECRET);
      formData.append('redirect_uri', PINTEREST_CONFIG.REDIRECT_URI);

      const response = await fetch(PINTEREST_CONFIG.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Pinterest OAuth] Token error:', error);
      throw error;
    }
  }
}