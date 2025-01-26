import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import SignIn from './src/screens/SignIn';
import Profile from './src/screens/Profile';
import { FIREBASE_AUTH } from './FirebaseConfig';

const Stack = createNativeStackNavigator();
const InsideStack = createNativeStackNavigator();

function InsideLayout() {
  return (
    <InsideStack.Navigator>
      <InsideStack.Screen name="My Profile" component={Profile} />
    </InsideStack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null); // Removed TypeScript-specific <User | null>
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log('user', user);
      setUser(user);
    });

    return () => unsubscribe(); // Clean up the subscription
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        {user ? (
          <Stack.Screen 
            name="Inside" 
            component={InsideLayout} 
            options={{ headerShown: false }} 
          />
        ) : (
          <Stack.Screen 
            name="SignIn" 
            component={SignIn} 
            options={{ headerShown: false }} 
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
