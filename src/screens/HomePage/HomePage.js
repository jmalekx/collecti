import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import { getAuth } from 'firebase/auth';
import { collection, doc, setDoc, addDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../FirebaseConfig';
import InstagramEmbed from '../APIs/InstagramEmbed';
import TikTokEmbed from '../APIs/TiktokEmbed';
// import AddButton from '../../components/AddButton';

const HomePage = () => {
  const { shareIntent } = useShareIntentContext();
  const [url, setUrl] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    console.log("Share Intent Data:", shareIntent);
    const extractedUrl = shareIntent?.webUrl || shareIntent?.text;
    if (extractedUrl) {
      console.log("Valid URL found:", extractedUrl);
      setUrl(extractedUrl); // Set the URL if found
      detectPlatform(extractedUrl); // Detect the platform
    } else {
      console.log("No valid URL found.");
    }

    const auth = getAuth();
    if (auth.currentUser) {
      setUserId(auth.currentUser.uid);
    }
  }, [shareIntent]);

  const detectPlatform = (url) => {
    if (url.includes('instagram.com')) {
      setPlatform('instagram');
    } else if (url.includes('pinterest.com')) {
      setPlatform('pinterest');
    } else if (url.includes('tiktok.com')) {
      setPlatform('tiktok');
    } else {
      setPlatform(null);
    }
  };

  const renderPlatformEmbed = () => {
    switch (platform) {
      case 'instagram':
        return <InstagramEmbed url={url} />;
      case 'pinterest':
        return <PinterestAPI url={url} />;
      case 'tiktok':
        return <TikTokEmbed url={url} />;
      default:
        return <Text>Unsupported platform or invalid URL.</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      {renderPlatformEmbed()}

      {/* AddButton Component */}
      {/* <View style={styles.addButtonContainer}>
        <AddButton />
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  // addButtonContainer: {
  //   flex: 1,
  //   justifyContent: 'flex-end', // Ensures the button is at the bottom
  // },
});

export default function App() {
  return (
    <ShareIntentProvider>
      <HomePage />
    </ShareIntentProvider>
  );
};