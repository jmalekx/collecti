import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const InstagramEmbed = ({ url, style }) => {
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(Date.now()); // Add a key to force remounting
  const webViewRef = useRef(null);
  
  useEffect(() => {
    // Reset the component when URL changes
    setLoading(true);
    setKey(Date.now());
  }, [url]);
  
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

  const embedUrl = `https://www.instagram.com/p/${postId}/embed`;
  
  const reload = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
      setLoading(true);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading Instagram post...</Text>
        </View>
      )}
      
      <WebView
        key={key} // This forces WebView to remount when navigating
        ref={webViewRef}
        source={{ uri: embedUrl }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onLoad={() => setLoading(false)}
        onError={(syntheticEvent) => {
          console.warn('WebView error: ', syntheticEvent.nativeEvent);
          setLoading(false);
        }}
        onHttpError={(syntheticEvent) => {
          console.warn('WebView HTTP error: ', syntheticEvent.nativeEvent);
          setLoading(false);
        }}
        renderError={(errorName) => {
          console.warn('WebView render error: ', errorName);
          setLoading(false);
          return (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load Instagram post.</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={reload}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        cacheEnabled={false}
        incognito={true} // Use incognito mode to prevent caching issues
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
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
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
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryText: {
    color: 'white',
    fontWeight: '500',
  }
});

export default InstagramEmbed;