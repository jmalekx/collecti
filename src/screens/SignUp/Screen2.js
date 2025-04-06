//React and React Native core imports
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and styling
import ProgressBar from '../../components/ProgressBar';
import commonStyles from "../../styles/commonStyles";
import { AppHeading, AppButton, AppSmallText, AppBoldText } from '../../components/Typography';

/*
  Onboarding Screen2 Component

  Implements second onboarding screen for app. Facilitates user selection of platforms
  user wishes to collect from. Utilises state management for selected options 
  and propagates to next screen.
*/

const Screen2 = ({ navigation }) => {

  //State transitions
  const [selectedOptions, setSelectedOptions] = useState([]);

  //Function to handle option selection
  const handleOptionPress = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(item => item !== option));
    }
    else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  //Function to handle continue button press
  const handleContinue = () => {
    navigation.navigate('Screen3', { selectedOptions });
  };

  return (
    <commonStyles.Bg>
      <View style={styles.container}>

        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        {/* Progress indicator */}
        <ProgressBar currentStep={2} totalSteps={4} />

        {/* Main content */}
        <AppHeading>Where would you like to collect from?</AppHeading>
        <AppSmallText>Select all that apply</AppSmallText>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {['Instagram', 'Tiktok', 'Pinterest', 'Youtube', 'My own gallery'].map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                selectedOptions.includes(option) && styles.optionSelected
              ]}
              onPress={() => handleOptionPress(option)}
            >
              <AppBoldText style={styles.optionText}>{option}</AppBoldText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue button */}
        <AppButton
          style={styles.button}
          onPress={handleContinue}
          title='Continue'
        />
      </View>
    </commonStyles.Bg>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  button: {
    marginBottom: 20,
    margin: 20,
  },
});

export default Screen2;