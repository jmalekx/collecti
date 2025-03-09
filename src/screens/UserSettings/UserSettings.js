import { View, Text, Button, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import React, { useState, useEffect } from 'react';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { useToast } from 'react-native-toast-notifications';
import pinterestService from '../../services/pinterest/pinterestServices';


const UserSettings = ({ navigation }) => {
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
    } catch (error) {
      console.error('Error disconnecting Pinterest:', error);
      toast.show("Failed to disconnect Pinterest", { type: "error" });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.pinterestButton, pinterestConnected ? styles.pinterestConnected : {}]}
        onPress={pinterestConnected ? handlePinterestDisconnect : handlePinterestAuth}>
        <Text style={styles.pinterestButtonText}>
          {pinterestConnected ? 'Disconnect Pinterest' : 'Connect Pinterest'}
        </Text>
      </TouchableOpacity>
      
      <Button onPress={() => FIREBASE_AUTH.signOut()} title="Logout"/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  pinterestButton: {
    backgroundColor: '#E60023',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  pinterestConnected: {
    backgroundColor: '#666',
  },
  pinterestButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default UserSettings;