//React and React Native core imports
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';

//Third-party library external imports
import { useToast } from 'react-native-toast-notifications';

//Project services and utilities
import { getUserProfile } from '../../services/users';
import { getCurrentUser, getCurrentUserId } from '../../services/firebase';

import { DEFAULT_PROFILE_PICTURE } from '../../constants';
import { useUserData } from '../../hooks/useUserData';

//Custom component imports and styling
import { showToast, TOAST_TYPES } from '../../components/utilities/Toasts';
import commonStyles from '../../styles/commonStyles';
import homestyles from '../../styles/homestyles';
import SuggestedCollections from '../../components/layout/Home/SuggestedCollections';
import UserStats from '../../components/layout/Home/UserStats';
import filler from '../../images/homedecor.png';
import { AppSubheading } from '../../components/utilities/Typography';
import LoadingIndicator from '../../components/utilities/LoadingIndicator';

/* 
  HomePage Screen

  Implements main landing screen after authentication or onboarding completion.
  Displays personalised greeting, user profile information and provides 
  access to main application features. Uses service layer for data access.
*/

const HomePage = () => {
  //State transitions
  const [pageReady, setPageReady] = useState(false);
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  //Get user data using the hook for collections and posts count
  const { userProfile, collections, loading: collectionsLoading } = useUserData();

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
        const currentUser = getCurrentUser();
        setUser(currentUser);

        if (userProfile) {
          //Prefer data from user profile
          setUserName(userProfile.username || 'User');
          //Store empty string as null to trigger default image logic
          setProfileImage(userProfile.profilePicture || null);
        }
        else {
          //Fallback to auth data using service layer
          setUserName(currentUser?.displayName || 'User');
          setProfileImage(currentUser?.photoURL || null);
        }
      }
      catch (error) {
        showToast(toast, "Could not load profile", { type: TOAST_TYPES.WARNING });
      }
      finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [toast]);

  //Coordinate data loading
  useEffect(() => {
    //Only mark page as ready when all data loaded
    if (!isLoading && !collectionsLoading) {
      setPageReady(true);
    }
  }, [isLoading, collectionsLoading]);

  //Show loading until everything ready
  if (!pageReady) {
    return (
      <commonStyles.Bg>
        <View style={[commonStyles.container, commonStyles.loadingContainer]}>
          <LoadingIndicator/>
        </View>
      </commonStyles.Bg>
    );
  }

  return (
    <commonStyles.Bg>
      <View style={commonStyles.container}>

        {/* Header with greeting and profile image */}
        <View style={homestyles.header}>
          <View style={homestyles.greetingContainer}>
            <Text style={homestyles.greeting}>Hello,</Text>
            <Text style={homestyles.username}>{userName}</Text>
          </View>

          <View style={homestyles.profileContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={homestyles.profileImage} />
            ) : (
              //Use DEFAULT_PROFILE_PICTURE instead of initials when no profile image
              <Image
                source={{ uri: DEFAULT_PROFILE_PICTURE }}
                style={homestyles.profileImage}
              />
            )}
          </View>
        </View>
        <Image source={filler} style={homestyles.fillerImage} />

        {/* Stats Collage Component */}
        <AppSubheading style={commonStyles.headerContainer}>Your Collecti Insights</AppSubheading>
        <UserStats
          user={user}
          collections={collections}
        />

        {/* Suggested Collections Section */}
        <View>
          <SuggestedCollections />
        </View>

      </View>
    </commonStyles.Bg>
  );
};

export default HomePage;