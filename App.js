import React from 'react';
import { SafeAreaView, StyleSheet, Text} from 'react-native';
import { useCallback } from 'react';
import { AuthProvider, useFlow, useDescope, useSession } from '@descope/react-native-sdk'
import SignIn from './src/screens/SignIn';

const App = () => {
  return (
    <AuthProvider projectId="P2oc6rdU0eDqCr0MCgmtq0LXJVt5">
      <SafeAreaView style ={styles.root}>
        <SignIn />
      </SafeAreaView>
    </AuthProvider>
  );
};

const styles= StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'FFF3E2',
  },
});

export default App;