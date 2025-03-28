//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';

//Third-party library external imports
import { useToast } from 'react-native-toast-notifications';
import { useShareIntentContext } from 'expo-share-intent';

//Project services and utilities
import { showToast, TOAST_TYPES } from './Toasts';
import { getAllCollections, createCollection, updateCollection } from '../services/collections';
import { createPost } from '../services/posts';
import { getCurrentUserId } from '../services/firebase';
import { DEFAULT_THUMBNAIL } from '../constants';

//Custom component imports and styling
import TabNavigator from '../navigation/TabNavigator';
import AddButton from './AddButton';

/*
  MainLayout Component

  Contains tab navigator and floating add button for the entire app
  Manages shared state and content operations for the app.
*/

const MainLayout = () => {
  //Content managing
  const [url, setUrl] = useState(null);
  const userId = getCurrentUserId();
  const { shareIntent } = useShareIntentContext();

  //State transition
  const [collections, setCollections] = useState([]);
  const [platform, setPlatform] = useState('gallery');

  //Context states
  const toast = useToast();

  useEffect(() => {
    if (userId) {
      fetchCollections();
    }

    if (shareIntent?.webUrl || shareIntent?.text) {
      const extractedUrl = shareIntent?.webUrl || shareIntent?.text;
      setUrl(extractedUrl);
      detectPlatform(extractedUrl);
    }
  }, [userId, shareIntent]);

  //Fetch collections using collections service
  const fetchCollections = async () => {
    try {
      const collectionsData = await getAllCollections(userId);
      setCollections(collectionsData);
    } 
    catch (error) {
      console.error("Error fetching collections:", error);
      if (toast) {
        showToast(toast, "Could not load collections", { type: TOAST_TYPES.WARNING });
      }
    }
  };

  //Detecting which platform a shared URL belongs to
  const detectPlatform = (url) => {
    if (!url) return;

    setCurrentUrl(url);
  
    //Lowercase and trim the URL for consistency
    const lowerUrl = url.toLowerCase().trim();

    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      setPlatform('youtube');
      console.log('Platform set to: youtube');
    } 
    else if (lowerUrl.includes('instagram.com')) {
      setPlatform('instagram');
      console.log('Platform set to: instagram');
    } 
    else if (lowerUrl.includes('pinterest.com')) {
      setPlatform('pinterest');
      console.log('Platform set to: pinterest');
    } 
    else if (lowerUrl.includes('tiktok.com')) {
      setPlatform('tiktok');
      console.log('Platform set to: tiktok');
    } 
    else {
      setPlatform('gallery');
      console.log('Platform set to: gallery (default)');
    }
  };

  //Process thumbnail from URL based on platform
  const processContentThumbnail = (url, platform) => {
    if (!url) return DEFAULT_THUMBNAIL;

    //Process Instagram URLs
    if (platform === 'instagram' && url.includes('instagram.com')) {
      let postId;
      if (url.includes('/p/')) {
        const parts = url.split('/');
        const pIndex = parts.indexOf('p');
        if (pIndex !== -1 && parts.length > pIndex + 1) {
          postId = parts[pIndex + 1];
        }
      } 
      else if (url.includes('instagram.com')) {
        const match = url.match(/instagram\.com\/(?:p|reel)\/([^\/\?]+)/);
        postId = match ? match[1] : null;
      }

      if (postId) {
        postId = postId.split('?')[0].split('/')[0];
        return `https://www.instagram.com/p/${postId}/embed`;
      }
    }

    return url;
  };

  //Handle post creation using posts service
  const handleAddPost = async (notes, tags, image, selectedCollection, postPlatform) => {
    try {
      let thumbnail = processContentThumbnail(image, postPlatform);

      //Prepare post data
      const postData = {
        notes,
        tags: tags ? tags.split(',').map((tag) => tag.trim()).filter(tag => tag) : [],
        image,
        platform: postPlatform,
        thumbnail,
      };

      //Use posts service to create post
      await createPost(selectedCollection, postData);

      //Update collection thumbnail if needed
      const collection = collections.find(c => c.id === selectedCollection);
      if (collection && (!collection.thumbnail || collection.thumbnail === DEFAULT_THUMBNAIL)) {
        await updateCollection(selectedCollection, { thumbnail });
      }

      if (toast) {
        showToast(toast, "Post added successfully", { type: TOAST_TYPES.SUCCESS });
      }

      fetchCollections();
      setUrl(null);

      return true;
    } 
    catch (error) {
      console.error('Error adding post:', error);
      if (toast) {
        showToast(toast, "Failed to add post", { type: TOAST_TYPES.DANGER });
      }
      return false;
    }
  };

  //Handle collection creation 
  const handleCreateCollection = async (name, description) => {
    try {
      const newCollection = await createCollection({
        name,
        description,
        createdAt: new Date().toISOString(),
        thumbnail: DEFAULT_THUMBNAIL,
      });

      if (toast) {
        showToast(toast, "Collection created successfully", { type: TOAST_TYPES.SUCCESS });
      }

      fetchCollections();
      return newCollection.id;
    } 
    catch (error) {
      console.error('Error adding collection:', error);
      if (toast) {
        showToast(toast, "Failed to create collection", { type: TOAST_TYPES.DANGER });
      }
      return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TabNavigator />
      <AddButton
        collections={collections}
        sharedUrl={url}
        platform={platform}
        onAddPost={handleAddPost}
        onCreateCollection={handleCreateCollection}
      />
    </View>
  );
};

export default MainLayout;