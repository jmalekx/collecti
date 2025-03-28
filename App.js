//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar } from 'react-native';

//Third-party library external imports
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { ToastProvider, useToast } from 'react-native-toast-notifications';
import { toastConfig } from './src/components/Toasts';
import { Ionicons } from '@expo/vector-icons';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

//Project services and utilities
import { showToast, TOAST_TYPES } from './src/components/Toasts';
import { DEFAULT_THUMBNAIL } from './src/constants';

// Import service layers instead of direct Firebase imports
import { subscribeToAuthChanges } from './src/services/auth';
import { getUserProfile } from './src/services/users';
import { getAllCollections, createCollection, updateCollection } from './src/services/collections';
import { createPost } from './src/services/posts';
import { getCurrentUserId } from './src/services/firebase';

//Screen imports
import SignIn from './src/screens/SignIn/SignIn';
import SignUp from './src/screens/SignUp/SignUp';
import Screen1 from './src/screens/SignUp/Screen1';
import Screen2 from './src/screens/SignUp/Screen2';
import Screen3 from './src/screens/SignUp/Screen3';
import Screen4 from './src/screens/SignUp/Screen4';
import HomePage from './src/screens/HomePage/HomePage';
import Collections from './src/screens/Collections/Collections';
import CollectionDetails from './src/screens/Collections/CollectionDetails';
import EditPost from './src/screens/Collections/Posts/EditPost';
import PostDetails from './src/screens/Collections/Posts/PostDetails';
import UserSettings from './src/screens/Collections/UserSettings/UserSettings';
import EditProfile from './src/screens/Collections/UserSettings/EditProfile';
import EditCollection from './src/screens/Collections/EditCollection';
import SearchPage from './src/screens/Search/SearchPage';
import Bookmarks from './src/screens/Bookmarks/Bookmarks';
import AddButton from './src/components/AddButton';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

//Home Stack
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
      <Stack.Screen name="PostDetails" component={PostDetails} options={{ headerShown: false }} />
      <Stack.Screen name="EditPost" component={EditPost} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

//Collections Stack
function CollectionsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Collections" component={Collections} options={{ headerShown: true }} />
      <Stack.Screen name="CollectionDetails" component={CollectionDetails} options={{ headerShown: false }} />
      <Stack.Screen name="EditCollection" component={EditCollection} options={{ headerShown: false }} />
      <Stack.Screen name="PostDetails" component={PostDetails} options={{ headerShown: false }} />
      <Stack.Screen name="EditPost" component={EditPost} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: true, title: 'Edit Profile' }} />
      <Stack.Screen name="UserSettings" component={UserSettings} options={{ headerShown: true, title: 'Settings' }} />
    </Stack.Navigator>
  );
}

//Bookmarks Stack
function BookmarksStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Bookmarks" component={Bookmarks} options={{ headerShown: true, title: 'Bookmarks' }} />
      <Stack.Screen name="CollectionDetails" component={CollectionDetails} options={{ headerShown: false }} />
      <Stack.Screen name="PostDetails" component={PostDetails} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

//Search Stack
function SearchStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Search" component={SearchPage} options={{ headerShown: true, title: 'Search' }} />
      <Stack.Screen name="CollectionDetails" component={CollectionDetails} options={{ headerShown: false }} />
      <Stack.Screen name="PostDetails" component={PostDetails} options={{ headerShown: false }} />
      <Stack.Screen name="EditCollection" component={EditCollection} options={{ headerShown: false }} />
      <Stack.Screen name="EditPost" component={EditPost} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

//Tab Navigator
function InsideLayout() {

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

  // Fetch collections using collections service
  const fetchCollections = async () => {
    try {
      const collectionsData = await getAllCollections(userId);
      setCollections(collectionsData);
    } catch (error) {
      console.error("Error fetching collections:", error);
      if (toast) {
        showToast(toast, "Could not load collections", { type: TOAST_TYPES.WARNING });
      }
    }
  };

  const detectPlatform = (url) => {
    if (!url) return;

    if (url.includes('instagram.com')) {
      setPlatform('instagram');
    } else if (url.includes('pinterest.com')) {
      setPlatform('pinterest');
    } else if (url.includes('tiktok.com')) {
      setPlatform('tiktok');
    } else {
      setPlatform('gallery');
    }
  };

  // Process thumbnail from URL based on platform
  const processContentThumbnail = (url, platform) => {
    if (!url) return DEFAULT_THUMBNAIL;
    
    // Process Instagram URLs
    if (platform === 'instagram' && url.includes('instagram.com')) {
      let postId;
      if (url.includes('/p/')) {
        const parts = url.split('/');
        const pIndex = parts.indexOf('p');
        if (pIndex !== -1 && parts.length > pIndex + 1) {
          postId = parts[pIndex + 1];
        }
      } else if (url.includes('instagram.com')) {
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

  // Handle post creation using posts service
  const handleAddPost = async (notes, tags, image, selectedCollection, postPlatform) => {
    try {
      let thumbnail = processContentThumbnail(image, postPlatform);
      
      // Prepare post data
      const postData = {
        notes,
        tags: tags ? tags.split(',').map((tag) => tag.trim()).filter(tag => tag) : [],
        image,
        platform: postPlatform,
        thumbnail,
      };

      // Use posts service to create post
      await createPost(selectedCollection, postData);

      // Update collection thumbnail if needed
      // This should ideally be handled in the createPost service
      // but we'll use updateCollection as a workaround
      const collection = collections.find(c => c.id === selectedCollection);
      if (collection && (!collection.thumbnail || collection.thumbnail === DEFAULT_THUMBNAIL)) {
        await updateCollection(selectedCollection, { thumbnail });
      }

      if (toast) {
        showToast(toast, "Post added successfully", { type: TOAST_TYPES.SUCCESS });
      }

      // Refresh collections and reset share data
      fetchCollections();
      setUrl(null);

      return true;
    } catch (error) {
      console.error('Error adding post:', error);
      if (toast) {
        showToast(toast, "Failed to add post", { type: TOAST_TYPES.DANGER });
      }
      return false;
    }
  };

  // Handle collection creation using collections service
  const handleCreateCollection = async (name, description) => {
    try {
      // Use collections service to create collection
      const newCollection = await createCollection({
        name,
        description,
        createdAt: new Date().toISOString(),
        thumbnail: DEFAULT_THUMBNAIL,
      });

      if (toast) {
        showToast(toast, "Collection created successfully", { type: TOAST_TYPES.SUCCESS });
      }

      // Refresh collections
      fetchCollections();
      return newCollection.id;
    } catch (error) {
      console.error('Error adding collection:', error);
      if (toast) {
        showToast(toast, "Failed to create collection", { type: TOAST_TYPES.DANGER });
      }
      return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'HomeScreen') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'CollectionScreen') {
              iconName = focused ? 'grid' : 'grid-outline';
            } else if (route.name === 'SearchScreen') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'BookmarkScreen') {
              iconName = focused ? 'bookmark' : 'bookmark-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            height: 60,
            paddingBottom: 5
          },
        })}
      >
        <Tab.Screen name="HomeScreen" component={HomeStack} options={{ headerShown: false, title: 'Home' }} />
        <Tab.Screen name="SearchScreen" component={SearchStack} options={{ headerShown: false, title: 'Search' }} />
        <Tab.Screen name="BookmarkScreen" component={BookmarksStack} options={{ headerShown: false, title: 'Bookmarks' }} />
        <Tab.Screen name="CollectionScreen" component={CollectionsStack} options={{ headerShown: false, title: 'Collections' }} />
      </Tab.Navigator>

      {/* AddButton with proper functionality */}
      <AddButton
        collections={collections}
        sharedUrl={url}
        platform={platform}
        onAddPost={handleAddPost}
        onCreateCollection={handleCreateCollection}
      />
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  // Use auth service instead of direct Firebase access
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      if (user) {
        setUser(user);
        
        try {
          // Use user service to check onboarding status
          const userProfile = await getUserProfile(user.uid);
          setIsOnboarding(userProfile?.isNewUser ?? true);
        } catch (error) {
          console.error("Error checking user onboarding status:", error);
          setIsOnboarding(false);
        }
      } else {
        setUser(null);
        setIsOnboarding(false);
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  // Loading state and UI rendering remain unchanged
  if (!fontsLoaded || initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F6F2" translucent={false} />
      <ToastProvider
        placement="top"
        duration={4000}
        offsetTop={20}
        renderType={{
          success: (toast) => (
            <View style={[toastConfig.containerStyle, toastConfig.success]}>
              <Text style={[toastConfig.textStyle, { color: toastConfig.success.color }]}>
                {toast.message}
              </Text>
            </View>
          ),
          danger: (toast) => (
            <View style={[toastConfig.containerStyle, toastConfig.danger]}>
              <Text style={[toastConfig.textStyle, { color: toastConfig.danger.color }]}>
                {toast.message}
              </Text>
            </View>
          ),
          warning: (toast) => (
            <View style={[toastConfig.containerStyle, toastConfig.warning]}>
              <Text style={[toastConfig.textStyle, { color: toastConfig.warning.color }]}>
                {toast.message}
              </Text>
            </View>
          ),
          info: (toast) => (
            <View style={[toastConfig.containerStyle, toastConfig.info]}>
              <Text style={[toastConfig.textStyle, { color: toastConfig.info.color }]}>
                {toast.message}
              </Text>
            </View>
          ),
        }}
      >
       <ShareIntentProvider>
          <NavigationContainer>
            {/* KEY FIX: Use conditional rendering instead of initialRouteName */}
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {user ? (
                // User is signed in
                <Stack.Group>
                  <Stack.Screen name="Inside" component={InsideLayout} />
                  {isOnboarding && (
                    <Stack.Group>
                      <Stack.Screen name="Screen1" component={Screen1} />
                      <Stack.Screen name="Screen2" component={Screen2} />
                      <Stack.Screen name="Screen3" component={Screen3} />
                      <Stack.Screen name="Screen4" component={Screen4} />
                    </Stack.Group>
                  )}
                </Stack.Group>
              ) : (
                // No user, show auth screens
                <Stack.Group>
                  <Stack.Screen name="SignIn" component={SignIn} />
                  <Stack.Screen 
                    name="SignUp" 
                    component={SignUp} 
                    options={{ headerShown: true }}
                  />
                </Stack.Group>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </ShareIntentProvider>
      </ToastProvider>
    </>
  );
}
const styles = {
  container: {
    flex: 1,
    position: 'relative',
  },
};