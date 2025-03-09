import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Linking } from 'react-native';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import { getAuth } from 'firebase/auth';
import { collection, query, getDocs, addDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../FirebaseConfig';
import AddButton from '../../components/AddButton';
import { useToast } from 'react-native-toast-notifications';
import pinterestService from '../../services/pinterest/pinterestServices';

const HomePage = () => {
  const toast = useToast();
  const { shareIntent } = useShareIntentContext();
  const [url, setUrl] = useState(null);
  const [platform, setPlatform] = useState('gallery');
  const [userId, setUserId] = useState(null);
  const [collections, setCollections] = useState([]);
  const [pinterestConnected, setPinterestConnected] = useState(false);

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

    // Check if already authenticated with Pinterest
    checkPinterestAuth();

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

  const checkPinterestAuth = async () => {
    try {
      const isAuthenticated = await pinterestService.isAuthenticated();
      setPinterestConnected(isAuthenticated);
      if (isAuthenticated) {
        console.log('User is already authenticated with Pinterest');
      }
    } catch (error) {
      console.error('Error checking Pinterest auth status:', error);
    }
  };

  const handleDeepLink = async (url) => {
    console.log('[Pinterest OAuth Debug] Received deep link:', url);
    
    if (url && url.includes('collecti://oauth/')) {
      try {
        console.log('[Pinterest OAuth Debug] Processing OAuth redirect URL');
        const result = await pinterestService.handleRedirect(url);
        
        if (result.success) {
          // Add token debug info
          const tokenInfo = await pinterestService.getCurrentToken();
          console.log('[Pinterest OAuth Debug] Token Info:', tokenInfo);
          
          setPinterestConnected(true);
          toast.show("Pinterest connected successfully!", { type: "success" });
        }
      } catch (error) {
        console.error('[Pinterest OAuth Debug] Error:', error);
        toast.show("Failed to connect Pinterest", { type: "error" });
      }
    }
  };

  const handlePinterestAuth = async () => {
    try {
      console.log('[Pinterest OAuth Debug] Starting Pinterest auth...');
      
      // Use the Pinterest service to get the authorization URL
      const authUrl = pinterestService.getAuthorizationUrl();
      console.log('[Pinterest OAuth Debug] Opening auth URL:', authUrl);
      
      // Open the authorization URL in the device's browser
      await Linking.openURL(authUrl);
    } catch (error) {
      console.error('[Pinterest OAuth Debug] Error:', error);
      toast.show("Failed to open Pinterest authorization", { type: "error" });
    }
  };

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

  const handlePinterestPin = async (url) => {
    try {
      console.log('Processing Pinterest pin:', url);
      // Any Pinterest-specific handling that doesn't involve setting modal state
    } catch (error) {
      console.error('Error processing Pinterest pin:', error);
      toast.show("Failed to process Pinterest pin", { type: "error" });
    }
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

  const handlePinterestDisconnect = async () => {
    try {
      await pinterestService.logout();
      setPinterestConnected(false);
      toast.show("Pinterest disconnected", { type: "success" });
    } catch (error) {
      console.error('Error disconnecting Pinterest:', error);
      toast.show("Failed to disconnect Pinterest", { type: "error" });
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

      <TouchableOpacity 
        style={[
          styles.pinterestButton, 
          pinterestConnected ? styles.pinterestConnected : {}
        ]}
        onPress={pinterestConnected ? handlePinterestDisconnect : handlePinterestAuth}>
        <Text style={styles.pinterestButtonText}>
          {pinterestConnected ? 'Disconnect Pinterest' : 'Connect Pinterest'}
        </Text>
      </TouchableOpacity>
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