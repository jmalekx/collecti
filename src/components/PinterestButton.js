import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Linking } from 'react-native';
import pinterestService from '../services/pinterest/pinterestServices';
import { useToast } from 'react-native-toast-notifications';
import commonStyles from '../commonStyles';

const PinterestButton = ({ onConnected, onDisconnected }) => {
  const [pinterestConnected, setPinterestConnected] = useState(false);
  const toast = useToast();

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

  const checkPinterestAuth = async () => {
    try {
      const isAuthenticated = await pinterestService.isAuthenticated();
      setPinterestConnected(isAuthenticated);
      if (isAuthenticated && onConnected) {
        onConnected();
      }
    } catch (error) {
      console.error('Error checking Pinterest auth status:', error);
    }
  };

  const handleDeepLink = async (url) => {
    if (url && url.includes('collecti://oauth/')) {
      try {
        const result = await pinterestService.handleRedirect(url);
        if (result.success) {
          setPinterestConnected(true);
          toast.show("Pinterest connected successfully!", { type: "success" });
          if (onConnected) {
            onConnected();
          }
        }
      } catch (error) {
        console.error('Error handling Pinterest redirect:', error);
        toast.show("Failed to connect Pinterest", { type: "error" });
      }
    }
  };

  const handlePinterestAuth = async () => {
    try {
      const authUrl = pinterestService.getAuthorizationUrl();
      await Linking.openURL(authUrl);
    } catch (error) {
      console.error('Error starting Pinterest auth:', error);
      toast.show("Failed to open Pinterest authorization", { type: "error" });
    }
  };

  const handlePinterestDisconnect = async () => {
    try {
      await pinterestService.logout();
      setPinterestConnected(false);
      toast.show("Pinterest disconnected", { type: "success" });
      if (onDisconnected) {
        onDisconnected();
      }
    } catch (error) {
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