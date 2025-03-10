import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import { getAuth } from 'firebase/auth';
import { collection, query, getDocs, addDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../FirebaseConfig';
import AddButton from '../../components/AddButton';
import { useToast } from 'react-native-toast-notifications';

const HomePage = () => {
  const toast = useToast();
  const { shareIntent } = useShareIntentContext();
  const [url, setUrl] = useState(null);
  const [platform, setPlatform] = useState('gallery');
  const [userId, setUserId] = useState(null);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    console.log("==== SHARE INTENT DEBUG ====");
    console.log("Share Intent Data:", shareIntent);
    console.log("Share Intent Type:", typeof shareIntent);
    
    const extractedUrl = shareIntent?.webUrl || shareIntent?.text;
    console.log("Extracted URL:", extractedUrl);
    
    if (extractedUrl) {
      console.log("URL detected, setting URL state:", extractedUrl);
      setUrl(extractedUrl);
      console.log("Detecting platform for URL:", extractedUrl);
      detectPlatform(extractedUrl);
    } else {
      console.log("No valid URL found in share intent.");
    }
    

    const auth = getAuth();
    if (auth.currentUser) {
      setUserId(auth.currentUser.uid);
      fetchCollections(auth.currentUser.uid); // Fetch collections when user is authenticated
    }

    // Set up the URL event listener for deep linking
    const urlEventListener = (event) => {
      handleDeepLink(event.url);
    };

    Linking.addEventListener('url', urlEventListener);

    // Check for any initial URL (app opened through deep link)
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      Linking.removeAllListeners('url');
    };
  }, [shareIntent]);

  const fetchCollections = async (userId) => {
    try {
      const q = query(collection(FIREBASE_DB, 'users', userId, 'collections'));
      const querySnapshot = await getDocs(q);
      const collectionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCollections(collectionsData); // Update collections state
      console.log("Collections fetched:", collectionsData);
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  const detectPlatform = (url) => {
    if (url.includes('instagram.com')) {
      console.log("Platform detected: Instagram");
      setPlatform('instagram');
      // Extract the actual Instagram post URL from the intent URL
      const intentUrl = new URL(url);
      const fallbackUrl = intentUrl.searchParams.get('S.browser_fallback_url');
      if (fallbackUrl) {
        const decodedUrl = decodeURIComponent(fallbackUrl);
        const instagramUrl = new URL(decodedUrl).searchParams.get('referrer');
        if (instagramUrl) {
          setUrl(instagramUrl);
        }
      }
    } else if (url.includes('pinterest.com')) {
      console.log("Platform detected: Pinterest");
      setPlatform('pinterest');
      console.log("Platform state set to Pinterest");
    } else if (url.includes('tiktok.com')) {
      console.log("Platform detected: TikTok");
      setPlatform('tiktok');
    } else {
      console.log("Platform detected: gallery (default)");
      setPlatform('gallery');
    }
    console.log("Final platform value:", platform);
  };

  const handleAddPost = async (notes, tags, image, selectedCollection, postPlatform) => {
    console.log('Adding post with platform:', postPlatform); // Debug log
  
    if (!postPlatform) {
      console.error("Error: platform is undefined");
      toast.show("Platform is not set correctly", {type: "warning",});
      return;
    }
  
    try {
      const postData = {
        notes: notes || '', 
        tags: tags.split(',').map(tag => tag.trim()), // Convert tags string to array
        image: image || '', // Store the original URL
        platform: postPlatform,
        createdAt: new Date().toISOString(),
        thumbnail: image || '', // Store the embed URL or image URL as thumbnail
      };

      const postsRef = collection(FIREBASE_DB, 'users', userId, 'collections', selectedCollection, 'posts');
      await addDoc(postsRef, postData);
      toast.show("Post added successfully", { type: "success" });
    } catch (error) {
      console.error('Error adding post:', error);
      toast.show("Failed to add post", { type: "danger" });
    }
  };

  return (
    <View style={styles.container}>
      <AddButton 
        sharedUrl={url} // Pass the shared URL to AddButton
        platform={platform} // Pass the detected platform to AddButton
        collections={collections} // Pass the collections array
        onAddPost={handleAddPost}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  pinterestButton: {
    backgroundColor: '#E60023',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  pinterestConnected: {
    backgroundColor: '#666',
  },
  pinterestButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default function App() {
  return (
    <ShareIntentProvider>
      <HomePage />
    </ShareIntentProvider>
  );
}