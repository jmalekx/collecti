import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../FirebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import commonStyles from '../../commonStyles';

const EditProfile = ({ navigation }) => {
  const userId = FIREBASE_AUTH.currentUser?.uid;
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState(''); // Keep this state for any future use

  useEffect(() => {
    const fetchProfile = async () => {
      if (userId) {
        try {
          const userDoc = await getDoc(doc(FIREBASE_DB, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsername(userData.username || '');
            setProfilePicture(userData.profilePicture || ''); // Default picture URL
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };
    fetchProfile();
  }, [userId]);

  const handleSaveProfile = async () => {
    try {
      await setDoc(doc(FIREBASE_DB, 'users', userId), {
        username: username,
        profilePicture: profilePicture,
      }, { merge: true });
  
      alert('Profile updated successfully');
      navigation.goBack(); // Go back to the previous screen (Collections screen)
    } catch (error) {
      console.error('Error updating profile: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Edit Profile</Text>
      <View style={styles.profilePictureContainer}>
        <Text>Profile Picture (Currently Unchanged)</Text>
        {/* Placeholder for profile picture */}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TouchableOpacity
      style={styles.button}
      onPress={handleSaveProfile}
      >
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  profilePictureContainer: {
    marginBottom: 16,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    borderRadius: 8,
  },
});

export default EditProfile;
