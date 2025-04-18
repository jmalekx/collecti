//React and React Native core imports
import React, { useState, useEffect, useRef } from 'react';
import { View } from 'react-native';

//Third-party library external imports
import { useToast } from 'react-native-toast-notifications';
import { useShareIntentContext } from 'expo-share-intent';

//Project services and utilities
import { showToast, TOAST_TYPES } from '../utilities/Toasts';
import { getAllCollections, createCollection, updateCollection } from '../../services/collections';
import { createPost } from '../../services/posts';
import { getCurrentUserId } from '../../services/firebase';
import { DEFAULT_THUMBNAIL } from '../../constants';

//Custom component imports and styling
import TabNavigator from '../../navigation/TabNavigator';
import AddButton from '../layout/AddButton';
import UnsupportedPlatformModal from '../modals/UnsupportedPlatformModal';

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
  const [unsupportedModalVisible, setUnsupportedModalVisible] = useState(false);
  const [unsupportedPlatformName, setUnsupportedPlatformName] = useState('this app');
  const addButtonRef = useRef(null);


  //Context states
  const toast = useToast();

  useEffect(() => {
    if (userId) {
      fetchCollections();
    }

    if (shareIntent?.webUrl || shareIntent?.text) {
      const extractedUrl = shareIntent?.webUrl || shareIntent?.text;
      setUrl(extractedUrl);
      const detectedPlatform = detectPlatform(extractedUrl);

      //Automatically open post creation modal for supported platforms
      if (['instagram', 'tiktok', 'pinterest', 'youtube'].includes(detectedPlatform)) {
        //Allow time for collections load
        setTimeout(() => {
          //Trigger the post creation modal
          if (addButtonRef.current) {
            addButtonRef.current.openPostModal();
          }
        }, 500);
      }
    }
  }, [userId, shareIntent]);

  //Fetch collections using collections service
  const fetchCollections = async () => {
    try {
      const collectionsData = await getAllCollections(userId);
      setCollections(collectionsData);
    }
    catch (error) {
      if (toast) {
        showToast(toast, "Could not load collections", { type: TOAST_TYPES.WARNING });
      }
    }
  };

  //Detecting which platform a shared URL belongs to
  const detectPlatform = (url) => {
    if (!url) return;

    //Lowercase and trim URL for consistency
    const normalizedUrl = url.toLowerCase().trim();

    //List of supported platforms
    const supportedPlatforms = [
      { name: 'instagram', patterns: ['instagram.com'] },
      { name: 'tiktok', patterns: ['tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'] },
      { name: 'pinterest', patterns: ['pinterest.com', 'pin.it'] },
      { name: 'youtube', patterns: ['youtube.com', 'youtu.be'] },
    ];

    //Check if the URL matches supported platforms
    for (const platform of supportedPlatforms) {
      if (platform.patterns.some(pattern => normalizedUrl.includes(pattern))) {
        setPlatform(platform.name);
        return platform.name;
      }
    }

    //If unsupported platform, show modal - try extract for better ux
    let detectedPlatformName = 'this app';

    //Other common platforms to check for
    if (normalizedUrl.includes('twitter.com') || normalizedUrl.includes('x.com')) {
      detectedPlatformName = 'Twitter/X';
    }
    else if (normalizedUrl.includes('facebook.com')) {
      detectedPlatformName = 'Facebook';
    }
    else if (normalizedUrl.includes('snapchat.com')) {
      detectedPlatformName = 'Snapchat';
    }
    else if (normalizedUrl.includes('reddit.com')) {
      detectedPlatformName = 'Reddit';
    }
    else {
      //Try extract domain name
      try {
        const urlObj = new URL(normalizedUrl);
        detectedPlatformName = urlObj.hostname.replace('www.', '');
      }
      catch (error) {
        //If URL parsing fails, use generic name
        detectedPlatformName = "this app";
      }
    }

    //Show the unsupported platform modal
    setUnsupportedPlatformName(detectedPlatformName);
    setUnsupportedModalVisible(true);

    //Set platform to 'unsupported'
    setPlatform('unsupported');
    return 'unsupported';
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
  const handleAddPost = async (notes, tags, image, selectedCollection, postPlatform, sourceUrl) => {
    try {
      let thumbnail = processContentThumbnail(image, postPlatform);

      //Prepare post data
      const postData = {
        notes,
        tags: tags ? tags.split(',').map((tag) => tag.trim()).filter(tag => tag) : [],
        image,
        platform: postPlatform,
        thumbnail,
        sourceUrl,
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

      fetchCollections();
      return newCollection.id;
    }
    catch (error) {
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
        ref={addButtonRef}
        collections={collections}
        sharedUrl={url}
        platform={platform}
        onAddPost={handleAddPost}
        onCreateCollection={handleCreateCollection}
      />

      {/* Unsupported Platform Modal */}
      <UnsupportedPlatformModal
        visible={unsupportedModalVisible}
        onClose={() => setUnsupportedModalVisible(false)}
        platformName={unsupportedPlatformName}
      />
    </View>
  );
};

export default MainLayout;