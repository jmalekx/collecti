/**
 * Pinterest helper functions for URL processing and image extraction
 */
import axios from 'axios';

/**
 * Extract Pinterest pin ID from various URL formats
 * @param {string} url - Pinterest URL
 * @returns {string|null} - Extracted pin ID or null
 */
export const extractPinId = (url) => {
  if (!url) return null;
  
  const patterns = [
    /pinterest\.com\/pin\/(\d+)/i,
    /\/pin\/(\d+)/i,
    /pin\.it\/\w+/i // Add pattern for shortened URLs
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      console.log('Pinterest: Extracted pin ID:', match[1]);
      return match[1];
    }
  }
  
  return null;
};

/**
 * Resolve a Pinterest short URL to its full URL
 * @param {string} shortUrl - Pinterest short URL (pin.it)
 * @returns {Promise<string>} - Resolved full URL
 */
export const resolveShortUrl = async (shortUrl) => {
  try {
    console.log('Resolving Pinterest short URL:', shortUrl);
    
    const response = await fetch(shortUrl, {
      method: 'HEAD',
      redirect: 'follow'
    });
    
    const finalUrl = response.url;
    console.log('Final URL after redirects:', finalUrl);
    
    return finalUrl;
  } catch (error) {
    console.error('Error resolving short URL:', error);
    throw error;
  }
};

/**
 * Check if URL is a direct Pinterest image
 * @param {string} url - URL to check
 * @returns {boolean} - True if direct image
 */
export const isDirectPinterestImage = (url) => {
  if (!url) return false;
  
  return url.includes('pinimg.com') || 
         url.includes('.jpg') || 
         url.includes('.jpeg') || 
         url.includes('.png') || 
         url.includes('.webp');
};

/**
 * Create canonical Pinterest URL from pin ID
 * @param {string} pinId - Pinterest pin ID
 * @returns {string} - Canonical URL
 */
export const createCanonicalPinUrl = (pinId) => {
  return `https://www.pinterest.com/pin/${pinId}/`;
};

/**
 * Extract the best available image from Pinterest API response
 * @param {Object} response - Pinterest API response
 * @returns {string|null} - Best quality image URL
 */
export const extractPinterestImageUrl = (response) => {
  if (!response) return null;
  
  // Define possible paths to image URLs in order of preference
  const imagePaths = [
    ['media', 'images', 'original', 'url'],
    ['media', 'images', 'orig', 'url'],
    ['media', 'images', '1200x', 'url'],
    ['media', 'images', '600x', 'url'],
    ['image_cover', 'url'],
    ['image', 'url'],
    ['image']
  ];

  // Helper to safely get nested properties
  const getNestedValue = (obj, path) => {
    return path.reduce((current, key) => (current && current[key] !== undefined) ? current[key] : undefined, obj);
  };

  // Try each path in order
  let imageUrl = null;
  for (const path of imagePaths) {
    imageUrl = getNestedValue(response, path);
    if (imageUrl) break;
  }

  // If we still don't have an image, try to find any image in the images object
  if (!imageUrl && response.media && response.media.images) {
    const imageKeys = Object.keys(response.media.images);
    for (const key of imageKeys) {
      if (response.media.images[key] && response.media.images[key].url) {
        imageUrl = response.media.images[key].url;
        break;
      }
    }
  }
  
  return imageUrl;
};

/**
 * Check if a Pinterest pin belongs to the current user
 * @param {Object} pinData - Pinterest API response data
 * @returns {boolean} - True if pin belongs to user
 */
export const isPinOwnedByUser = (pinData) => {
  if (!pinData) return false;
  return Boolean(pinData.is_owner);
};