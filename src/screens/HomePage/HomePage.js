import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TextInput, Image, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';
import { showToast, TOAST_TYPES } from '../../components/Toasts';

// Import services instead of direct Firebase references
import { getUserProfile } from '../../services/users';
import { getCurrentUserId } from '../../services/firebase';
import commonStyles from '../../commonStyles';

const HomePage = ({ }) => {
  const toast = useToast();
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const currentUserId = getCurrentUserId();
    if (currentUserId) {
      setUserId(currentUserId);
      fetchUserProfile(currentUserId);
    }
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const userProfile = await getUserProfile(userId);

      if (userProfile) {
        setUserName(userProfile.username || 'User');
        setProfileImage(userProfile.profilePicture || null);
      } else {
        // Fallback to Auth data if no profile exists
        const auth = getAuth();
        setUserName(auth.currentUser?.displayName || 'User');
        setProfileImage(auth.currentUser?.photoURL || null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      showToast(toast, "Could not load profile", { type: TOAST_TYPES.WARNING });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with greeting and profile image */}
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.username}>{userName}</Text>
        </View>

        <View style={styles.profileContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.defaultProfileImage}>
              <Text style={styles.profileInitial}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  profileContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  defaultProfileImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomePage;