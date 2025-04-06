//React and React Native core imports
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and styling
import ProgressBar from '../../components/ProgressBar';
import commonStyles, { colours } from "../../styles/commonStyles";
import onboardingstyles from '../../styles/onboardingstyles';
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

  //Get platformspecific colours
  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'Instagram':
        return '#E1306C';
      case 'Tiktok':
        return '#000000';
      case 'Pinterest':
        return '#E60023';
      case 'Youtube':
        return '#FF0000';
      default:
        return '#4CAF50';
    }
  };

  //Platform options with corresponding icons
  const platformOptions = [
    { name: 'Instagram', icon: 'logo-instagram' },
    { name: 'Tiktok', icon: 'logo-tiktok' },
    { name: 'Pinterest', icon: 'logo-pinterest' },
    { name: 'Youtube', icon: 'logo-youtube' },
    { name: 'Gallery', icon: 'images-outline' }
  ];

  return (
    <commonStyles.Bg>
      <View style={onboardingstyles.container}>
        {/* Back button */}
        <TouchableOpacity style={onboardingstyles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colours.mainTexts} />
        </TouchableOpacity>

        {/* Progress indicator */}
        <ProgressBar currentStep={2} totalSteps={4} />

        {/* Main content */}
        <View style={onboardingstyles.contentContainer}>
          <View style={onboardingstyles.headerContainer}>
            <AppHeading style={onboardingstyles.heading}>Where would you like to collect from?</AppHeading>
            <AppSmallText style={onboardingstyles.subheading}>Select all platforms that apply</AppSmallText>
          </View>

          {/* Options */}
          <View style={onboardingstyles.optionsContainer}>
            {platformOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  onboardingstyles.option,
                  selectedOptions.includes(option.name) && onboardingstyles.optionSelected
                ]}
                onPress={() => handleOptionPress(option.name)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons
                    name={option.icon}
                    size={22}  // Increased icon size
                    color={selectedOptions.includes(option.name) ? getPlatformColor(option.name) : getPlatformColor(option.name)}
                    style={{ marginRight: 5 }}
                  />
                  <AppBoldText
                    style={[
                      onboardingstyles.optionText,
                      selectedOptions.includes(option.name) && onboardingstyles.optionTextSelected
                    ]}
                  >
                    {option.name}
                  </AppBoldText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Continue button */}
        <View style={onboardingstyles.buttonContainer}>
          <AppButton
            style={onboardingstyles.button}
            onPress={handleContinue}
            title='Continue'
          />
        </View>
      </View>
    </commonStyles.Bg>
  );
};

export default Screen2;