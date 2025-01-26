import React from 'react';
import { SafeAreaView, StyleSheet, Text} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import SignIn from './src/screens/SignIn';

const Stack = createNativeStackNavigator();

export default function App(){
  return(
    <NavigationContainer>
      <Stack.Navigator initialRouteName='SignIn'>
        <Stack.Screen name="SignIn" component={SignIn} options={{headerShown: false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// const App = () => {
//   return (
//     <SafeAreaView style ={styles.root}>
//         <SignIn />
//     </SafeAreaView>
//   );
// };

// const styles= StyleSheet.create({
//   root: {
//     flex: 1,
//     backgroundColor: 'FFF3E2',
//   },
// });

// export default App;