//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';

//Third-party library external imports
import { useToast } from 'react-native-toast-notifications';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

//Project services and utilities
import { getUserProfile, updateUserProfile } from '../../../services/users';
import { showToast, TOAST_TYPES } from '../../../components/Toasts';
import { uploadImageToCloudinary } from '../../../services/storage';

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
  const [uploadingImage, setUploadingImage] = useState(false);

  //Content managing
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [localImage, setLocalImage] = useState(null); // For storing local image URI before upload

  //Context state
  const toast = useToast();

  //Remove profile picture completely
  const removeProfilePicture = () => {
    setProfilePicture('');
    setLocalImage(null);
    showToast(toast, "Profile picture will be removed on save", { type: TOAST_TYPES.INFO });
  };
  
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

  //Image selection handler
  const selectImage = async () => {
    try {
      //Request permission to access media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast(toast, "Permission to access media library is required", { type: TOAST_TYPES.WARNING });
        return;
      }

      //Launch image picker with options
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], //Square aspect ratio for profile picture
        quality: 0.5,
        compress: 0.5,
        base64: false,
      });

      if (!result.canceled) {
        setLocalImage(result.assets[0].uri);
      }
    } 
    catch (error) {
      console.error('Error picking image:', error);
      showToast(toast, "Failed to pick image", { type: TOAST_TYPES.DANGER });
    }
  };

  //Remove selected image
  const removeSelectedImage = () => {
    setLocalImage(null);
  };

  //Handle profile save action
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      let profileImageUrl = profilePicture;
      
      //Upload new image if selected
      if (localImage) {
        try {
          setUploadingImage(true);
          showToast(toast, "Uploading profile picture...", { type: TOAST_TYPES.INFO });
          
          //Upload to Cloudinary
          const uploadedUrl = await uploadImageToCloudinary(localImage);
          if (!uploadedUrl) {
            throw new Error("Failed to upload image");
          }
          
          profileImageUrl = uploadedUrl;
          setUploadingImage(false);
        } 
        catch (uploadError) {
          console.error('Error uploading image to Cloudinary:', uploadError);
          showToast(toast, "Failed to upload profile picture", { type: TOAST_TYPES.DANGER });
          setSaving(false);
          return;
        }
      }
      
      //Build update data object
      const updateData = {
        username: username,
        profilePicture: profileImageUrl, // This will be empty string if user removed profile pic
        updatedAt: new Date().toISOString()
      };
      
      //Call service to update profile
      await updateUserProfile(updateData);
      
      showToast(toast, "Profile updated successfully", { type: TOAST_TYPES.SUCCESS });
      navigation.goBack();
    } 
    catch (error) {
      showToast(toast, "Failed to update profile", { type: TOAST_TYPES.DANGER });
    } 
    finally {
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
      <View style={styles.profilePictureSection}>
        <Text style={styles.label}>Profile Picture</Text>
        
        {localImage ? (
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: localImage }} style={styles.profileImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={removeSelectedImage}
            >
              <Ionicons name="close-circle" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        ) : profilePicture ? (
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: profilePicture }} style={styles.profileImage} />
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={selectImage}
            >
              <Ionicons name="camera" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeProfilePictureButton}
              onPress={removeProfilePicture}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.pickImageButton}
            onPress={selectImage}
          >
            <Ionicons name="person-circle-outline" size={60} color="#007AFF" />
            <Text style={styles.pickImageText}>Select Profile Picture</Text>
          </TouchableOpacity>
        )}
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
        style={[styles.button, (saving || uploadingImage) && styles.disabledButton]}
        onPress={handleSaveProfile}
        disabled={saving || uploadingImage}
      >
        {saving || uploadingImage ? (
          <View style={styles.savingContainer}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.savingText}>
              {uploadingImage ? "Uploading image..." : "Saving..."}
            </Text>
          </View>
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
  profilePictureSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginTop: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  pickImageButton: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginTop: 12,
  },
  pickImageText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  removeImageButton: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  changeImageButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
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
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#A0C8FF', // Lighter blue for disabled state
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  removeProfilePictureButton: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
});

export default EditProfile;