//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar } from 'react-native';

//Third-party library external imports
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { ToastProvider } from 'react-native-toast-notifications';
import { ShareIntentProvider } from 'expo-share-intent';
import { useFonts, Inter_400Regular, Inter_400Regular_Italic, Inter_700Bold, Inter_700Bold_Italic } from '@expo-google-fonts/inter';

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
    'Inter-Regular': Inter_400Regular,
    'Inter-Italic': Inter_400Regular_Italic,
    'Inter-Bold': Inter_700Bold,
    'Inter-BoldItalic': Inter_700Bold_Italic,
  });

useEffect(() => {
  const unsubscribe = subscribeToAuthChanges(async (user) => {
    setInitialising(true); //Start loading indicator

    if (user) {
      try {
        const userProfile = await getUserProfile(user.uid);
        const needsOnboarding = userProfile?.isNewUser ?? true;

        setUser(user);
        setIsOnboarding(needsOnboarding);
      } 
      catch (error) {
        setUser(user); 
        setIsOnboarding(true);
      } 
      finally {
        setInitialising(false); //Stop loading
      }
    } 
    else {
      setUser(null);
      setIsOnboarding(false);
      setInitialising(false); //Stop loading
    }
  });

  //Cleanup
  return () => {
    unsubscribe();
  }
}, []);

  //Show loading indicator
  if (!fontsLoaded || initialising) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingIndicator size="large" />
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