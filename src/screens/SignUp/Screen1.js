import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ProgressBar from '../../components/ProgressBar';

const Screen1 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ProgressBar currentStep={1} totalSteps={4} />
      <Text style={styles.title}>Welcome to Collecti!</Text>
      <Text style={styles.description}>Let's set up your profile</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Screen2')}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F6F2',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Screen1;