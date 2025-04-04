//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar } from 'react-native';

//Third-party library external imports
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native'; // Add this import
import { ToastProvider } from 'react-native-toast-notifications';
import { toastConfig } from './src/components/Toasts';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

//Project services and utilities
import { subscribeToAuthChanges } from './src/services/auth';
import { getUserProfile } from './src/services/users';

//Import navigation stacks
import MainLayout from './src/components/MainLayout';
import AuthStack from './src/navigation/stacks/AuthStack';
import OnboardingStack from './src/navigation/stacks/OnboardingStack';
import { typography } from './src/styles/commonStyles';

/*
  App Component

  Main application entry point handling authentication flow, navigation routing, and UI state
  Implements conditional rendering for authentication, onboarding, and main application views
  Provides global context providers for notifications and content sharing

  State machine:
  - Initializing: Loading fonts and subscribing to auth changes
  - Unauthenticated: Showing auth stack for login/signup
  - Authenticated: 
    - Onboarding: First-time user experience flow
    - Main application: Full feature access with navigation
*/

const Stack = createNativeStackNavigator();

function App() {

  //State transitions
  const [user, setUser] = useState(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [initialising, setInitialising] = useState(true);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  //Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      if (user) {
        setUser(user);

        try {
          //Check if user needs onboarding
          const userProfile = await getUserProfile(user.uid);
          setIsOnboarding(userProfile?.isNewUser ?? true);
        } 
        catch (error) {
          console.error("Error checking user onboarding status:", error);
          setIsOnboarding(false);
        }
      } 
      else {
        setUser(null);
        setIsOnboarding(false);
      }
      setInitialising(false);
    });

    return () => unsubscribe();
  }, []);

  //Show loading indicator
  if (!fontsLoaded || initialising) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F5D6E0" translucent={false} />
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
                //User signed in
                <>
                  <Stack.Screen name="Inside" component={MainLayout} />
                  {isOnboarding && (
                    <Stack.Screen
                      name="Onboarding"
                      component={OnboardingStack}
                      options={{ headerShown: false }}
                    />
                  )}
                </>
              ) : (
                //No user so show auth stack
                <Stack.Screen
                  name="Auth"
                  component={AuthStack}
                  options={{ headerShown: false }}
                />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </ShareIntentProvider>
      </ToastProvider>
    </>
  );
}

export default App;