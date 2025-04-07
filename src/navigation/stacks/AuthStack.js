//React and React Native core imports
import React from 'react';

//Third-party library external imports
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//Custom component imports and styling
import commonStyles from '../../styles/commonStyles';
import CustomBackButton from '../../components/utilities/CustomBackButton';
import SignIn from '../../screens/SignIn/SignIn';
import SignUp from '../../screens/SignUp/SignUp';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      ...commonStyles.defaultHeaderOptions,
      headerLeft: () => <CustomBackButton />,
      headerTitleAlign: 'center',
      headerBackVisible: false,
    }}
  >
    <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }} />
    <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: true, headerTitle: "Create Account" }} />
  </Stack.Navigator>
);

export default AuthStack;