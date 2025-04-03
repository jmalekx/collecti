//React and React Native core imports
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';

//Third-party library external imports
import { useToast } from 'react-native-toast-notifications';

//Project services and utilities
import { getUserProfile } from '../../services/users';
import { getCurrentUser, getCurrentUserId } from '../../services/firebase';
import { showToast, TOAST_TYPES } from '../../components/Toasts';
import { DEFAULT_PROFILE_PICTURE } from '../../constants';
import { getAllCollections } from '../../services/collections';

import SuggestedCollections from '../../components/SuggestedCollections';

//Custom component imports and styling
import commonStyles from '../../styles/commonStyles';

/* 
  HomePage Screen

  Implements main landing screen after authentication or onboarding completion.
  Displays personalised greeting, user profile information and provides 
  access to main application features. Uses service layer for data access.
*/

//ADD RECENTLY ACCESSES COLECTIONS TO THIS SCREEN

const HomePage = () => {

  //State transitions
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  //Context states
  const toast = useToast();

  //Load user profile data from services
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        const userId = getCurrentUserId();

        if (!userId) {
          return;
        }

        const userProfile = await getUserProfile(userId);

        if (userProfile) {
          //Prefer data from user profile
          setUserName(userProfile.username || 'User');
          // Store empty string as null to trigger default image logic
          setProfileImage(userProfile.profilePicture || null);
        }
        else {
          //Fallback to auth data using service layer
          const currentUser = getCurrentUser();
          setUserName(currentUser?.displayName || 'User');
          setProfileImage(currentUser?.photoURL || null);
        }
      }
      catch (error) {
        console.error("Error loading user profile:", error);
        showToast(toast, "Could not load profile", { type: TOAST_TYPES.WARNING });
      }
      finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [toast]);

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
            //Use DEFAULT_PROFILE_PICTURE instead of initials when no profile image
            <Image
              source={{ uri: DEFAULT_PROFILE_PICTURE }}
              style={styles.profileImage}
            />
          )}
        </View>
      </View>

      {/* Content sections */}
      <View style={styles.section}>
        <SuggestedCollections />
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