import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import InstagramEmbed from './InstagramEmbed';  // Assuming InstagramEmbed is another component

const Home = () => {
  const { shareIntent } = useShareIntentContext();  // Extract the shareIntent context
  const [url, setUrl] = useState(null);

  useEffect(() => {
    console.log("Share Intent Data:", shareIntent);

    const extractedUrl = shareIntent?.webUrl || shareIntent?.text;
    if (extractedUrl) {
      console.log("Valid URL found:", extractedUrl);
      setUrl(extractedUrl);  // Set the URL if found
    } else {
      console.log("No valid URL found.");
    }
  }, [shareIntent]);

  if (!url) {
    return <Text>No valid URL provided.</Text>;  // Return a fallback if URL is not found
  }

  return <InstagramEmbed url={url} />;
};

export default function App() {
  return (
    <ShareIntentProvider>
      <Home />
    </ShareIntentProvider>
  );
}
