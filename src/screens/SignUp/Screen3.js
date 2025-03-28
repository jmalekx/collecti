//React and React Native core imports
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and styling
import ProgressBar from '../../components/ProgressBar';
import PinterestButton from '../../components/PinterestButton';
import commonStyles from "../../styles/commonStyles";
import { AppText, AppHeading, AppButton } from '../../components/Typography';

/*
  Onboarding Screen3 Component

  Implements third onboarding screen for app. Offering third-party service integration.
  Conditonal UI render based on user selections from previous screen.
  If user selected Pinterest, prompted to connect OAuth pinterest account in order
  for API to work and collect from Pinterest
*/

const Screen3 = ({ route, navigation }) => {

  //Roiute parameters
  const { selectedOptions } = route.params;

  return (
    <View style={styles.container}>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Progress indicator */}
      <ProgressBar currentStep={3} totalSteps={4} />

      {/* Main content */}
      {selectedOptions.includes('Pinterest') ? (
        <View>
          <Text style={styles.title}>Connect to Pinterest</Text>
          <PinterestButton />
        </View>
      ) : (
        <AppHeading>Almost there...</AppHeading>
      )}

      {/* Continue button */}
      <AppButton
        style={styles.button}
        onPress={() => navigation.navigate('Screen4', { selectedOptions })}
        title='Continue'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
});

export default Screen3;