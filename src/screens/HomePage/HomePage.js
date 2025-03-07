import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
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
      fetchCollections(auth.currentUser.uid); // Fetch collections when user is authenticated
    }
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
      setPlatform('pinterest');
    } else if (url.includes('tiktok.com')) {
      setPlatform('tiktok');
    } else {
      setPlatform('gallery');
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
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [], // Ensure it's an array
        image: image || url || '', // Fallback to an empty string if missing
        platform: postPlatform || 'gallery',  // Ensure platform is always set
        createdAt: new Date().toISOString(),
        thumbnail: image || url || DEFAULT_THUMBNAIL, 
      };
  
      console.log("Post Data before sending:", postData); // Debugging log
  
      await addDoc(
        collection(FIREBASE_DB, 'users', userId, 'collections', selectedCollection, 'posts'),
        postData
      );
  
      toast.show("Post added successfully", {type: "success",});
    } catch (error) {
      console.error('Error adding post: ', error);
      toast.show("Failed to add post", {type: "danger",});
    }
  };
  
  


  return (
    <View style={styles.container}>
      {/* AddButton Component */}
      <AddButton
        onAddPost={handleAddPost}
        sharedUrl={url} // Pass the shared URL to AddButton
        platform={platform} // Pass the detected platform to AddButton
        collections={collections} // Pass the collections array
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
});

export default function App() {
  return (
    <ShareIntentProvider>
      <HomePage />
    </ShareIntentProvider>
  );
};