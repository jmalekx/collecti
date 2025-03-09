import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const InstagramEmbed = ({ url, style }) => {
  const postId = url.split('/')[4];
  
  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ uri: `https://www.instagram.com/p/${postId}/embed` }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onError={(syntheticEvent) => {
          console.warn('WebView error: ', syntheticEvent.nativeEvent);
        }}
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
  },
  webview: {
    width: '100%',
    height: '100%',
  },
});

export default InstagramEmbed;