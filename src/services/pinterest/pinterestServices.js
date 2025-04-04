//Third-party library external imports
import axios from 'axios';
import { encode as base64Encode } from 'base-64';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Project services and utilities
import { PINTEREST_CONFIG } from './pinterestConfigs';
import { extractPinterestImageUrl } from './pinterestHelpers';

/*
  PinterestService Module

  Implements Pinterest API integration for the app using Singleton.
  Implements OAuth 2.0 flow:
  - Authorisation token request: user consent
  - Token exchange: converting code to access tokens
  - Token management: storing, expiration handling, refresh
  - API access: authenticated requests
  -Secure token storage in AsyncStorage

*/

class PinterestService {
  constructor() {
    this.config = PINTEREST_CONFIG;
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;
  }

  //Generates the properly formats auth URL
  getAuthorizationUrl() {
    const params = new URLSearchParams({
      client_id: this.config.CLIENT_ID,
      redirect_uri: this.config.REDIRECT_URI,
      response_type: 'code',
      scope: this.config.SCOPE
    });

    return `${this.config.AUTH_URL}?${params.toString()}`;
  }

  //OAuth redirect handler
  async handleRedirect(url) {
    try {
      //Extracts auth code, parses redirect URL
      const authCode = this.extractAuthCode(url);
      if (!authCode) {
        throw new Error('No authorization code found in redirect URL');
      }

      const result = await this.exchangeCodeForToken(authCode);
      return result;
    }
    catch (error) {
      console.log('Error handling redirect:', error);
      return { success: false, error: error.message };
    }
  }

  //Token Status check
  async getCurrentToken() {
    await this.loadTokens(); //Ensure tokens loaded
    return {
      accessToken: this.accessToken,
      expiresAt: new Date(this.expiresAt).toLocaleString(),
      isExpired: this.isTokenExpired()
    };
  }

  //Extracting auth code from redirected URL
  extractAuthCode(url) {
    //Parsing URL
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');
    return code;
  }

  //Exchanging auth code for access token
  async exchangeCodeForToken(code) {
    try {
      //Basic encoding, for security would use proper encoding rather than string concatenation
      const basicAuth = base64Encode(`${this.config.CLIENT_ID}:${this.config.CLIENT_SECRET}`);

      //Request body
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', this.config.REDIRECT_URI);

      //Token POST request
      const response = await axios.post(this.config.TOKEN_URL, params.toString(), {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const tokenData = response.data;

      //Storing tokens
      await this.saveTokens({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in
      });

      return {
        success: true,
        accessToken: tokenData.access_token
      };
    }
    catch (error) {
      console.log('Error exchanging code for token:', error);
      return { success: false, error: error.message };
    }
  }

  //Token storage in AsyncStorage
  async saveTokens({ accessToken, refreshToken, expiresIn }) {
    //Calculating expiration time
    const expiresAt = new Date().getTime() + expiresIn * 1000;

    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresAt = expiresAt;

    try {
      //Persistence
      await AsyncStorage.setItem('pinterest_access_token', accessToken);
      await AsyncStorage.setItem('pinterest_refresh_token', refreshToken);
      await AsyncStorage.setItem('pinterest_token_expires_at', expiresAt.toString());
    }
    catch (error) {
      console.log('Error saving tokens to AsyncStorage:', error);
    }
  }

  //Loading tokens from AsyncStorage
  async loadTokens() {
    try {
      //Retrieves all token data
      const accessToken = await AsyncStorage.getItem('pinterest_access_token');
      const refreshToken = await AsyncStorage.getItem('pinterest_refresh_token');
      const expiresAt = await AsyncStorage.getItem('pinterest_token_expires_at');

      //Validates retrieved token
      if (accessToken && refreshToken && expiresAt) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresAt = parseInt(expiresAt, 10);
        return true;
      }
      return false;
    }
    catch (error) {
      console.log('Error loading tokens from storage:', error);
      return false;
    }
  }

  //Checking token expiration
  isTokenExpired() {
    if (!this.expiresAt) return true;
    //Add safety buffer of 5 minutes before expiration (preventing using expired token during request)
    const bufferTime = 5 * 60 * 1000;
    return new Date().getTime() + bufferTime > this.expiresAt;
  }

  //Refreshing access token
  async refreshAccessToken() {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      const basicAuth = base64Encode(`${this.config.CLIENT_ID}:${this.config.CLIENT_SECRET}`);

      //Request body
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', this.refreshToken);

      //Token refresh POST request
      const response = await axios.post(this.config.TOKEN_URL, params.toString(), {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const tokenData = response.data;

      //Storing refreshed tokens
      await this.saveTokens({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || this.refreshToken,
        expiresIn: tokenData.expires_in
      });

      return {
        success: true,
        accessToken: tokenData.access_token
      };
    }
    catch (error) {
      console.log('Error refreshing token:', error.response?.data || error.message);
      return { success: false, error: 'Token refresh failed' };
    }
  }

  //Token access with auto-refresh
  async getAccessToken() {
    //Loads token from storage if not in memory
    if (!this.accessToken) {
      const loaded = await this.loadTokens();
      if (!loaded) {
        console.log('Not authenticated with Pinterest');
        return { success: false, error: 'Not authenticated with Pinterest' };
      }
    }

    //Expiration check and refresh
    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }

    return this.accessToken;
  }

  //Making authenticated API request to pinterest
  async apiRequest(endpoint, method = 'GET', data = null) {
    try {
      const accessToken = await this.getAccessToken();

      //API GET request
      const response = await axios({
        method,
        url: `${this.config.API_URL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        data: method !== 'GET' ? data : undefined,
        params: method === 'GET' ? data : undefined
      });

      return response.data;
    }
    catch (error) {
      console.log('API request failed:', error.response?.status || '', error.message);
      return { success: false, error: error.message};
    }
  }

  //Authentication termination
  async logout() {
    try {  //Logging out by clearing stored tokens from storage
      await AsyncStorage.removeItem('pinterest_access_token');
      await AsyncStorage.removeItem('pinterest_refresh_token');
      await AsyncStorage.removeItem('pinterest_token_expires_at');

      //Resetting in-memory tokens
      this.accessToken = null;
      this.refreshToken = null;
      this.expiresAt = null;

      return true;
    }
    catch (error) {
      console.log('Error clearing stored tokens:', error);
      return false;
    }
  }

  //Authentication Status check
  async isAuthenticated() {
    if (!this.accessToken) {
      await this.loadTokens();
    }
    return !!this.accessToken && !this.isTokenExpired();
  }

  //Pinterest Pin data fetching
  async getUserInfo() {
    try {
      console.log('Pinterest API: Fetching user info');
      const endpoint = '/user_account';
      const response = await this.apiRequest(endpoint);

      return {
        id: response.id,
        username: response.username,
        profileUrl: `https://www.pinterest.com/${response.username}/`
      };
    } 
    catch (error) {
      console.log('Error fetching user info:', error);
      return { success : false, error: error.message };
    }
  }


  //Fetch pin details from the Pinterest API
  async fetchPinData(pinId) {
    try {
      //Get user info for ownership context
      const userInfo = await this.getUserInfo();
      console.log(`Pinterest API: Authenticated as user ID: ${userInfo.id}, username: ${userInfo.username}`);

      //Make API request
      const endpoint = `/pins/${pinId}`;
      const response = await this.apiRequest(endpoint);

      //Use helper to extract image URL
      const imageUrl = extractPinterestImageUrl(response);

      return {
        id: response.id,
        title: response.title || '',
        description: response.description || '',
        image: imageUrl,
        link: response.link || `https://www.pinterest.com/pin/${pinId}/`,
        isUserPin: true,
        is_owner: response.is_owner,
        raw: response
      };
    }
    catch (error) {
      console.log('Pinterest API: Could not fetch - user may not own this pin');
      return {success: false};
    }
  }
}

//Creating singleton instance
const pinterestService = new PinterestService();
export default pinterestService;