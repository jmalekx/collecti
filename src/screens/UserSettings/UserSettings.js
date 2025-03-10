import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import PinterestButton from '../../components/PinterestButton';
import commonStyles from '../../commonStyles';

const UserSettings = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <PinterestButton />
      <TouchableOpacity
        style={styles.button}
        onPress={() => FIREBASE_AUTH.signOut()}
      >
        <Text style={styles.buttonText}>Logout</Text>
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
});

export default UserSettings;