import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { ToastProvider } from 'react-native-toast-notifications';
import { toastConfig } from './src/components/Toasts';
import { Ionicons } from '@expo/vector-icons';

import { FIREBASE_AUTH, FIREBASE_DB } from './FirebaseConfig';
import { getDoc, doc } from 'firebase/firestore';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

import SignIn from './src/screens/SignIn';
import SignUp from './src/screens/SignUp/SignUp';
import Screen1 from './src/screens/SignUp/Screen1';
import Screen2 from './src/screens/SignUp/Screen2';
import Screen3 from './src/screens/SignUp/Screen3';
import Screen4 from './src/screens/SignUp/Screen4';
import HomePage from './src/screens/HomePage';
import Collections from './src/screens/Collections';
import CollectionDetails from './src/screens/Collections/CollectionDetails';
import EditPost from './src/screens/Posts/EditPost';
import PostDetails from './src/screens/Posts/PostDetails';
import UserSettings from './src/screens/UserSettings';
import EditProfile from './src/screens/UserSettings/EditProfile';
import EditCollection from './src/screens/Collections/EditCollection';
import SearchPage from './src/screens/Search/SearchPage';

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
    </Stack.Navigator>
  );
}

// Settings Stack
function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="UserSettings" component={UserSettings} options={{ headerShown: true, title: 'Settings' }} />
    </Stack.Navigator>
  );
}

// Search Stack
function SearchStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Search" component={SearchPage} options={{ headerShown: true, title: 'Search' }} />
    </Stack.Navigator>
  );
}

// Tab Navigator
function InsideLayout() {
  return (
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
          } else if (route.name === 'SettingsScreen') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="HomeScreen" component={HomeStack} options={{ headerShown: false, title: 'Home' }} />
      <Tab.Screen name="SearchScreen" component={SearchStack} options={{ headerShown: false, title: 'Search' }} />
      <Tab.Screen name="CollectionScreen" component={CollectionsStack} options={{ headerShown: false, title: 'Collections' }} />
      <Tab.Screen name="SettingsScreen" component={SettingsStack} options={{ headerShown: false, title: 'Settings' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(FIREBASE_DB, 'users', user.uid));
        const isNewUser = userDoc.data()?.isNewUser ?? true;
        setIsOnboarding(isNewUser);
      }
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  if (!fontsLoaded) {
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
      </ToastProvider>
    </>
  );
}