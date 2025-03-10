import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ProgressBar from '../../components/ProgressBar';
import commonStyles from "../../commonStyles";

//picture and introduction to collecti and what its about
const Screen1 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ProgressBar currentStep={1} totalSteps={4} />
      <Text style={styles.title}>Welcome to Collecti!</Text>
      <Text style={styles.description}>Let's set up your profile</Text>
      <Text>How does Collecti work?</Text>
      <Text>Share your favourite content into one central hub.</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Screen2')}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
});

export default Screen1;