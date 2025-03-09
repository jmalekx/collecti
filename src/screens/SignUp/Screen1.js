import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const Screen1 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* <OnboardingProgress currentStep={1} /> */}
      <Text style={styles.title}>Welcome to Collecti!</Text>
      <Text style={styles.description}>Let's set up your profile</Text>
      <Button 
        title="Next" 
        onPress={() => navigation.navigate('Screen2')} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF3E2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  }
});

export default Screen1;