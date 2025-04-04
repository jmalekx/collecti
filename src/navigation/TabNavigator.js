//React and React Native core imports
import React from 'react';
import { StyleSheet, View, Dimensions, Text } from 'react-native';

//Third-party library external imports
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and styling
import HomeStack from './stacks/HomeStack';
import CollectionsStack from './stacks/CollectionsStack';
import SearchStack from './stacks/SearchStack';
import BookmarksStack from './stacks/BookmarksStack';
import { colours } from '../styles/commonStyles';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

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
          }
          else if (route.name === 'CollectionScreen') {
            iconName = focused ? 'grid' : 'grid-outline';
          }
          else if (route.name === 'SearchScreen') {
            iconName = focused ? 'search' : 'search-outline';
          }
          else if (route.name === 'BookmarkScreen') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarShowLabel: false,
        lazy: false,
        headerShown: false,
        tabBarStyle: {
          display: 'none', //Hide the default tab bar for custom one
        }
      })}

      //Custom tab bar
      tabBar={(props) => (
        <View style={styles.tabBarWrapper}>

          {/* Left Tab Section */}
          <View style={styles.tabSection}>
            {props.state.routes.slice(0, 2).map((route, index) => {
              const { options } = props.descriptors[route.key];
              const isFocused = props.state.index === index;

              const onPress = () => {
                const event = props.navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  props.navigation.navigate(route.name);
                }
              };

              return (
                <View
                  key={index}
                  style={[
                    styles.tabItem,
                    isFocused && styles.tabItemFocused
                  ]}
                  onTouchEnd={onPress}
                >
                  <Ionicons
                    name={
                      route.name === 'HomeScreen'
                        ? isFocused ? 'home' : 'home-outline'
                        : isFocused ? 'search' : 'search-outline'
                    }
                    size={26}
                    color={isFocused ? colours.buttonsText : colours.buttonsHighlight}
                  />
                </View>
              );
            })}
          </View>

          {/* Empty middle section - creates space between icon groups */}
          <View style={{ flex: 1 }} />

          {/* Right Tab Section */}
          <View style={styles.tabSection}>
            {props.state.routes.slice(2, 4).map((route, index) => {
              const realIndex = index + 2;
              const { options } = props.descriptors[route.key];
              const isFocused = props.state.index === realIndex;

              const onPress = () => {
                const event = props.navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  props.navigation.navigate(route.name);
                }
              };

              return (
                <View
                  key={index}
                  style={[
                    styles.tabItem,
                    isFocused && styles.tabItemFocused
                  ]}
                  onTouchEnd={onPress}
                >
                  <Ionicons
                    name={
                      route.name === 'BookmarkScreen'
                        ? isFocused ? 'bookmark' : 'bookmark-outline'
                        : isFocused ? 'grid' : 'grid-outline'
                    }
                    size={26}
                    color={isFocused ? colours.buttonsText : colours.buttonsHighlight}
                  />
                </View>
              );
            })}
          </View>
        </View>
      )}
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

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 25,
    left: 45,
    right: 45,
    height: 46,
    backgroundColor: colours.buttons,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    zIndex: 900,
  },
  tabSection: {
    flexDirection: 'row',
    width: 'auto',
    zIndex: 2,
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 0,
    borderRadius: 25,
    height: '100%',
  },
  tabItemFocused: {
    backgroundColor: 'rgba(170, 121, 15, 0.15)',
  },
});

export default TabNavigator;