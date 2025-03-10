import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import ProgressBar from '../../components/ProgressBar';
import pinterestService from '../../services/pinterest/pinterestServices';
import { useToast } from 'react-native-toast-notifications';
import { Ionicons } from '@expo/vector-icons';
import commonStyles from "../../commonStyles";

const Screen3 = ({ route, navigation }) => {
  const { selectedOptions } = route.params;
  const toast = useToast();
  const [pinterestConnected, setPinterestConnected] = useState(false);

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

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <ProgressBar currentStep={3} totalSteps={4} />
      {selectedOptions.includes('Pinterest') ? (
        <View>
          <Text style={styles.title}>Connect to Pinterest</Text>
          <TouchableOpacity 
            style={styles.pinterestButton}
            onPress={handlePinterestAuth}
          >
            <Text style={styles.pinterestButtonText}>Connect to Pinterest</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.title}>Almost there...</Text>
      )}
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Screen4')}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
});

export default Screen3;