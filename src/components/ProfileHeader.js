//React and React Native core imports
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

//Custom component imports and styling
import commonStyles from '../styles/commonStyles';

/*
  ProfileHeader component displays the user's profile picture, username, and stats.
  Props:
  - username: The username of the user.
  - stats: The statistics to display (e.g., number of collections and posts).
  - profilePicture: The URL of the user's profile picture.
*/

const ProfileHeader = ({ username, stats, profilePicture }) => (
  <View style={styles.header}>
    <Image
      source={{ uri: profilePicture }}
      style={styles.profilePicture}
    />
    <Text style={styles.username}>{username}</Text>
    <Text style={styles.stats}>{stats}</Text>
  </View>
);

const styles = StyleSheet.create({
    ...commonStyles,
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  stats: {
    fontSize: 14,
    color: '#888',
    marginVertical: 8,
  },
});

export default ProfileHeader;