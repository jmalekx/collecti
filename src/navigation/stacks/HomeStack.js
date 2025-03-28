//React and React Native core imports
import React from 'react';

//Third-party library external imports
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//Screen imports
import HomePage from '../../screens/HomePage/HomePage';
import PostDetails from '../../screens/Collections/Posts/PostDetails';
import EditPost from '../../screens/Collections/Posts/EditPost';

const Stack = createNativeStackNavigator();

const HomeStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
        <Stack.Screen name="PostDetails" component={PostDetails} options={{ headerShown: false }} />
        <Stack.Screen name="EditPost" component={EditPost} options={{ headerShown: false }} />
    </Stack.Navigator>
);

export default HomeStack;