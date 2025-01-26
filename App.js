import React from 'react';
import { SafeAreaView, StyleSheet, Text} from 'react-native';
import { useCallback } from 'react';
import SignIn from './src/screens/SignIn';

const App = () => {
  return (
    <SafeAreaView style ={styles.root}>
        <SignIn />
    </SafeAreaView>
  );
};

const styles= StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'FFF3E2',
  },
});

export default App;