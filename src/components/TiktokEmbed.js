import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';

const TikTokEmbed = ({ url, style }) => {
  const [embedCode, setEmbedCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmbedCode = async () => {
      try {
        const response = await fetch(`https://www.tiktok.com/oembed?url=${url}`);
        const data = await response.json();
        setEmbedCode(data.html);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch TikTok embed code:", error);
        setLoading(false);
      }
    };

    if (url) {
      fetchEmbedCode();
    }
  }, [url]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!embedCode) {
    return <Text>No valid TikTok embed code found.</Text>;
  }

  return (
    <View style={[styles.container, style]}>
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
    width: '100%',
    height: 150, // Match the height from CollectionDetails
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  webview: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TikTokEmbed;