//React and React Native core imports
import React from 'react';
import { View, Text, Image } from 'react-native';

//Project services and utilities
import { extractPostUrl } from '../../services/platformService';
import { isDirectPinterestImage } from '../../services/pinterest/pinterestHelpers';

//Custom component imports and styling
import InstagramEmbed from '../embeds/InstagramEmbed';
import TikTokEmbed from '../embeds/TiktokEmbed';
import YouTubeEmbed from '../embeds/YoutubeEmbed';
import PinterestEmbed from '../embeds/PinterestEmbed';
import poststyles from '../../styles/poststyles';

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
      <View style={poststyles.errorContainer}>
        <Text style={poststyles.errorText}>Unable to load content</Text>
      </View>
    );
  }

  //Instagram posts
  if (post.platform === 'instagram' && postUrl.includes('instagram.com')) {
    return (
      <View>
        <InstagramEmbed
          url={postUrl}
          style={poststyles.renderThumbnail}
          scale={0.1} />
      </View>
    );
  }

  //TikTok posts
  if (post.platform === 'tiktok' && postUrl.includes('tiktok.com')) {
    return (
      <View style={poststyles.embedContainer}>
        <TikTokEmbed
          url={postUrl}
          style={poststyles.renderThumbnail}
          scale={0.9}
          isInteractive={true} />
      </View>
    );
  }

  //Pinterest posts
  if (post.platform === 'pinterest' || postUrl.includes('pin.it') || postUrl.includes('pinterest.com')) {
    const isDirectImage = isDirectPinterestImage(postUrl);

    return (
      <View style={poststyles.embedContainer}>
        {isDirectImage ? (
          //For user own pins show  direct image
          <Image
            source={{ uri: postUrl }}
            style={poststyles.renderThumbnail}
            resizeMode="contain"
          />
        ) : (
          //For other pins use the embed
          <PinterestEmbed
            url={postUrl}
            style={poststyles.renderThumbnail}
            scale={1.15}
          />
        )}
      </View>
    );
  }

  //YouTube posts
  if (post.platform === 'youtube' && (postUrl.includes('youtube.com') || postUrl.includes('youtu.be'))) {
    return (
      <View style={poststyles.embedContainer}>
        <YouTubeEmbed
          url={postUrl}
          style={poststyles.renderThumbnail}
          scale={1.0}
          isInteractive={true} />
      </View>
    );
  }

  //Default image rendering
  return (
    <Image
      source={{ uri: postUrl }}
      style={poststyles.renderThumbnail}
      resizeMode="contain"
    />
  );
};

export default RenderPosts;