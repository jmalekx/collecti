//React and React Native core imports
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';

//Project services and utilities
import { showToast, TOAST_TYPES } from '../../components/Toasts';
import { getCollectionSuggestions, completeOnboardingProcess } from '../../services/onboarding';

//Custom component imports and styling
import ProgressBar from "../../components/ProgressBar";
import commonStyles, { colours } from "../../styles/commonStyles";
import onboardingstyles from "../../styles/onboardingstyles";
import { AppText, AppHeading, AppButton, AppSmallText, AppBoldText } from '../../components/Typography';

/*
  Onboarding Screen4 Component

  Implements final onboarding screen for app. Facilitates user selection of interests
  for initial collection creation. Utilises state management for selected options.
*/

const Screen4 = ({ navigation }) => {

  //State transitions
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  //Context states
  const toast = useToast();
  const collectionSuggestions = getCollectionSuggestions();

  //Handle option selection
  const handleOptionPress = (option) => {
    setSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  //Handle complete onboarding
  const handleCompleteOnboarding = async () => {
    setIsProcessing(true);
    try {
      // Service layer call
      await completeOnboardingProcess(selectedOptions);
      navigation.navigate('Inside', { screen: 'HomePage' });
    }
    catch (error) {
      showToast(toast, 'Failed to complete onboarding', { type: TOAST_TYPES.DANGER });
    }
    finally {
      setIsProcessing(false);
    }
  };

  //Skip onboarding handler
  const handleSkipOnboarding = async () => {
    setIsProcessing(true);
    try {
      //Complete onboarding without collections
      await completeOnboardingProcess([]);
      navigation.navigate('Inside', { screen: 'HomePage' });
    }
    catch (error) {
      showToast(toast, 'Failed to complete onboarding', { type: TOAST_TYPES.DANGER });
    }
    finally {
      setIsProcessing(false);
    }
  };
  return (
    <commonStyles.Bg>
      <View style={onboardingstyles.container}>

        {/* Back button */}
        <TouchableOpacity
          style={onboardingstyles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isProcessing}
        >
          <Ionicons name="arrow-back" size={24} color={colours.mainTexts} />
        </TouchableOpacity>

        {/* Progress indicator */}
        <ProgressBar currentStep={4} totalSteps={4} />

        {/* Main content */}
        <View style={onboardingstyles.contentContainer}>
          <View style={onboardingstyles.headerContainer}>
            <AppHeading style={onboardingstyles.heading}>What would you like to collect?</AppHeading>
            <AppText style={onboardingstyles.subheading}>
              Choose from some common collections to get started
              — you can customise or add your own anytime.
            </AppText>
          </View>

          {/* Options */}
          <View style={onboardingstyles.optionsContainer}>
            {collectionSuggestions.map((option, index) => (
              <TouchableOpacity
                key={index}
                disabled={isProcessing}
                style={[
                  onboardingstyles.option,
                  selectedOptions.includes(option) && onboardingstyles.optionSelected,
                  isProcessing && { opacity: 0.7 }
                ]}
                onPress={() => handleOptionPress(option)}
              >
                <AppBoldText
                  style={[
                    onboardingstyles.optionText,
                    selectedOptions.includes(option) && onboardingstyles.optionTextSelected
                  ]}
                >
                  {option}
                </AppBoldText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Skip button - styled to match other screens */}
        <TouchableOpacity
          onPress={handleSkipOnboarding}
          disabled={isProcessing}
          style={onboardingstyles.skipButton}
        >
          <AppSmallText style={[
            onboardingstyles.skipText,
            isProcessing && onboardingstyles.disabled
          ]}>
            Skip
          </AppSmallText>
        </TouchableOpacity>

        {/* Continue button */}
        <View style={onboardingstyles.buttonContainer}>
          <AppButton
            style={onboardingstyles.button}
            onPress={handleCompleteOnboarding}
            disabled={isProcessing}
            title={isProcessing ? 'Processing...' : 'Continue'}
          />

        </View>
      </View>
    </commonStyles.Bg>
  );
}

export default Screen4;