import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FIREBASE_AUTH, FIREBASE_DB } from './FirebaseConfig';
import { getDoc, doc } from 'firebase/firestore';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { ToastProvider } from 'react-native-toast-notifications';
import { toastConfig } from './src/components/Toasts';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

import SignIn from './src/screens/SignIn';
import SignUp from './src/screens/SignUp/SignUp';
import HomePage from './src/screens/HomePage';
import Collections from './src/screens/Collections';
import CollectionDetails from './src/screens/Collections/CollectionDetails';
import EditPost from './src/screens/Posts/EditPost';
import PostDetails from './src/screens/Posts/PostDetails';
import UserSettings from './src/screens/UserSettings';
import EditProfile from './src/screens/UserSettings/EditProfile';
import EditCollection from './src/screens/Collections/EditCollection';

import Screen1 from './src/screens/SignUp/Screen1';
import Screen2 from './src/screens/SignUp/Screen2';
import Screen3 from './src/screens/SignUp/Screen3';
import Screen4 from './src/screens/SignUp/Screen4';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function InsideLayout() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
      <Tab.Screen name="Collections" component={Collections} />
      <Tab.Screen name="Settings" component={UserSettings} />
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
        // Check if user needs onboarding
        const userDoc = await getDoc(doc(FIREBASE_DB, 'users', user.uid));
        const isNewUser = userDoc.data()?.isNewUser ?? true;
        setIsOnboarding(isNewUser);
      }
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Show loading screen while fonts are loading - MOVED HERE after all hooks
  if (!fontsLoaded) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loading...</Text>
    </View>;
  }
  
  return (
    <>
    <StatusBar 
      barStyle="dark-content" 
      backgroundColor="#F9F6F2" //CHANGE COLOR LATER
      translucent={false} 
    />
    <ToastProvider 
    placement="top" 
    duration={4000} 
    offsetTop={75}
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
              {/* Always include the Inside screen in the stack */}
              <Stack.Screen name="Inside" component={InsideLayout} options={{ headerShown: false }} />
              
              {/* Conditionally render onboarding screens */}
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
              <Stack.Screen name="SignIn"component={SignIn} options={{ headerShown: false }}/>
              <Stack.Screen name="SignUp" component={SignUp} />
            </>
          )}
          <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: true }} />
          <Stack.Screen name="CollectionDetails" component={CollectionDetails} options={{ headerShown: false }} />
          <Stack.Screen name="EditCollection" component={EditCollection} />
          <Stack.Screen name="PostDetails" component={PostDetails} options={{ headerShown: false }} />
          <Stack.Screen name="EditPost" component={EditPost} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ToastProvider>
    </>
  );
}