//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

//Third-party library external imports
import { useToast } from 'react-native-toast-notifications';

//Project services and utilities
import { getUserProfile, updateUserProfile } from '../../../services/users';
import { getCurrentUserId } from '../../../services/firebase';
import { showToast, TOAST_TYPES } from '../../../components/Toasts';

//Custom component imports and styling
import commonStyles from '../../../styles/commonStyles';
import { AppHeading } from '../../../components/Typography';

/*
  EditProfile Screen

  Component for editing user profile information.
  Uses the users service for data operations and follows
  the MVC pattern for separation of concerns.
*/

const EditProfile = ({ navigation }) => {

  //State transitions
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  //Content managing
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  //Context state
  const toast = useToast();
  
  //Load user profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        //Call service to get user profile
        const userData = await getUserProfile();
        
        if (userData) {
          setUsername(userData.username || '');
          setProfilePicture(userData.profilePicture || '');
        }
      } catch (error) {
        showToast(toast, "Failed to load profile", { type: TOAST_TYPES.DANGER });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [toast]);

  //Handle profile save action
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      //Build update data object
      const updateData = {
        username: username,
        profilePicture: profilePicture,
        updatedAt: new Date().toISOString()
      };
      
      //Call service to update profile
      await updateUserProfile(updateData);
      
      showToast(toast, "Profile updated successfully", { type: TOAST_TYPES.SUCCESS });
      navigation.goBack();
    } catch (error) {
      showToast(toast, "Failed to update profile", { type: TOAST_TYPES.DANGER });
    } finally {
      setSaving(false);
    }
  };

  //Loading state render
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeading>Edit Profile</AppHeading>
      
      {/* Profile picture section */}
      <View style={styles.profilePictureContainer}>
        <Text>Profile Picture (Currently Unchanged)</Text>
        {/* Placeholder for profile picture component */}
      </View>
      
      {/* Username input */}
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={username}
        onChangeText={setUsername}
      />
      
      {/* Save button with loading state */}
      <TouchableOpacity
        style={[styles.button, saving && styles.disabledButton]}
        onPress={handleSaveProfile}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Changes</Text>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePictureContainer: {
    marginBottom: 16,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#A0C8FF', // Lighter blue for disabled state
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EditProfile;