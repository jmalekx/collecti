//React and React Native core imports
import React from 'react';

//Screen imports
import Screen1 from '../../screens/SignUp/Screen1';
import Screen2 from '../../screens/SignUp/Screen2';
import Screen3 from '../../screens/SignUp/Screen3';
import Screen4 from '../../screens/SignUp/Screen4';

const OnboardingStack = () => (
  <Stack.Group>
    <Stack.Screen name="Screen1" component={Screen1} />
    <Stack.Screen name="Screen2" component={Screen2} />
    <Stack.Screen name="Screen3" component={Screen3} />
    <Stack.Screen name="Screen4" component={Screen4} />
  </Stack.Group>
);

export default OnboardingStack;