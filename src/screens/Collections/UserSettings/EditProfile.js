//React and React Native core imports
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';

//Project services and utilities
import useProfileManagement from '../../../hooks/useProfileManagement';

//Custom component imports and styling
import commonStyles, { colours } from '../../../styles/commonStyles';
import LoadingIndicator from '../../../components/utilities/LoadingIndicator';
import { AppSubheading, AppText } from '../../../components/utilities/Typography';
import settingstyles from '../../../styles/settingstyles';
import addbuttonstyles from '../../../styles/addbuttonstyles';

/*
  EditProfile Component

  Component for editing user profile information.
  Separates UI concerns from data management using custom hook.
  Allows changing username and profile picture
*/

const EditProfile = ({ navigation }) => {
  //===== PROFILE MANAGEMENT HOOK =====
  const {
    loading,
    saving,
    uploadingImage,
    username,
    setUsername,
    profilePicture,
    localImage,
    selectImage,
    removeSelectedImage,
    removeProfilePicture,
    handleSaveProfile
  } = useProfileManagement(navigation);

  //Loading state render
  if (loading) {
    return (
      <View style={commonStyles.loadingContainer}>
        <LoadingIndicator />
      </View>
    );
  }

  return (
    <commonStyles.Bg>
      <View style={settingstyles.profileContainer}>

        {/* Profile picture section */}
        <View style={settingstyles.profilePictureSection}>
        <AppSubheading style={commonStyles.textSubheading}>Profile Picture</AppSubheading>

          {localImage ? (
            <View style={settingstyles.profileImageContainer}>
              <Image source={{ uri: localImage }} style={settingstyles.profileImage} />
              <TouchableOpacity
                style={settingstyles.removeImageButton}
                onPress={removeSelectedImage}
              >
                <Ionicons name="close-circle" size={24} color={colours.buttonsTextPink} />
              </TouchableOpacity>
            </View>
          ) : profilePicture ? (
            <View style={settingstyles.profileImageContainer}>
              <Image source={{ uri: profilePicture }} style={settingstyles.profileImage} />
              <TouchableOpacity
                style={settingstyles.changeImageButton}
                onPress={selectImage}
              >
                <Ionicons name="camera" size={24} color={colours.buttonsTextPink} />
              </TouchableOpacity>
              <TouchableOpacity
                style={settingstyles.removeProfilePictureButton}
                onPress={removeProfilePicture}
              >
                <Ionicons name="trash-outline" size={20} color={colours.buttonsTextPink} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={settingstyles.pickImageButton}
              onPress={selectImage}
            >
              <Ionicons name="person-circle-outline" size={60} color={colours.buttonsTextPink} />
              <AppText style={settingstyles.pickImageText}>Select Profile Picture</AppText>
            </TouchableOpacity>
          )}
        </View>

        {/* Username input */}
        <View style={settingstyles.profileInputContainer}>
          <AppSubheading style={commonStyles.textSubheading}>Username</AppSubheading>
          <View style={addbuttonstyles.standardInputContainer}>
            <TextInput
              style={addbuttonstyles.standardInput}
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor={colours.subTexts}
            />
          </View>
        </View>

        {/* Save button with loading state */}
        <View style={[settingstyles.buttonRow]}>
          <TouchableOpacity
            style={[addbuttonstyles.cancelButton, {backgroundColor: 'white', borderColor: '#eee', borderWidth: 1.5}]}
            onPress={() => navigation.goBack()}
          >
            <Text style={addbuttonstyles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              addbuttonstyles.actionButton,
              settingstyles.saveButton,
              (saving || uploadingImage) && settingstyles.disabledButton
            ]}
            onPress={handleSaveProfile}
            disabled={saving || uploadingImage}
          >
            {saving || uploadingImage ? (
              <View style={settingstyles.savingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={addbuttonstyles.buttonTextWhite}>
                  {uploadingImage ? "Uploading..." : "Saving..."}
                </Text>
              </View>
            ) : (
              <Text style={addbuttonstyles.buttonTextWhite}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </commonStyles.Bg>
  );
};

export default EditProfile;