//React and React Native core imports
import React from 'react';
import { View, StyleSheet } from 'react-native';

//Custom component imports and styling
import ProgressBar from '../../components/ProgressBar';
import commonStyles from "../../commonStyles";
import { AppText, AppHeading, AppButton, AppSmallText } from '../../components/Typography';

/*
  Onboarding Screen1 Component

  Implements first onboarding screen for app. Introduces user to 
  application and core value proposition. Pure UI component, no business logic.
*/

//Add a picture and introduction to collecti and what its about
const Screen1 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <ProgressBar currentStep={1} totalSteps={4} />

      {/* Main content */}
      <AppHeading>Welcome to Collecti!</AppHeading>
      <AppSmallText>Let's set up your profile</AppSmallText>

      {/* Sub content */}
      <AppText>How does Collecti work?</AppText>
      <AppSmallText>Share your favourite content into one central hub.</AppSmallText>

      {/* Continue button */}
      <AppButton
        style={styles.button}
        onPress={() => navigation.navigate('Screen2')}
        title='Continue'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
});

export default Screen1;