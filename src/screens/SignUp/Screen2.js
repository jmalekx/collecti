import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ProgressBar from '../../components/ProgressBar';
import { Ionicons } from '@expo/vector-icons';
import commonStyles from "../../commonStyles";
import { AppHeading, AppButton, AppSmallText, AppBoldText } from '../../components/Typography';

//selecting platforms you wish to collect from
const Screen2 = ({ navigation }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleOptionPress = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(item => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleContinue = () => {
    navigation.navigate('Screen3', {selectedOptions});
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <ProgressBar currentStep={2} totalSteps={4} />
      <AppHeading>Where would you like to collect from?</AppHeading>
      <AppSmallText>Select all that apply</AppSmallText>
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
      <AppButton 
        style={styles.button} 
        onPress={handleContinue}
        title='Continue'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
});

export default Screen2;