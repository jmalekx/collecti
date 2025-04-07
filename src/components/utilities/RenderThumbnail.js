//React and React Native core imports
import React from 'react';
import { View, Image } from 'react-native';

//Custom component imports and styling
import InstagramEmbed from '../embeds/InstagramEmbed';
import TikTokEmbed from '../embeds/TiktokEmbed';
import YouTubeEmbed from '../embeds/YoutubeEmbed';
import PinterestEmbed from '../embeds/PinterestEmbed';
import commonStyles from '../../styles/commonStyles';

/*
  RenderThumbnail Component
  
  Renders collection thumbnails with platform-specific handling.
  Parent components control layout and scale through props.
  
  Props:
  - thumbnail: URL of the thumbnail/embed
  - scale: Scale factor for embeds (default values by platform can be overridden)
  - containerStyle: Style for the container view (passed from parent)
  - thumbnailStyle: Style for the image/embed (passed from parent)
  
*/

const RenderThumbnail = ({ thumbnail, scale, containerStyle, thumbnailStyle }) => {
  if (!thumbnail) {
    return null;
  }

  //Instagram handling
  if (thumbnail && thumbnail.includes('instagram.com')) {
    return (
      <View style={[commonStyles.renderThmbContain, containerStyle]}>
        <InstagramEmbed
          url={thumbnail}
          style={thumbnailStyle}
          scale={scale || 0.1}
        />
      </View>
    );
  }

  //TikTok handling
  else if (thumbnail && thumbnail.includes('tiktok.com')) {
    return (
      <View style={[commonStyles.renderThmbContain, containerStyle]}>
        <TikTokEmbed
          url={thumbnail}
          style={thumbnailStyle}
          scale={scale || 0.3}
        />
      </View>
    );
  }

  //Pinterest handling
  else if (thumbnail && thumbnail.includes('pinterest.com') || thumbnail && thumbnail.includes('pin.it')) {
    return (
      <View style={[commonStyles.renderThmbContain, containerStyle]}>
        <PinterestEmbed
          url={thumbnail}
          style={thumbnailStyle}
          scale={scale || 0.45}
        />
      </View>
    );
  }

  //YouTube handling
  else if (thumbnail && (thumbnail.includes('youtube.com') || thumbnail.includes('youtu.be'))) {
    return (
      <View style={[commonStyles.renderThmbContain, containerStyle]}>
        <YouTubeEmbed
          url={thumbnail}
          style={thumbnailStyle}
          scale={scale || 0.3}
        />
      </View>
    );
  }

  //Default image handling
  else {
    return (
      <View style={[commonStyles.renderThmbContain, containerStyle]}>
        <Image
          source={{ uri: thumbnail }}
          style={thumbnailStyle}
        />
      </View>
    );
  }
};

export default RenderThumbnail;