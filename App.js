import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { ToastProvider, useToast } from 'react-native-toast-notifications';
import { toastConfig } from './src/components/Toasts';
import { Ionicons } from '@expo/vector-icons';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';

import { FIREBASE_AUTH, FIREBASE_DB } from './FirebaseConfig';
import { getDoc, doc, collection, addDoc, updateDoc, getDocs } from 'firebase/firestore';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { showToast, TOAST_TYPES } from './src/components/Toasts';
import { DEFAULT_THUMBNAIL } from './src/constants';

import SignIn from './src/screens/SignIn';
import SignUp from './src/screens/SignUp/SignUp';
import Screen1 from './src/screens/SignUp/Screen1';
import Screen2 from './src/screens/SignUp/Screen2';
import Screen3 from './src/screens/SignUp/Screen3';
import Screen4 from './src/screens/SignUp/Screen4';
import HomePage from './src/screens/HomePage';
import Collections from './src/screens/Collections';
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

// Home Stack
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
      <Stack.Screen name="PostDetails" component={PostDetails} options={{ headerShown: false }} />
      <Stack.Screen name="EditPost" component={EditPost} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// Collections Stack
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

// Settings Stack
function BookmarksStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Bookmarks" component={Bookmarks} options={{ headerShown: true, title: 'Bookmarks' }} />
      <Stack.Screen name="CollectionDetails" component={CollectionDetails} options={{ headerShown: false }} />
      <Stack.Screen name="PostDetails" component={PostDetails} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// Search Stack
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

// Tab Navigator with AddButton functionality
function InsideLayout() {
  const [collections, setCollections] = useState([]);
  const [url, setUrl] = useState(null);
  const [platform, setPlatform] = useState('gallery');
  const { shareIntent } = useShareIntentContext();
  const userId = FIREBASE_AUTH.currentUser?.uid;

  // Toast provider for notifications
  const toast = useToast();

  // Fetch collections when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      fetchCollections();
    }

    // Handle share intent data
    if (shareIntent?.webUrl || shareIntent?.text) {
      const extractedUrl = shareIntent?.webUrl || shareIntent?.text;
      setUrl(extractedUrl);
      detectPlatform(extractedUrl);
    }
  }, [userId, shareIntent]);

  const fetchCollections = async () => {
    try {
      const collectionSnapshot = await getDocs(collection(FIREBASE_DB, 'users', userId, 'collections'));
      const collectionsData = collectionSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
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

  const handleAddPost = async (notes, tags, image, selectedCollection, postPlatform) => {
    try {
      let thumbnail = image || DEFAULT_THUMBNAIL;
      let originalUrl = image;

      // Process Instagram URLs
      if (postPlatform === 'instagram' && image && image.includes('instagram.com')) {
        let postId;
        if (image.includes('/p/')) {
          const parts = image.split('/');
          const pIndex = parts.indexOf('p');
          if (pIndex !== -1 && parts.length > pIndex + 1) {
            postId = parts[pIndex + 1];
          }
        } else if (image.includes('instagram.com')) {
          const match = image.match(/instagram\.com\/(?:p|reel)\/([^\/\?]+)/);
          postId = match ? match[1] : null;
        }

        if (postId) {
          postId = postId.split('?')[0].split('/')[0];
          thumbnail = `https://www.instagram.com/p/${postId}/embed`;
        }
      }

      const postData = {
        notes,
        tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
        image: originalUrl,
        platform: postPlatform,
        createdAt: new Date().toISOString(),
        thumbnail,
      };

      const postsRef = collection(
        FIREBASE_DB,
        'users',
        userId,
        'collections',
        selectedCollection,
        'posts'
      );

      await addDoc(postsRef, postData);

      // Update collection thumbnail if needed
      const collectionRef = doc(FIREBASE_DB, 'users', userId, 'collections', selectedCollection);
      const collectionDoc = await getDoc(collectionRef);

      if (!collectionDoc.data()?.thumbnail || collectionDoc.data().thumbnail === DEFAULT_THUMBNAIL) {
        await updateDoc(collectionRef, { thumbnail });
      }

      if (toast) {
        showToast(toast, "Post added successfully", { type: TOAST_TYPES.SUCCESS });
      }

      // Refresh collections
      fetchCollections();

      // Reset share intent data after successful post
      setUrl(null);

      return true;
    } catch (error) {
      console.error('Error adding post: ', error);
      if (toast) {
        showToast(toast, "Failed to add post", { type: TOAST_TYPES.DANGER });
      }
      return false;
    }
  };

  const handleCreateCollection = async (name, description) => {
    try {
      const docRef = await addDoc(collection(FIREBASE_DB, 'users', userId, 'collections'), {
        name,
        description,
        createdAt: new Date().toISOString(),
        items: [],
        thumbnail: DEFAULT_THUMBNAIL,
      });

      if (toast) {
        showToast(toast, "Collection created successfully", { type: TOAST_TYPES.SUCCESS });
      }

      // Refresh collections
      fetchCollections();

      return docRef.id;
    } catch (error) {
      console.error('Error adding collection: ', error);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        // Set user state
        setUser(user);

        // Check if user needs onboarding
        try {
          const userDoc = await getDoc(doc(FIREBASE_DB, 'users', user.uid));
          const isNewUser = userDoc.exists() ? userDoc.data()?.isNewUser ?? true : true;
          setIsOnboarding(isNewUser);
        } catch (error) {
          console.error("Error checking user onboarding status:", error);
          setIsOnboarding(false); // Default to no onboarding if error
        }
      } else {
        setUser(null);
        setIsOnboarding(false);
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

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
            <Stack.Navigator initialRouteName="SignIn">
              {user ? (
                <>
                  <Stack.Screen name="Inside" component={InsideLayout} options={{ headerShown: false }} />
                  {isOnboarding && (
                    <>
                      <Stack.Screen name="Screen1" component={Screen1} options={{ headerShown: false }} />
                      <Stack.Screen name="Screen2" component={Screen2} options={{ headerShown: false }} />
                      <Stack.Screen name="Screen3" component={Screen3} options={{ headerShown: false }} />
                      <Stack.Screen name="Screen4" component={Screen4} options={{ headerShown: false }} />
                    </>
                  )}
                </>
              ) : (
                <>
                  <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }} />
                  <Stack.Screen name="SignUp" component={SignUp} />
                </>
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