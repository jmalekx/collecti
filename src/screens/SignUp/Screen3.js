import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const Screen3 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* <OnboardingProgress currentStep={1} /> */}
      <Text style={styles.title}>Welcome to Collecti!</Text>
      <Text style={styles.description}>Let's set up your profile</Text>
      <Button 
        title="Next" 
        onPress={() => navigation.navigate('Screen4')} 
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
});

export default Screen3;