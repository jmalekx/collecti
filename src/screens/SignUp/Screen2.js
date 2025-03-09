import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import ProgressBar from '../../components/ProgressBar';
import { useToast } from 'react-native-toast-notifications';

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

  return (
    <View style={styles.container}>
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
      {/* {selectedOptions.includes('Pinterest') && (
        <TouchableOpacity 
          style={styles.pinterestButton}
          onPress={() => toast.show("Pinterest connection not implemented yet", { type: "info" })}
        >
          <Text style={styles.pinterestButtonText}>Connect to Pinterest</Text>
        </TouchableOpacity>
      )} */}
      <Button 
        title="Continue" 
        onPress={() => navigation.navigate('Screen3')} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF3E2',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  optionsContainer: {
    width: '100%',
  },
  option: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#c0c0c0',
  },
  optionText: {
    fontSize: 16,
  },
  pinterestButton: {
    backgroundColor: '#E60023',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  pinterestButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Screen2;