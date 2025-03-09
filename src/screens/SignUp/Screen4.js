import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../FirebaseConfig';
import ProgressBar from "../../components/ProgressBar";
import commonStyles from "../../commonStyles";

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
        <ProgressBar currentStep={1} totalSteps={4} />      
      <Text style={styles.title}>What would you like to extract?</Text>
      <Text style={styles.subtitle}>
        We selected some common extracts for you, but you can always change it later.
      </Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>📖 Recipes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>🎬 Films and Shows</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>🍽 Restaurants</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>📚 Books</Text>
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
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  option: {
    backgroundColor: "#FFDCDC",
    padding: 10,
    borderRadius: 20,
    margin: 5,
  },
  optionText: {
    color: "#D54B4B",
    fontWeight: "bold",
  },
});