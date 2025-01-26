import React, { useState, useEffect } from 'react';
import { SafeAreaView, Settings, StyleSheet, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import SignIn from './src/screens/SignIn';
import UserSettings from './src/screens/UserSettings';
import Profile from './src/screens/Profile';
import { FIREBASE_AUTH } from './FirebaseConfig';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const InsideStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function InsideLayout() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Profile} />
      <Tab.Screen name="Settings" component={UserSettings} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null); 
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log('user', user);
      setUser(user);
    });

    return () => unsubscribe();
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
