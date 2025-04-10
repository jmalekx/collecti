//React and React Native core imports
import React from 'react';

//Third-party library external imports
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//SCustom component imports and styling
import CustomBackButton from '../../components/utilities/CustomBackButton';
import HomePage from '../../screens/HomePage/HomePage';
import PostDetails from '../../screens/Collections/Posts/PostDetails';
import EditPost from '../../screens/Collections/Posts/EditPost';
import CollectionDetails from '../../screens/Collections/CollectionDetails';
import CollectiStats from '../../screens/HomePage/CollectiStats';
import commonStyles from '../../styles/commonStyles';

const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      ...commonStyles.defaultHeaderOptions,
      headerLeft: () => <CustomBackButton />,
      headerTitleAlign: 'center',
      headerBackVisible: false,
    }}
  >
    <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
    <Stack.Screen name="PostDetails" component={PostDetails} options={{ headerShown: false }} />
    <Stack.Screen name="EditPost" component={EditPost} options={{ headerShown: false }} />
    <Stack.Screen name="CollectionDetails" component={CollectionDetails} options={{ headerShown: false }} />
    <Stack.Screen name="CollectiStats" component={CollectiStats} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export default HomeStack;