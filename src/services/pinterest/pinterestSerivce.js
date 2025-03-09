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
        console.log('[Pinterest OAuth] Exchanging code for token:', code);
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
  
        const responseData = await response.json();
        
        if (!response.ok) {
          console.error('[Pinterest OAuth] Error response:', responseData);
          throw new Error(`Token request failed: ${responseData.message || response.status}`);
        }
  
        console.log('[Pinterest OAuth] Token received successfully');
        return responseData;
      } catch (error) {
        console.error('[Pinterest OAuth] Token error:', error);
        throw error;
      }
    }
  }