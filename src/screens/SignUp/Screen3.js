//React and React Native core imports
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and styling
import ProgressBar from '../../components/utilities/ProgressBar';
import PinterestButton from '../../components/utilities/PinterestButton';
import commonStyles from "../../styles/commonStyles";
import onboardingstyles from '../../styles/onboardingstyles';
import { AppText, AppHeading, AppButton } from '../../components/utilities/Typography';

/*
  Onboarding Screen3 Component

  Implements third onboarding screen for app. Offering third-party service integration.
  Conditonal UI render based on user selections from previous screen.
  If user selected Pinterest, prompted to connect OAuth pinterest account in order
  for API to work and collect from Pinterest
*/

const Screen3 = ({ route, navigation }) => {

  //Route parameters
  const { selectedOptions } = route.params;

  return (
    <commonStyles.Bg>
      <View style={onboardingstyles.container}>

        {/* Back button */}
        <TouchableOpacity style={onboardingstyles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        {/* Progress indicator */}
        <ProgressBar currentStep={3} totalSteps={4} />

        {/* Main content */}
        {selectedOptions.includes('Pinterest') ? (
          <View style={onboardingstyles.contentContainer}>

            <AppHeading style={onboardingstyles.heading}>Connect to Pinterest</AppHeading>

            <AppText style={onboardingstyles.subheading}>
              This integration helps extract images and titles automatically
              from your own pins, making your collecting experience smoother.
            </AppText>

            <AppText style={onboardingstyles.subheading}>
              This step is optional but can significantly enhance your
              experience with Collecti.
            </AppText>

            <View>
              <PinterestButton />
            </View>

          </View>
        ) : (
          <View style={onboardingstyles.contentContainer}>
            <AppHeading style={onboardingstyles.heading}>Almost there...</AppHeading>
            <AppText style={onboardingstyles.subheading}>
              Just one more step to complete your setup and start your collecting journey!
            </AppText>
          </View>
        )}

        {/* Continue button */}
        <AppButton
          style={onboardingstyles.button}
          onPress={() => navigation.navigate('Screen4', { selectedOptions })}
          title='Continue'
        />
      </View>
    </commonStyles.Bg>
  );
};

export default Screen3;