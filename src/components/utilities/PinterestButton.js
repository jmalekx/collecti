//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Linking } from 'react-native';

//Third-party library external imports
import { useToast } from 'react-native-toast-notifications';

//Project services and utilities
import pinterestService from '../../services/pinterest/pinterestServices';
import { TOAST_TYPES, showToast } from '../utilities/Toasts';

//Custom component imports and styling
import commonStyles from '../../styles/commonStyles';

/*
  PinteresButton Component

  Button component for connecting and disconnecting Pinterest account
  Implements OAuth 2.0 authorisation code flow for Pinterest API integration

  - OAuth deep link handler
  - Stateful authentication tracking
  - Bidirectional communication

*/

const PinterestButton = ({ onConnected, onDisconnected, style }) => {

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
      setPinterestConnected(false);
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
          showToast(toast, "Pinterest connected successfully", { type: TOAST_TYPES.SUCCESS });
          if (onConnected) {
            onConnected();
          }
        }
      }
      catch (error) {
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
      showToast(toast, "Failed to disconnect Pinterest", { type: TOAST_TYPES.DANGER });
    }
  };

  return (
    <TouchableOpacity
      style={[
        commonStyles.pinterestButton,
        pinterestConnected && commonStyles.pinterestConnected,
        style
      ]}
      onPress={pinterestConnected ? handlePinterestDisconnect : handlePinterestAuth}
    >
      <Text style={commonStyles.pinterestButtonText}>
        {pinterestConnected ? 'Disconnect Pinterest' : 'Connect to Pinterest'}
      </Text>
    </TouchableOpacity>
  );
};

export default PinterestButton;