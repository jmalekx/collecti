//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar } from 'react-native';

//Third-party library external imports
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { ToastProvider } from 'react-native-toast-notifications';
import { ShareIntentProvider } from 'expo-share-intent';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

//Project services and utilities
import { subscribeToAuthChanges } from './src/services/auth';
import { getUserProfile } from './src/services/users';

//Custom component imports and styling
import { toastConfig } from './src/components/utilities/Toasts';
import MainLayout from './src/components/layout/MainLayout';
import AuthStack from './src/navigation/stacks/AuthStack';
import OnboardingStack from './src/navigation/stacks/OnboardingStack';
import LoadingIndicator from './src/components/utilities/LoadingIndicator';

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

      //User signed in or not
      if (user) {
        try {
          //Checking if user needs onboarding before updating
          const userProfile = await getUserProfile(user.uid);
          const needsOnboarding = userProfile?.isNewUser ?? true;

          setUser(user);
          setIsOnboarding(needsOnboarding);
          setInitialising(false);
        }
        catch (error) {
          setUser(user);
          setIsOnboarding(true); //Default to showing onboarding on error
          setInitialising(false);
        }
      }
      else {
        //No user
        setUser(null);
        setIsOnboarding(false);
        setInitialising(false);
      }
    });

    return () => unsubscribe();
  }, []);

  //Show loading indicator
  if (!fontsLoaded || initialising) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingIndicator/>
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
              <Text style={[toastConfig.messageStyle, { color: toastConfig.success }]}>
                {toast.message}
              </Text>
            </View>
          ),
          danger: (toast) => (
            <View style={[toastConfig.containerStyle, toastConfig.danger]}>
              <Text style={[toastConfig.messageStyle, { color: toastConfig.danger }]}>
                {toast.message}
              </Text>
            </View>
          ),
          warning: (toast) => (
            <View style={[toastConfig.containerStyle, toastConfig.warning]}>
              <Text style={[toastConfig.messageStyle, { color: toastConfig.warning }]}>
                {toast.message}
              </Text>
            </View>
          ),
          info: (toast) => (
            <View style={[toastConfig.containerStyle, toastConfig.info]}>
              <Text style={[toastConfig.messageStyle, { color: toastConfig.info }]}>
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
                //User signed in check onboarding
                isOnboarding ? (
                  //Onboarding needed show onboarding stack
                  <Stack.Screen name="Onboarding" component={OnboardingStack} options={{ headerShown: false }} />
                ) : (
                  //No onboarding needed show main app
                  <Stack.Screen name="Inside" component={MainLayout} />
                )
              ) : (
                //No user so show auth stack
                <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </ShareIntentProvider>
      </ToastProvider>
    </>
  );
}

export default App;