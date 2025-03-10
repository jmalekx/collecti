import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import ProgressBar from '../../components/ProgressBar';
import { useToast } from 'react-native-toast-notifications';
import { Ionicons } from '@expo/vector-icons';
import commonStyles from "../../commonStyles";

//selecting platforms you wish to collect from
const Screen2 = ({ navigation }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const toast = useToast();

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
      <Text style={styles.title}>Where would you like to collect from?</Text>
      <Text style={styles.description}>Select all that apply</Text>
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
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
});

export default Screen2;