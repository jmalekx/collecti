//React and React Native core imports
import { useState, useEffect } from 'react';
import { useToast } from 'react-native-toast-notifications';
import * as ImagePicker from 'expo-image-picker';

//Project services
import { getUserProfile, updateUserProfile } from '../services/users';
import { uploadImageToCloudinary } from '../services/storage';
import { showToast, TOAST_TYPES } from '../components/utilities/Toasts';

/*
  useProfileManagement Hook

  Custom hook for managing user profile data and image handling
  Separates data management concerns from the UI component
  Handles profile loading, image selection, and profile updates
*/

const useProfileManagement = (navigation) => {
  //State transitons
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  //Content state
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [localImage, setLocalImage] = useState(null);

  //Context state
  const toast = useToast();

  //Pfp actions
  const removeProfilePicture = () => {
    setProfilePicture('');
    setLocalImage(null);
    showToast(toast, "Profile picture will be removed on save", { type: TOAST_TYPES.INFO });
  };

  //Load user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userData = await getUserProfile();

        if (userData) {
          setUsername(userData.username || '');
          setProfilePicture(userData.profilePicture || '');
        }
      }
      catch (error) {
        showToast(toast, "Failed to load profile", { type: TOAST_TYPES.DANGER });
      }
      finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  //Handle image
  const selectImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast(toast, "Permission to access media library is required", { type: TOAST_TYPES.WARNING });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        compress: 0.5,
        base64: false,
      });

      if (!result.canceled) {
        setLocalImage(result.assets[0].uri);
      }
    }
    catch (error) {
      showToast(toast, "Failed to pick image", { type: TOAST_TYPES.DANGER });
    }
  };

  //Remove selected image
  const removeSelectedImage = () => {
    setLocalImage(null);
  };

  //Handle updating profile
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
          showToast(toast, "Failed to upload profile picture", { type: TOAST_TYPES.DANGER });
          setSaving(false);
          return;
        }
      }

      //Build update data object
      const updateData = {
        username: username,
        profilePicture: profileImageUrl,
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

  return {
    //State
    loading,
    saving,
    uploadingImage,
    username,
    setUsername,
    profilePicture,
    localImage,
    
    //Methods
    selectImage,
    removeSelectedImage,
    removeProfilePicture,
    handleSaveProfile
  };
};

export default useProfileManagement;