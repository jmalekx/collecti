//React and React Native core imports
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

//Project services and utilities
import { logOut } from '../../../services/auth'; 
import PinterestButton from '../../../components/PinterestButton';
import ConfirmationModal from '../../../components/ConfirmationModal';

//Custom component imports
import commonStyles from '../../../styles/commonStyles';

/*
  UserSettings Screen

  Provides user account management options including:
  - Pinterest integration
  - Logout functionality
  - Profile management (via navigation)
  Uses service layer for authentication operations.
*/

const UserSettings = ({ navigation }) => {
  //State transitions
  const [modalVisible, setModalVisible] = useState(false);

  //Handle user logout with confirmation
  const handleLogout = async () => {
    setModalVisible(false);
    await logOut(); // Use auth service instead of direct Firebase access
  };

  return (
    <View style={styles.container}>
      {/* Pinterest Integration Section */}
      <PinterestButton />
      
      {/* Account Management Section */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
      
      {/* Logout Section */}
      <TouchableOpacity
        style={[styles.button]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Log out"
        message="Are you sure you want to log out? You'll need to login again to use the app."
        primaryAction={handleLogout}
        primaryText="Log out"
        primaryStyle="danger"
        secondaryText="Cancel"
        icon="log-out-outline"
      />
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
});

export default UserSettings;