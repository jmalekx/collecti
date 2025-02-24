import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FIREBASE_AUTH } from './FirebaseConfig';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';

import SignIn from './src/screens/SignIn';
import HomePage from './src/screens/HomePage';
import Collections from './src/screens/Collections';
import CollectionDetails from './src/screens/Collections/CollectionDetails';
import UserSettings from './src/screens/UserSettings';
import EditProfile from './src/screens/UserSettings/EditProfile';
import EditCollection from './src/screens/Collections/EditCollection';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function InsideLayout() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Collections" component={Collections} />
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
        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{ headerShown: true, title: 'Edit Profile' }}
        />
        <Stack.Screen 
          name="CollectionDetails" 
          component={CollectionDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="EditCollection" 
          component={EditCollection}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
