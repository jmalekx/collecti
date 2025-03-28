//React and React Native core imports
import React from 'react';

//Third-party library external imports
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//Screen imports
import Collections from '../../screens/Collections/Collections';
import CollectionDetails from '../../screens/Collections/CollectionDetails';
import EditCollection from '../../screens/Collections/EditCollection';
import PostDetails from '../../screens/Collections/Posts/PostDetails';
import EditPost from '../../screens/Collections/Posts/EditPost';
import EditProfile from '../../screens/Collections/UserSettings/EditProfile';
import UserSettings from '../../screens/Collections/UserSettings/UserSettings';

const Stack = createNativeStackNavigator();

const CollectionsStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="Collections" component={Collections} options={{ headerShown: true }} />
        <Stack.Screen name="CollectionDetails" component={CollectionDetails} options={{ headerShown: false }} />
        <Stack.Screen name="EditCollection" component={EditCollection} options={{ headerShown: false }} />
        <Stack.Screen name="PostDetails" component={PostDetails} options={{ headerShown: false }} />
        <Stack.Screen name="EditPost" component={EditPost} options={{ headerShown: false }} />
        <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: true, title: 'Edit Profile' }} />
        <Stack.Screen name="UserSettings" component={UserSettings} options={{ headerShown: true, title: 'Settings' }} />
    </Stack.Navigator>
);

export default CollectionsStack;