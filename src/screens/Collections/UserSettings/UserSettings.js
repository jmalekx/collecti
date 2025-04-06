//React and React Native core imports
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, TextInput, Modal } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';

//Project services and utilities
import { logOut } from '../../../services/auth';
import { deleteUserAccount } from '../../../services/users';
import { useToast } from 'react-native-toast-notifications';
import { showToast, TOAST_TYPES } from '../../../components/Toasts';

//Custom component imports and styling
import commonStyles, { colours } from '../../../styles/commonStyles';
import settingstyles from '../../../styles/settingstyles';
import PinterestButton from '../../../components/PinterestButton';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { AppSubheading } from '../../../components/Typography';

/*
  UserSettings Screen

  Provides user account management options including:
  - Pinterest integration
  - Logout functionality
  - Profile management (via navigation)
  - Account deletion
  Uses service layer for authentication operations.
*/

const UserSettings = ({ navigation }) => {
  //State transitions
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  //Context states
  const toast = useToast();

  //Handle user logout with confirmation
  const handleLogout = async () => {
    setModalVisible(false);
    await logOut(); //Use auth service instead of direct Firebase access
  };

  //Handle account deletion
  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      showToast(toast, "Please enter your password", { type: TOAST_TYPES.WARNING });
      return;
    }

    setIsDeleting(true);
    try {
      const success = await deleteUserAccount(password);
      if (success) {
        showToast(toast, "Your account has been deleted", { type: TOAST_TYPES.SUCCESS });
        //Account deleted successfully, user will be redirected to login automatically
      }
      else {
        showToast(toast, "Incorrect password. Please try again.", { type: TOAST_TYPES.DANGER });
      }
    }
    catch (error) {
      showToast(toast, "Failed to delete account", { type: TOAST_TYPES.DANGER });
    }
    finally {
      setIsDeleting(false);
      setPassword('');
    }
  };

  return (
    <commonStyles.Bg>
      <View style={[commonStyles.container, settingstyles.settingsContainer]}>

        {/* Integrations */}
        <AppSubheading style={commonStyles.headerContainer}> Integrations</AppSubheading>
        <View style={settingstyles.sectionContainer}>
          <View style={[settingstyles.settingButton, { padding: 10 }]}>
            <View style={settingstyles.iconContainer}>
              <Ionicons name="logo-pinterest" size={22} color="#E60023" />
            </View>
            <Text style={settingstyles.settingButtonText}>Pinterest</Text>
            <PinterestButton style={{ margin: 0 }} />
          </View>
        </View>

        {/* Account Section */}
        <AppSubheading style={commonStyles.headerContainer}> Manage Account</AppSubheading>
        <View style={settingstyles.sectionContainer}>
          <TouchableOpacity
            style={settingstyles.settingButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={settingstyles.iconContainer}>
              <Ionicons name="person-outline" size={22} color={colours.subTexts} />
            </View>
            <Text style={settingstyles.settingButtonText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={18} style={settingstyles.chevronIcon} />
          </TouchableOpacity>

          {/* Logout moved to Account section */}
          <TouchableOpacity
            style={[settingstyles.settingButton, settingstyles.lastSettingButton]}
            onPress={() => setModalVisible(true)}
          >
            <View style={settingstyles.iconContainer}>
              <Ionicons name="log-out-outline" size={22} color={colours.subTexts} />
            </View>
            <Text style={settingstyles.settingButtonText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[settingstyles.settingButton, settingstyles.lastSettingButton, settingstyles.dangerButton]}
            onPress={() => setDeleteModalVisible(true)}
          >
            <View style={settingstyles.iconContainer}>
              <Ionicons name="trash-outline" size={22} color="#e53935" />
            </View>
            <Text style={[settingstyles.settingButtonText, settingstyles.dangerText]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* App version */}
        <Text style={settingstyles.versionText}>Collecti v1.0.0</Text>

        {/* Modals - keep as they are */}
        <ConfirmationModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Log out"
          message="Are you sure you want to log out? You'll need to login again to use the app."
          primaryAction={handleLogout}
          primaryText="Log out"
          primaryStyle="primary"
          secondaryText="Cancel"
          icon="log-out-outline"
        />

        <ConfirmationModal
          visible={deleteModalVisible}
          onClose={() => {
            setDeleteModalVisible(false);
            setPassword('');
          }}
          title="Delete Account"
          message="This will permanently delete your account and all your data. This action cannot be undone."
          primaryAction={handleDeleteAccount}
          primaryText={isDeleting ? "Deleting..." : "Delete Account"}
          primaryStyle="danger"
          secondaryText="Cancel"
          icon="trash-outline"
          showInput={true}
          inputValue={password}
          onInputChange={setPassword}
          inputPlaceholder="Password"
          inputLabel="Enter your password to confirm:"
          inputSecureTextEntry={true}
          inputDisabled={isDeleting}
        />
      </View>
    </commonStyles.Bg>
  );
};

export default UserSettings;