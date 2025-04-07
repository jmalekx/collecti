//React and React Native core imports
import React from 'react';

//Third-party library external imports
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//Custom component imports and styling
import CustomBackButton from '../../components/utilities/CustomBackButton';
import commonStyles from '../../styles/commonStyles';
import Screen1 from '../../screens/SignUp/Screen1';
import Screen2 from '../../screens/SignUp/Screen2';
import Screen3 from '../../screens/SignUp/Screen3';
import Screen4 from '../../screens/SignUp/Screen4';
import MainLayout from '../../components/layout/MainLayout';

const Stack = createNativeStackNavigator();

const OnboardingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Screen1" component={Screen1} />
    <Stack.Screen name="Screen2" component={Screen2} />
    <Stack.Screen name="Screen3" component={Screen3} />
    <Stack.Screen name="Screen4" component={Screen4} />
    <Stack.Screen name="Inside" component={MainLayout}
      options={{
        headerShown: false,
        gestureEnabled: false, //Prevent swiping back to onboarding once inside
      }}
      listeners={({ navigation }) => ({
        beforeRemove: (e) => {
          //Prevent default action (going back)
          e.preventDefault();
        }
      })}
    />
  </Stack.Navigator>
);

export default OnboardingStack;