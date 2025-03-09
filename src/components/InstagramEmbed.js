import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const InstagramEmbed = ({ url, style }) => {
  // Handle different Instagram URL formats
  let postId;
  
  if (!url) {
    console.error('Invalid Instagram URL: URL is undefined');
    return null;
  }
  
  // Extract post ID from URL
  if (url.includes('/p/')) {
    // Format: https://www.instagram.com/p/ABC123/
    const parts = url.split('/');
    const pIndex = parts.indexOf('p');
    if (pIndex !== -1 && parts.length > pIndex + 1) {
      postId = parts[pIndex + 1];
    }
  } else if (url.includes('instagram.com')) {
    // Try to extract from any Instagram URL
    const match = url.match(/instagram\.com\/(?:p|reel)\/([^\/\?]+)/);
    postId = match ? match[1] : null;
  }
  
  if (!postId) {
    console.error('Could not extract Instagram post ID from:', url);
    return (
      <View style={[styles.errorContainer, style]}>
        <Text style={styles.errorText}>Invalid Instagram URL</Text>
      </View>
    );
  }

  // Clean up the post ID (remove any trailing slashes or parameters)
  postId = postId.split('?')[0].split('/')[0];
  
  console.log('Loading Instagram embed with post ID:', postId);

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
        onHttpError={(syntheticEvent) => {
          console.warn('WebView HTTP error: ', syntheticEvent.nativeEvent);
        }}
        renderError={(errorName) => {
          console.warn('WebView render error: ', errorName);
          return (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load Instagram post.</Text>
            </View>
          );
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  errorText: {
    color: '#666',
    fontSize: 14,
  },
});

export default InstagramEmbed;