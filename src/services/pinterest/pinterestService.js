import { PINTEREST_CONFIG } from './pinterestConfig';
import axios from 'axios';
import { encode as base64Encode } from 'base-64';
import AsyncStorage from '@react-native-async-storage/async-storage';

class PinterestService {
  constructor() {
    this.config = PINTEREST_CONFIG;
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;
  }

  /**
   * Generates the authorization URL for Pinterest OAuth
   */
  getAuthorizationUrl() {
    const params = new URLSearchParams({
      client_id: this.config.CLIENT_ID,
      redirect_uri: this.config.REDIRECT_URI,
      response_type: 'code',
      scope: this.config.SCOPE
    });

    return `${this.config.AUTH_URL}?${params.toString()}`;
  }

  /**
   * Handles the redirect from Pinterest OAuth and exchanges the code for tokens
   * @param {string} url - The redirect URL containing the authorization code
   */
  async handleRedirect(url) {
    try {
      // Extract the authorization code from the URL
      const authCode = this.extractCodeFromUrl(url);
      
      if (!authCode) {
        throw new Error('No authorization code found in redirect URL');
      }
      
      // Exchange the authorization code for access and refresh tokens
      return await this.exchangeCodeForToken(authCode);
    } catch (error) {
      console.error('Error handling redirect:', error);
      throw error;
    }
  }

  /**
   * Extracts the authorization code from the redirect URL
   * @param {string} url - The redirect URL
   * @returns {string|null} The authorization code or null if not found
   */
  extractCodeFromUrl(url) {
    // Parse the URL to extract the code parameter
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');
    return code;
  }

  /**
   * Exchanges the authorization code for access and refresh tokens
   * @param {string} code - The authorization code
   */
  async exchangeCodeForToken(code) {
    try {
      const basicAuth = base64Encode(`${this.config.CLIENT_ID}:${this.config.CLIENT_SECRET}`);
      
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', this.config.REDIRECT_URI);
      
      const response = await axios.post(this.config.TOKEN_URL, params.toString(), {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const tokenData = response.data;
      
      // Store tokens
      await this.saveTokens({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in
      });
      
      return {
        success: true,
        accessToken: tokenData.access_token
      };
    } catch (error) {
      console.error('Error exchanging code for token:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Saves the tokens to AsyncStorage
   * @param {Object} tokens - The tokens to save
   */
  async saveTokens({ accessToken, refreshToken, expiresIn }) {
    const expiresAt = new Date().getTime() + expiresIn * 1000;
    
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresAt = expiresAt;
    
    try {
      await AsyncStorage.setItem('pinterest_access_token', accessToken);
      await AsyncStorage.setItem('pinterest_refresh_token', refreshToken);
      await AsyncStorage.setItem('pinterest_token_expires_at', expiresAt.toString());
    } catch (error) {
      console.error('Error saving tokens to AsyncStorage:', error);
    }
  }

  /**
   * Loads the tokens from AsyncStorage
   */
  async loadTokens() {
    try {
      const accessToken = await AsyncStorage.getItem('pinterest_access_token');
      const refreshToken = await AsyncStorage.getItem('pinterest_refresh_token');
      const expiresAt = await AsyncStorage.getItem('pinterest_token_expires_at');
      
      if (accessToken && refreshToken && expiresAt) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresAt = parseInt(expiresAt, 10);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading tokens from AsyncStorage:', error);
      return false;
    }
  }

  /**
   * Checks if the access token is expired
   * @returns {boolean} Whether the token is expired
   */
  isTokenExpired() {
    if (!this.expiresAt) return true;
    // Add a buffer of 5 minutes before expiration
    const bufferTime = 5 * 60 * 1000;
    return new Date().getTime() + bufferTime > this.expiresAt;
  }

  /**
   * Refreshes the access token using the refresh token
   */
  async refreshAccessToken() {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const basicAuth = base64Encode(`${this.config.CLIENT_ID}:${this.config.CLIENT_SECRET}`);
      
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', this.refreshToken);
      
      const response = await axios.post(this.config.TOKEN_URL, params.toString(), {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const tokenData = response.data;
      
      await this.saveTokens({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || this.refreshToken,
        expiresIn: tokenData.expires_in
      });
      
      return {
        success: true,
        accessToken: tokenData.access_token
      };
    } catch (error) {
      console.error('Error refreshing token:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Gets the access token, refreshing if necessary
   */
  async getAccessToken() {
    // Load tokens if they're not already loaded
    if (!this.accessToken) {
      const loaded = await this.loadTokens();
      if (!loaded) {
        throw new Error('Not authenticated with Pinterest');
      }
    }
    
    // Check if token is expired and refresh if needed
    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }
    
    return this.accessToken;
  }

  /**
   * Makes an authenticated API request to Pinterest
   * @param {string} endpoint - The API endpoint
   * @param {string} method - The HTTP method
   * @param {Object} data - The request data
   */
  async apiRequest(endpoint, method = 'GET', data = null) {
    try {
      const accessToken = await this.getAccessToken();
      
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
    } catch (error) {
      console.error('API request error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Logs the user out by clearing stored tokens
   */
  async logout() {
    try {
      await AsyncStorage.removeItem('pinterest_access_token');
      await AsyncStorage.removeItem('pinterest_refresh_token');
      await AsyncStorage.removeItem('pinterest_token_expires_at');
      
      this.accessToken = null;
      this.refreshToken = null;
      this.expiresAt = null;
      
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  }

  /**
   * Checks if the user is authenticated
   */
  async isAuthenticated() {
    if (!this.accessToken) {
      await this.loadTokens();
    }
    return !!this.accessToken && !this.isTokenExpired();
  }
}

// Create a singleton instance
const pinterestService = new PinterestService();
export default pinterestService;