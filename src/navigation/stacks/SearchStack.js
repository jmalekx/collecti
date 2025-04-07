//React and React Native core imports
import React from 'react';

//Third-party library external imports
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//Custom component imports and styling
import CustomBackButton from '../../components/utilities/CustomBackButton';
import commonStyles from '../../styles/commonStyles';
import SearchPage from '../../screens/Search/SearchPage';
import CollectionDetails from '../../screens/Collections/CollectionDetails';
import EditCollection from '../../screens/Collections/EditCollection';
import PostDetails from '../../screens/Collections/Posts/PostDetails';
import EditPost from '../../screens/Collections/Posts/EditPost';

const Stack = createNativeStackNavigator();

const SearchStack = () => (
  <Stack.Navigator
    screenOptions={{
      ...commonStyles.defaultHeaderOptions,
      headerLeft: () => <CustomBackButton />,
      headerTitleAlign: 'center',
      headerBackVisible: false,
    }}
  >
    <Stack.Screen name="Search" component={SearchPage} options={{ headerShown: true, title: 'Search' }} />
    <Stack.Screen name="CollectionDetails" component={CollectionDetails} options={{ headerShown: false }} />
    <Stack.Screen name="PostDetails" component={PostDetails} options={{ headerShown: false }} />
    <Stack.Screen name="EditCollection" component={EditCollection} options={{ headerShown: false }} />
    <Stack.Screen name="EditPost" component={EditPost} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export default SearchStack;