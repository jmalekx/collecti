//Third-party library external imports
import { Linking } from 'react-native';

//Project services and utilities
import { isDirectPinterestImage } from './pinterest/pinterestHelpers';

/* 
  Platform Service Module

  For platform-specific operations providing centralised service
  for URL extraction and platform operations.
  
*/

//Extract URL helper
export const extractPostUrl = (post) => {
  if (!post) return null;

  //If Pinterest 
  if (post.platform === 'pinterest') {
    //For user's own pins (direct images from API), use the image URL for display
    if (post.image && isDirectPinterestImage(post.image)) {
      return post.image;
    }

    //For pins with sourceUrl (for oembed), use that for linking
    if (post.sourceUrl) {
      return post.sourceUrl;
    }
  }

  return post.image || post.thumbnail || post.originalUrl || null;
};

//Extract source URL for opening in the platform
export const extractSourceUrl = (post) => {
  if (!post) return null;

  //For Pinterest, prioritise sourceUrl for opening in the platform
  if (post.platform === 'pinterest' && post.sourceUrl) {
    return post.sourceUrl;
  }

  return post.sourceUrl || post.image || post.thumbnail || post.originalUrl || null;
};

//Platform Strategy Base Class
class PlatformLink {
  //Open URL in designated platform
  async openUrl(url) {
    console.log('Error: PlatformLink.openUrl not implemented in derived class');
    return false;
  }

  isValidUrl(url) {
    return !!url;
  }

  getDisplayName() {
    console.log('Error: PlatformLink.getDisplayName not implemented in derived class');
    return 'Unknown Platform';
  }
}

//Instagram Platform Strategy
class InstagramLink extends PlatformLink {
  async openUrl(url) {
    return Linking.openURL(url);
  }

  isValidUrl(url) {
    return !!url && url.includes('instagram.com');
  }

  getDisplayName() {
    return 'Instagram';
  }
}

//TikTok Platform Strategy
class TiktokLink extends PlatformLink {
  async openUrl(url) {
    // Clean URL for TikTok
    const cleanUrl = url.split('?')[0];
    return Linking.openURL(cleanUrl);
  }

  isValidUrl(url) {
    return !!url && (url.includes('tiktok.com') || url.includes('vm.tiktok.com') || url.includes('vt.tiktok.com'));
  }

  getDisplayName() {
    return 'TikTok';
  }
}
//Pinterest Platform Strategy
class PinterestLink extends PlatformLink {
  async openUrl(url) {
    return Linking.openURL(url);
  }

  isValidUrl(url) {
    return !!url && (url.toLowerCase().includes('pinterest.com') || url.toLowerCase().includes('pin.it'));
  }

  getDisplayName() {
    return 'Pinterest';
  }
}

//YouTube Platform Strategy
class YouTubeLink extends PlatformLink {
  async openUrl(url) {
    return Linking.openURL(url);
  }

  isValidUrl(url) {
    return !!url && (url.includes('youtube.com') || url.includes('youtu.be'));
  }

  getDisplayName() {
    return 'YouTube';
  }
}

//Default Platform Strategy
class DefaultLink extends PlatformLink {
  async openUrl(url) {
    return Linking.openURL(url);
  }

  getDisplayName() {
    return 'Gallery';
  }
}

//Select appropriate strategy based on platform
export const createPlatformLink = (platform) => {
  const strategies = {
    'instagram': new InstagramLink(),
    'tiktok': new TiktokLink(),
    'pinterest': new PinterestLink(),
    'youtube': new YouTubeLink(),
    'default': new DefaultLink()
  };

  return strategies[platform] || strategies.default;
};

//Open post in native platform
export const openInPlatform = async (post) => {
  if (!post) {
    console.log('Error opening in platform: Invalid post data');
    return false;
  }

  const url = extractPostUrl(post);
  if (!url) {
    console.log('Error opening post in platform: No URL available');
    return false;
  }

  const strategy = createPlatformLink(post.platform);
  return await strategy.openUrl(url);
};

//Determines if platform link should be shown
export const shouldShowPlatformLink = (post) => {
  if (!post || !post.platform) return false;

  //Only show platform links for social media platforms, not gallery
  return ['instagram', 'tiktok', 'pinterest', 'youtube'].includes(post.platform.toLowerCase());
};

//Formatted platform name
export const getPlatformDisplayName = (post) => {
  if (!post || !post.platform) return 'Gallery';

  const strategy = createPlatformLink(post.platform);
  return strategy.getDisplayName();
};