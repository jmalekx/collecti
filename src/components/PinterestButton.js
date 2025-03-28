//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Linking } from 'react-native';

//Third-party library external imports
import { useToast } from 'react-native-toast-notifications';

//Project services and utilities
import pinterestService from '../services/pinterest/pinterestServices';

//Custom component imports and styling
import { TOAST_TYPES, showToast } from './Toasts';
import commonStyles from '../styles/commonStyles';

/*
  PinteresButton Component

  Button component for connecting and disconnecting Pinterest account
  Implements OAuth 2.0 authorisation code flow for Pinterest API integration

  - OAuth deep link handler
  - Stateful authentication tracking
  - Bidirectional communication

*/

const PinterestButton = ({ onConnected, onDisconnected }) => {

  //State transitions
  const [pinterestConnected, setPinterestConnected] = useState(false);

  //Context states
  const toast = useToast();

  //Check Pinterest authentication status
  const checkPinterestAuth = async () => {
    try {
      const isAuthenticated = await pinterestService.isAuthenticated();
      setPinterestConnected(isAuthenticated);
      if (isAuthenticated && onConnected) {
        onConnected();
      }
    }
    catch (error) {
      console.error('Error checking Pinterest auth status:', error);
    }
  };

  //Deep link handler for Pinterest OAuth
  const handleDeepLink = async (url) => {
    //Only processing URL matching OAuth callback
    if (url && url.includes('collecti://oauth/')) {
      try {
        const result = await pinterestService.handleRedirect(url);
        if (result.success) {
          setPinterestConnected(true);
          showToast(toast, "Pinterest connected successfully!", { type: TOAST_TYPES.SUCCESS });
          if (onConnected) {
            onConnected();
          }
        }
      } 
      catch (error) {
        console.error('Error handling Pinterest redirect:', error);
        showToast(toast, "Failed to connect Pinterest", { type: TOAST_TYPES.DANGER });
      }
    }
  };

  //Initialise Pinterest authentication check and deep link event listener
  useEffect(() => {
    checkPinterestAuth();

    const urlEventListener = (event) => {
      handleDeepLink(event.url);
    };

    Linking.addEventListener('url', urlEventListener);

    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      Linking.removeAllListeners('url');
    };
  }, []);

  //Authentication initiation handler
  const handlePinterestAuth = async () => {
    try {
      const authUrl = pinterestService.getAuthorizationUrl();
      await Linking.openURL(authUrl);
    } 
    catch (error) {
      console.error('Error starting Pinterest auth:', error);
      showToast(toast, "Failed to open Pinterest authorization", { type: TOAST_TYPES.DANGER });
    }
  };

  //Authentication disonnection handler
  const handlePinterestDisconnect = async () => {
    try {
      await pinterestService.logout();
      setPinterestConnected(false);
      showToast(toast, "Pinterest disconnected", { type: TOAST_TYPES.SUCCESS });
      if (onDisconnected) {
        onDisconnected();
      }
    } 
    catch (error) {
      console.error('Error disconnecting Pinterest:', error);
      toast.show("Failed to disconnect Pinterest", { type: "error" });
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.pinterestButton,
        pinterestConnected && styles.pinterestConnected
      ]}
      onPress={pinterestConnected ? handlePinterestDisconnect : handlePinterestAuth}
    >
      <Text style={styles.pinterestButtonText}>
        {pinterestConnected ? 'Disconnect Pinterest' : 'Connect to Pinterest'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
});

export default PinterestButton;