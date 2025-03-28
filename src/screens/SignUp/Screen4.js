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
import commonStyles from "../../styles/commonStyles";
import { AppText, AppHeading, AppButton } from '../../components/Typography';

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
      //Service layer call
      await completeOnboardingProcess(selectedOptions);

      //Navigation is appropriate in the UI layer
      navigation.reset({
        index: 0,
        routes: [{ name: 'Inside' }],
      });
    }
    catch (error) {
      console.error('Error completing onboarding:', error);

      //Error handling
      if (error.message.includes('No authenticated user found')) {
        showToast(toast, 'Authentication error. Please sign in again.', { type: TOAST_TYPES.DANGER });
      }
      else {
        showToast(toast, 'Failed to complete onboarding', { type: TOAST_TYPES.DANGER });
      }
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

      navigation.reset({
        index: 0,
        routes: [{ name: 'Inside' }],
      });
    } 
    catch (error) {
      console.error('Error skipping onboarding:', error);
      showToast(toast, 'Failed to complete onboarding', { type: TOAST_TYPES.DANGER });
    } 
    finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        disabled={isProcessing}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Progress indicator */}
      <ProgressBar currentStep={4} totalSteps={4} />

      {/* Main content */}
      <AppHeading>What would you like to collect?</AppHeading>
      <AppText>
        We selected some common collections for you, but you can always change or add your own later.
      </AppText>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {collectionSuggestions.map((option, index) => (
          <TouchableOpacity
            key={index}
            disabled={isProcessing}
            style={[
              styles.option,
              selectedOptions.includes(option) && styles.optionSelected,
              isProcessing && styles.disabled
            ]}
            onPress={() => handleOptionPress(option)}
          >
            <AppText>{option}</AppText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Continue button */}
      <AppButton
        style={styles.button}
        onPress={handleCompleteOnboarding}
        disabled={isProcessing}
        title={isProcessing ? 'Processing...' : 'Continue'}
      />

      {/* Skip button */}
      <TouchableOpacity
        onPress={handleSkipOnboarding}
        disabled={isProcessing}
      >
        <Text style={[
          styles.skipText,
          isProcessing && styles.disabled
        ]}>
          Skip
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  ...commonStyles,
  optionSelected: {
    backgroundColor: '#c0c0c0',
  },
  disabled: {
    opacity: 0.5,
  },
  optionsContainer: {
    width: '100%',
    marginVertical: 20,
  },
  option: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  skipText: {
    marginTop: 15,
    textAlign: 'center',
    color: '#666',
    textDecorationLine: 'underline',
  }
});

export default Screen4;