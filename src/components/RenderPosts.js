//React and React Native core imports
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

//Project services and utilities
import InstagramEmbed from './InstagramEmbed';
import TikTokEmbed from './TiktokEmbed';
import YouTubeEmbed from './YoutubeEmbed';
import PinterestEmbed from './PinterestEmbed';
import { extractPostUrl } from '../services/platformService';
import { isDirectPinterestImage } from '../services/pinterest/pinterestHelpers';

/*
    Post Content Renderer Component
    
    Renders post content based on platform type with appropriate
    embeds and presentation logic.
*/

const RenderPosts = ({ post, toast }) => {
    if (!post) return null;

    //Use platform service for URL extraction
    const postUrl = extractPostUrl(post);

    if (!postUrl) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Unable to load content</Text>
            </View>
        );
    }

    //Instagram posts
    if (post.platform === 'instagram' && postUrl.includes('instagram.com')) {
        return (
            <View>
                <InstagramEmbed
                    url={postUrl}
                    style={styles.thumbnail}
                    scale={0.1} />
            </View>
        );
    }

    //TikTok posts
    if (post.platform === 'tiktok' && postUrl.includes('tiktok.com')) {
        return (
            <View style={styles.embedContainer}>
                <TikTokEmbed
                    url={postUrl}
                    style={styles.thumbnail}
                    scale={0.64}
                    isInteractive={true} />
            </View>
        );
    }

    //Pinterest posts
    if (post.platform === 'pinterest' || postUrl.includes('pin.it') || postUrl.includes('pinterest.com')) {
        const isDirectImage = isDirectPinterestImage(postUrl);
        
        return (
            <View style={styles.embedContainer}>
                {isDirectImage ? (
                    //For user own pins show  direct image
                    <Image
                        source={{ uri: postUrl }}
                        style={styles.thumbnail}
                        resizeMode="contain"
                    />
                ) : (
                    //For other pins use the embed
                    <PinterestEmbed
                        url={postUrl}
                        style={styles.thumbnail}
                        scale={1.15}
                    />
                )}
            </View>
        );
    }

    //YouTube posts
    if (post.platform === 'youtube' && (postUrl.includes('youtube.com') || postUrl.includes('youtu.be'))) {
        return (
            <View style={styles.embedContainer}>
                <YouTubeEmbed
                    url={postUrl}
                    style={styles.thumbnail}
                    scale={1.0}
                    isInteractive={true} />
            </View>
        );
    }

    //Default image rendering
    return (
        <Image
            source={{ uri: postUrl }}
            style={styles.thumbnail}
            resizeMode="contain"
        />
    );
};

const styles = StyleSheet.create({
    thumbnail: {
        width: '100%',
        height: 400,
        borderRadius: 12,
        marginBottom: 20,
    },
    embedContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        marginVertical: 10,
    },
    errorText: {
        color: '#666',
        fontSize: 16,
    },
    linkText: {
        color: '#007AFF',
        textAlign: 'center',
        marginBottom: 16,
        textDecorationLine: 'underline',
    }
});

export default RenderPosts;