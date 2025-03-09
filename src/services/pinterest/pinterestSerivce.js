import { PINTEREST_CONFIG } from './pinterestConfig';

export class PinterestService {
    static async getAccessToken(code) {
        try {
            console.log('[Pinterest OAuth] Exchanging code:', code);
            
            const formData = new URLSearchParams();
            formData.append('grant_type', 'authorization_code');
            formData.append('code', code);
            formData.append('redirect_uri', PINTEREST_CONFIG.REDIRECT_URI);
            formData.append('continuous_refresh', 'true'); // Optional, based on your needs

            const authHeader = 'Basic ' + btoa(`${PINTEREST_CONFIG.CLIENT_ID}:${PINTEREST_CONFIG.CLIENT_SECRET}`);
  
            console.log('[Pinterest OAuth] Token request body:', formData.toString());
            
            const response = await fetch(PINTEREST_CONFIG.TOKEN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': authHeader
                },
                body: formData.toString()
            });
  
            console.log('[Pinterest OAuth] Response status:', response.status);
            
            const responseText = await response.text();
            console.log('[Pinterest OAuth] Response body:', responseText);
  
            if (!response.ok) {
                console.error('[Pinterest OAuth] Token request failed:', response.status, responseText);
                throw new Error(`Token request failed: ${response.status} - ${responseText}`);
            }
  
            try {
                const data = JSON.parse(responseText);
                console.log('[Pinterest OAuth] Parsed token data:', data);
                return data;
            } catch (parseError) {
                console.error('[Pinterest OAuth] JSON parse error:', parseError);
                throw new Error(`Failed to parse token response: ${responseText}`);
            }
        } catch (error) {
            console.error('[Pinterest OAuth] Token exchange error:', error);
            throw error;
        }
    }
}