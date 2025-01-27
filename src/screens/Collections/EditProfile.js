import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../FirebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Import getDoc

const EditProfile = ({ navigation }) => {
  const userId = FIREBASE_AUTH.currentUser?.uid;
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  useEffect(() => {
    // Fetch current profile info
    const fetchProfile = async () => {  // Make this function async
      if (userId) {
        try {
          const userDoc = await getDoc(doc(FIREBASE_DB, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsername(userData.username || '');
            setProfilePicture(userData.profilePicture || '');
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
      navigation.goBack(); // Go back to the previous screen
    } catch (error) {
      console.error('Error updating profile: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Edit Profile</Text>
      <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Profile Picture URL"
        value={profilePicture}
        onChangeText={setProfilePicture}
      />
      <Button title="Save Changes" onPress={handleSaveProfile} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
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
