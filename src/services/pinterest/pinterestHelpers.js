/*
    Pinterest Helper Functions
    
    This file contains utility functions for working with Pinterest data:
    - Extracting pin IDs from URLs
    - Resolving Pinterest short URLs
    - Checking if a URL is a direct Pinterest image
    - Creating canonical Pinterest URLs
    - Extracting image URLs from Pinterest API responses
    - Checking pin ownership
 */

//Extract pin ID from various formats
export const extractPinId = (url) => {
    if (!url) return null;

    const patterns = [
        /pinterest\.com\/pin\/(\d+)/i,
        /\/pin\/(\d+)/i,
        /pin\.it\/\w+/i //Add pattern for shortened URLs (regex)
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
};

//Resolve short URL to full URL
export const resolveShortUrl = async (shortUrl) => {
    try {
        const response = await fetch(shortUrl, {
            method: 'HEAD',
            redirect: 'follow'
        });

        const finalUrl = response.url;

        return finalUrl;
    } catch (error) {
        console.error('[Pinterest] URL resolution failed:', error.message);
    }
};

//Check if URL is direct image form pinterst
export const isDirectPinterestImage = (url) => {
    if (!url) return false;

    return url.includes('pinimg.com') ||
        url.includes('.jpg') ||
        url.includes('.jpeg') ||
        url.includes('.png') ||
        url.includes('.webp');
};

//Create URL from ID
export const createPinUrl = (pinId) => {
    return `https://www.pinterest.com/pin/${pinId}/`;
};

//Extract image from API response
export const extractPinterestImageUrl = (response) => {
    if (!response) return null;

    //Possible paths to image URLs
    const imagePaths = [
        ['media', 'images', 'original', 'url'],
        ['media', 'images', 'orig', 'url'],
        ['media', 'images', '1200x', 'url'],
        ['media', 'images', '600x', 'url'],
        ['image_cover', 'url'],
        ['image', 'url'],
        ['image']
    ];

    //Helper to safely get nested properties
    const getNestedValue = (obj, path) => {
        return path.reduce((current, key) => (current && current[key] !== undefined) ? current[key] : undefined, obj);
    };

    //Try each path
    let imageUrl = null;
    for (const path of imagePaths) {
        imageUrl = getNestedValue(response, path);
        if (imageUrl) break;
    }

    //If still no image, try to find image in object
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

//Check if pin is owned by user for api usage
export const isPinOwnedByUser = (pinData) => {
    if (!pinData) return false;
    return Boolean(pinData.is_owner);
};