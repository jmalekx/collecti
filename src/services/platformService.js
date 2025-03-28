//Third-party library external imports
import { Linking } from 'react-native';

/* 
    Platform Service Module

    For platform-specific operations providing centralised service
    for URL extraction and platform operations.
*/

//Extract URL helper
export const extractPostUrl = (post) => {
    if (!post) return null;
    return post.image || post.thumbnail || post.originalUrl || null;
};

//Platform Strategy Base Class
class PlatformLink {
    //Open URL in designated platform
    async openUrl(url) {
        throw new Error('Method not implemented');
    }

    isValidUrl(url) {
        return !!url;
    }

    getDisplayName() {
        throw new Error('Method not implemented');
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
        return !!url && url.includes('tiktok.com');
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

    getDisplayName() {
        return 'Pinterest';
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
        'default': new DefaultLink()
    };
    
    return strategies[platform] || strategies.default;
};

//Open post in native platform
export const openInPlatform = async (post) => {
    if (!post) throw new Error('Invalid post data');
    
    const url = extractPostUrl(post);
    if (!url) throw new Error('No URL available to open');
    
    const strategy = createPlatformLink(post.platform);
    return await strategy.openUrl(url);
};

//Determines if platform link should be shown
export const shouldShowPlatformLink = (post) => {
    if (!post || !post.platform) return false;
    
    //Only show platform links for social media platforms, not gallery
    return ['instagram', 'tiktok', 'pinterest'].includes(post.platform.toLowerCase());
  };

//Formatted platform name
export const getPlatformDisplayName = (post) => {
    if (!post || !post.platform) return 'Gallery';
    
    const strategy = createPlatformLink(post.platform);
    return strategy.getDisplayName();
};