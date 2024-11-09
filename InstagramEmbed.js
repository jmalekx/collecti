// InstagramEmbed.js
import React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

const InstagramEmbed = ({ url }) => {
  if (!url || typeof url !== 'string') {
    Alert.alert("Error", "The URL is invalid or undefined.");
    return <Text>No valid URL provided.</Text>;
  }

  const postId = url.split('/')[4];  // Get the post ID from the URL
  if (!postId) {
    Alert.alert("Error", "The URL does not contain a valid Instagram post.");
    return <Text>No valid Instagram post found.</Text>;
  }

  const embedUrl = `https://www.instagram.com/p/${postId}/embed`;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: embedUrl }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  webview: {
    width: '100%',
    height: 400,  // Adjust height as needed
  },
});

export default InstagramEmbed;
