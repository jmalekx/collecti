//React and React Native core imports
import React from 'react';

//Third-party library external imports
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//Custom component imports and styling
import commonStyles from '../../styles/commonStyles';
import Bookmarks from '../../screens/Bookmarks/Bookmarks';
import CollectionDetails from '../../screens/Collections/CollectionDetails';
import PostDetails from '../../screens/Collections/Posts/PostDetails';
import SearchPage from '../../screens/Search/SearchPage';

const Stack = createNativeStackNavigator();

const SearchStack = () => (
  <Stack.Navigator screenOptions={commonStyles.defaultHeaderOptions}>
    <Stack.Screen name="Bookmarks" component={Bookmarks} options={{ headerShown: true, title: 'Your Bookmarks' }} />
    <Stack.Screen name="CollectionDetails" component={CollectionDetails} options={{ headerShown: false }} />
    <Stack.Screen name="PostDetails" component={PostDetails} options={{ headerShown: false }} />
    <Stack.Screen name="Search" component={SearchPage} options={{ headerShown: true, title: 'Search' }} />
  </Stack.Navigator>
);

export default SearchStack;