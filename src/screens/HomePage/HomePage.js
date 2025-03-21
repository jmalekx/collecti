import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Linking, Text, TextInput, Image, TouchableOpacity } from 'react-native';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';
import { showToast, TOAST_TYPES } from '../../components/Toasts';
import AddButton from '../../components/AddButton';

// Import services instead of direct Firebase references
import { getUserProfile } from '../../services/users';
import { getAllCollections } from '../../services/collections';
import { createPost } from '../../services/posts';
import { getCurrentUserId } from '../../services/firebase';

const HomePage = ({ navigation }) => {
  const toast = useToast();
  const { shareIntent } = useShareIntentContext();
  const [url, setUrl] = useState(null);
  const [platform, setPlatform] = useState('gallery');
  const [userId, setUserId] = useState(null);
  const [collections, setCollections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    console.log("==== SHARE INTENT DEBUG ====");
    console.log("Share Intent Data:", shareIntent);
    
    const extractedUrl = shareIntent?.webUrl || shareIntent?.text;
    
    if (extractedUrl) {
      console.log("URL detected, setting URL state:", extractedUrl);
      setUrl(extractedUrl);
      detectPlatform(extractedUrl);
    }
    
    // Use current user ID from service
    const currentUserId = getCurrentUserId();
    if (currentUserId) {
      setUserId(currentUserId);
      fetchCollections(currentUserId);
      fetchUserProfile(currentUserId);
    }

    // Set up deep linking
    const urlEventListener = (event) => {
      handleDeepLink(event.url);
    };

    Linking.addEventListener('url', urlEventListener);
    
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      Linking.removeAllListeners('url');
    };
  }, [shareIntent]);

  const fetchUserProfile = async (userId) => {
    try {
      // Use the service instead of direct Firestore calls
      const userProfile = await getUserProfile(userId);
      
      if (userProfile) {
        setUserName(userProfile.username || 'User');
        setProfileImage(userProfile.profilePicture || null);
      } else {
        // Fallback to Auth data if no profile exists
        const auth = getAuth();
        setUserName(auth.currentUser?.displayName || 'User');
        setProfileImage(auth.currentUser?.photoURL || null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      showToast(toast, "Could not load profile", { type: TOAST_TYPES.WARNING });
    }
  };

  const fetchCollections = async (userId) => {
    try {
      // Use the service instead of direct Firestore calls
      const collectionsData = await getAllCollections(userId);
      setCollections(collectionsData);
      console.log("Collections fetched:", collectionsData);
    } catch (error) {
      console.error("Error fetching collections:", error);
      showToast(toast, "Could not load collections", { type: TOAST_TYPES.WARNING });
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
    console.log('Adding post with platform:', postPlatform);
  
    if (!postPlatform) {
      console.error("Error: platform is undefined");
      showToast(toast, "Platform is not set correctly", {type: TOAST_TYPES.WARNING});
      return;
    }
  
    try {
      // Use the createPost service from your services
      await createPost(selectedCollection, {
        notes: notes || '',
        tags: tags.split(',').map(tag => tag.trim()),
        originalUrl: image || '',
        platform: postPlatform,
        thumbnail: image || '',
        createdAt: new Date().toISOString(),
      });
      
      showToast(toast, "Post added successfully", { type: TOAST_TYPES.SUCCESS });
      
      // Refresh collections after adding a post
      if (userId) {
        fetchCollections(userId);
      }
    } catch (error) {
      console.error('Error adding post:', error);
      showToast(toast, "Failed to add post", { type: TOAST_TYPES.DANGER });
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Here you would implement the search functionality
    console.log("Searching for:", query);
  };

  return (
    <View style={styles.container}>
      {/* Header with greeting and profile image */}
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.username}>{userName}</Text>
        </View>
        
        <View style={styles.profileContainer}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.defaultProfileImage}>
            <Text style={styles.profileInitial}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search collections..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
      </View>
      <AddButton
      sharedUrl={url}
      platform={platform}
      collections={collections}
      onAddPost={handleAddPost}
      onAddCollection={(name, description) => {
        // Use the createCollection service here
        createCollection({ name, description })
          .then(() => {
            showToast(toast, "Collection created successfully", { type: TOAST_TYPES.SUCCESS });
            fetchCollections(userId); // Refresh collections
          })
          .catch(error => {
            console.error('Error adding collection:', error);
            showToast(toast, "Failed to create collection", { type: TOAST_TYPES.DANGER });
          });
      }}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  profileContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  defaultProfileImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 24,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
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