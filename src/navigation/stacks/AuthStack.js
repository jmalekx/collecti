//React and React Native core imports
import React from 'react';

//Third-party library external imports
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//Screen imports
import SignIn from '../../screens/SignIn/SignIn';
import SignUp from '../../screens/SignUp/SignUp';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="SignIn" component={SignIn} />
    <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: true }} />
  </Stack.Navigator>
);

export default AuthStack;