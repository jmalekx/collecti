import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal } from 'react-native';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import PinterestButton from '../../components/PinterestButton';
import commonStyles from '../../commonStyles';
import ConfirmationModal from '../../components/ConfirmationModal';

const UserSettings = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = () => {
    setModalVisible(false);
    FIREBASE_AUTH.signOut();
  };

  return (
    <View style={styles.container}>
      <PinterestButton />
      <TouchableOpacity
        style={styles.button}
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
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default UserSettings;
