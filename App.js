//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar } from 'react-native';

//Third-party library external imports
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native'; // Add this import
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ToastProvider, useToast } from 'react-native-toast-notifications';
import { toastConfig } from './src/components/Toasts';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';


//Project services and utilities
import { showToast, TOAST_TYPES } from './src/components/Toasts';
import { DEFAULT_THUMBNAIL } from './src/constants';

//Import service layers instead of direct Firebase imports
import { subscribeToAuthChanges } from './src/services/auth';
import { getUserProfile } from './src/services/users';

//Import modular navigation components
import TabNavigator from './src/navigation/TabNavigator';
import HomeStack from './src/navigation/stacks/HomeStack';
import CollectionsStack from './src/navigation/stacks/CollectionsStack';
import SearchStack from './src/navigation/stacks/SearchStack';
import BookmarksStack from './src/navigation/stacks/BookmarksStack';

//Import onboarding screens
import SignIn from './src/screens/SignIn/SignIn';
import SignUp from './src/screens/SignUp/SignUp';
import Screen1 from './src/screens/SignUp/Screen1';
import Screen2 from './src/screens/SignUp/Screen2';
import Screen3 from './src/screens/SignUp/Screen3';
import Screen4 from './src/screens/SignUp/Screen4';

import MainLayout from './src/components/MainLayout';

const Stack = createNativeStackNavigator();

//chant o export at the buttom of the file

export default function App() {
  const [user, setUser] = useState(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  // Subscribe to authentication state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      if (user) {
        setUser(user);
        
        try {
          // Check if user needs onboarding
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

  // Show loading indicator while initializing
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
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {user ? (
                // User is signed in
                <Stack.Group>
                  <Stack.Screen name="Inside" component={MainLayout} />
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