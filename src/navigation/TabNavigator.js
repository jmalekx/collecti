//React and React Native core imports
import React from 'react';

//Third-party library external imports
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and styling
import HomeStack from './stacks/HomeStack';
import CollectionsStack from './stacks/CollectionsStack';
import SearchStack from './stacks/SearchStack';
import BookmarksStack from './stacks/BookmarksStack';

const Tab = createBottomTabNavigator();

/*
  TabNavigator Component

  This component sets up the bottom tab navigation for the app.
  It includes four tabs: Home, Search, Bookmarks, and Collections.
  Each tab is associated with a stack navigator that manages its own screens.
  This serves as the main navigation structure for the authenticated part of the app.
*/

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeScreen') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'CollectionScreen') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'SearchScreen') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'BookmarkScreen') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 60,
          paddingBottom: 5
        },
        //Ensures navigation state persists correctly
        lazy: false,
        headerShown: false
      })}
    >
      <Tab.Screen 
        name="HomeScreen" 
        component={HomeStack}
        options={{ 
          title: 'Home',
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="SearchScreen" 
        component={SearchStack} 
        options={{ 
          title: 'Search',
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="BookmarkScreen" 
        component={BookmarksStack} 
        options={{ 
          title: 'Bookmarks',
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="CollectionScreen" 
        component={CollectionsStack} 
        options={{ 
          title: 'Collections',
          headerShown: false
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;