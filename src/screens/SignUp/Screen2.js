//React and React Native core imports
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and styling
import ProgressBar from '../../components/ProgressBar';
import commonStyles, { colours } from "../../styles/commonStyles";
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
      <View style={styles.container}>
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colours.mainTexts} />
        </TouchableOpacity>

        {/* Progress indicator */}
        <ProgressBar currentStep={2} totalSteps={4} />

        {/* Main content */}
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <AppHeading style={styles.heading}>Where would you like to collect from?</AppHeading>
            <AppSmallText style={styles.subheading}>Select all platforms that apply</AppSmallText>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            <View style={styles.optionsRow}>
              {platformOptions.slice(0, 3).map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.option,
                    selectedOptions.includes(option.name) && styles.optionSelected
                  ]}
                  onPress={() => handleOptionPress(option.name)}
                >
                  <View 
                    style={[
                      styles.iconContainer,
                      { backgroundColor: selectedOptions.includes(option.name) 
                        ? colours.lighterpink 
                        : `${getPlatformColor(option.name)}20` }
                    ]}
                  >
                    <Ionicons 
                      name={option.icon} 
                      size={24} 
                      color={selectedOptions.includes(option.name) 
                        ? colours.buttonsTextPink 
                        : getPlatformColor(option.name)} 
                    />
                  </View>
                  <AppBoldText style={[
                    styles.optionText,
                    selectedOptions.includes(option.name) && styles.optionTextSelected
                  ]}>
                    {option.name}
                  </AppBoldText>
                  {selectedOptions.includes(option.name) && (
                    <View style={styles.checkmarkContainer}>
                      <Ionicons name="checkmark-circle" size={16} color={colours.buttonsTextPink} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.optionsRow}>
              {platformOptions.slice(3).map((option, index) => (
                <TouchableOpacity
                  key={index + 3}
                  style={[
                    styles.option,
                    selectedOptions.includes(option.name) && styles.optionSelected
                  ]}
                  onPress={() => handleOptionPress(option.name)}
                >
                  <View 
                    style={[
                      styles.iconContainer,
                      { backgroundColor: selectedOptions.includes(option.name) 
                        ? colours.lighterpink 
                        : `${getPlatformColor(option.name)}20` }
                    ]}
                  >
                    <Ionicons 
                      name={option.icon} 
                      size={24} 
                      color={selectedOptions.includes(option.name) 
                        ? colours.buttonsTextPink 
                        : getPlatformColor(option.name)} 
                    />
                  </View>
                  <AppBoldText style={[
                    styles.optionText,
                    selectedOptions.includes(option.name) && styles.optionTextSelected
                  ]}>
                    {option.name}
                  </AppBoldText>
                  {selectedOptions.includes(option.name) && (
                    <View style={styles.checkmarkContainer}>
                      <Ionicons name="checkmark-circle" size={16} color={colours.buttonsTextPink} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Continue button */}
        <View style={styles.buttonContainer}>
          <AppButton
            style={styles.button}
            onPress={handleContinue}
            title='Continue'
          />
        </View>
      </View>
    </commonStyles.Bg>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    width: '90%',
  },
  heading: {
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 32,
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    color: colours.subTexts,
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.tertiary,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 8,
    width: 95,
    height: 95,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  optionSelected: {
    backgroundColor: colours.lighterpink,
    borderColor: colours.buttonsTextPink,
    borderWidth: 1.5,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 12,
    textAlign: 'center',
    color: colours.mainTexts,
  },
  optionTextSelected: {
    color: colours.buttonsTextPink,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  button: {
    ...commonStyles.authButton,
    marginBottom: 20,
    margin: 20,
  }
});

export default Screen2;