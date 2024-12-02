// TikTokEmbed.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import WebView from 'react-native-webview';

const TikTokEmbed = ({ url }) => {
  const [embedCode, setEmbedCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmbedCode = async () => {
      try {
        const response = await fetch(`https://www.tiktok.com/oembed?url=${url}`);
        const data = await response.json();
        setEmbedCode(data.html);  // Set the embed HTML from the API response
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch TikTok embed code:", error);
        Alert.alert("Error", "Failed to load TikTok video.");
        setLoading(false);
      }
    };

    if (url) {
      fetchEmbedCode();
    }
  }, [url]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!embedCode) {
    return <Text>No valid TikTok embed code found.</Text>;
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: embedCode }}
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

export default TikTokEmbed;
