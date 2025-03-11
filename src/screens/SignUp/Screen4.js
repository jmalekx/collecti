import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../FirebaseConfig';
import ProgressBar from "../../components/ProgressBar";
import commonStyles from "../../commonStyles";
import { Ionicons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';
import { AppText, AppHeading, AppButton, AppTextInput } from '../../components/Typography';

export default function Screen4({ navigation }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const toast = useToast()

  const handleOptionPress = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(item => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const createCollection = async (userId, collectionName) => {
    try {
      const collectionRef = doc(FIREBASE_DB, 'users', userId, 'collections', collectionName);
      await setDoc(collectionRef, {
        name: collectionName,
        description: '',
        createdAt: new Date().toISOString(),
        items: [],
        thumbnail: '', // Add a default thumbnail if needed
      });
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.show(`Failed to create collection: ${collectionName}`, { type: 'danger' });
    }
  };

  const completeOnboarding = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        const userId = user.uid;

        // Create collections for each selected option
        for (const option of selectedOptions) {
          await createCollection(userId, option);
        }

        // Update user document to mark onboarding as complete
        const userRef = doc(FIREBASE_DB, 'users', userId);
        await setDoc(userRef, { isNewUser: false }, { merge: true });

        // Navigate to the next screen
        navigation.navigate('Inside');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.show('Failed to complete onboarding', { type: 'danger' });
    }
  };

  const skipOnboarding = () => {
    // Navigate to the next screen without creating any collections
    navigation.navigate('Inside');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <ProgressBar currentStep={4} totalSteps={4} />
      <AppHeading>What would you like to collect?</AppHeading>
      <AppText>
        We selected some common collections for you, but you can always change or add your own later.
      </AppText>

      <View style={styles.optionsContainer}>
        {['📖 recipes', '💅🏻 nails', '✈️ travel', '👗 fashion', '💄 beauty', '🏋️ fitness', '🧶 crafts', '🎨 art'].map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              selectedOptions.includes(option) && styles.optionSelected
            ]}
            onPress={() => handleOptionPress(option)}
          >
            <AppText>{option}</AppText>
          </TouchableOpacity>
        ))}
      </View>

      <AppButton
        style={styles.button}
        onPress={completeOnboarding}
        title='Continue'
      />

      <TouchableOpacity onPress={skipOnboarding}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  ...commonStyles,
  optionSelected: {
    backgroundColor: '#c0c0c0',
  },
});