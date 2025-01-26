import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import InstagramEmbed from './InstagramEmbed.js';
import PinterestAPI from './PinterestAPI.js';
import TiktokEmbed from './TiktokEmbed.js';
// import YoutubeAPI from './YoutubeAPI';


const Home = () => {
  const { shareIntent } = useShareIntentContext();  // Extract the shareIntent context
  const [url, setUrl] = useState(null);
  const [platform, setPlatform] = useState(null);

  useEffect(() => {
    console.log("Share Intent Data:", shareIntent);

    const extractedUrl = shareIntent?.webUrl || shareIntent?.text;
    if (extractedUrl) {
      console.log("Valid URL found:", extractedUrl);
      setUrl(extractedUrl);  // Set the URL if found
      detectPlatform(extractedUrl);  // Detect the platform
    } else {
      console.log("No valid URL found.");
    }
  }, [shareIntent]);

  const detectPlatform = (url) => {
    if (url.includes('instagram.com')) {
      setPlatform('instagram');
    } else if (url.includes('pinterest.com')) {
      setPlatform('pinterest');
    // } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    //   setPlatform('youtube');
    } else if (url.includes('tiktok.com')) {
      setPlatform('tiktok');
    } else {
      setPlatform(null);
    }
  };

  if (!url) {
    return <Text>No valid URL provided.</Text>;  // Return a fallback if URL is not found
  }

  switch (platform) {
    case 'instagram':
      return <InstagramEmbed url={url} />;
    case 'pinterest':
      return <PinterestAPI url={url} />;
    // case 'youtube':
    //   return <YoutubeAPI url={url} />;
    case 'tiktok':
      return <TiktokEmbed url={url} />;
    default:
      return <Text>Unsupported platform or invalid URL.</Text>;
  }
};

export default function App() {
  return (
    <ShareIntentProvider>
      <Home />
    </ShareIntentProvider>
  );
}