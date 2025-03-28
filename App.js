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
import { subscribeToAuthChanges } from './src/services/auth';
import { getUserProfile } from './src/services/users';

//Import navigation stacks
import MainLayout from './src/components/MainLayout';
import AuthStack from './src/navigation/stacks/AuthStack';
import OnboardingStack from './src/navigation/stacks/OnboardingStack';

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

const styles = {
  container: {
    flex: 1,
    position: 'relative',
  },
};