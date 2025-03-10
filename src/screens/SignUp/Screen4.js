import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../FirebaseConfig';
import ProgressBar from "../../components/ProgressBar";
import commonStyles from "../../commonStyles";
import { Ionicons } from '@expo/vector-icons';

//what collections would you like (creation of empty presets if user desires)
export default function Screen4({ navigation }) {
    const completeOnboarding = async () => {
      try {
        const user = FIREBASE_AUTH.currentUser;
        if (user) {
          const userRef = doc(FIREBASE_DB, 'users', user.uid);
          
          // First check if the document exists
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            // Update existing document
            await updateDoc(userRef, {
              isNewUser: false
            });
          } else {
            // Create new document if it doesn't exist
            await setDoc(userRef, {
              email: user.email,
              username: user.email.split('@')[0],
              profilePicture: 'https://i.pinimg.com/736x/9c/8b/20/9c8b201fbac282d91c766e250d0e3bc6.jpg',
              bio: '',
              createdAt: new Date(),
              collections: 1,
              posts: 0,
              isNewUser: false
            });
          }
          
          // Navigate to Inside stack
          navigation.navigate('Inside');
        }
      } catch (error) {
        console.error('Error completing onboarding:', error);
      }
    };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
        <ProgressBar currentStep={1} totalSteps={4} />      
      <Text style={styles.title}>What would you like to collect?</Text>
      <Text style={styles.subtitle}>
        We selected some common collections for you, but you can always change or add your own later.
      </Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>📖 recipes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>💅🏻 nails</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>✈️ travel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>👗 fashion</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>💄 beauty</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>🏋️ fitness</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>🧶 crafts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>🎨 art</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={completeOnboarding}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={completeOnboarding}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    ...commonStyles,
});