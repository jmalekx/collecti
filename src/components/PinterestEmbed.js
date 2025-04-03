import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Linking, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/FontAwesome';

const PinterestEmbed = ({ url, style }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pinId, setPinId] = useState(null);
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [isDirectImageUrl, setIsDirectImageUrl] = useState(false);
  
  useEffect(() => {
    if (url) {
      processUrl(url);
    }
  }, [url]);

  const processUrl = async (inputUrl) => {
    try {
      console.log('Pinterest: Processing URL:', inputUrl);
      setLoading(true);
      setError(null);

      // Check if this is a direct image URL (for user's own pins)
      if (
        inputUrl.includes('.jpg') || 
        inputUrl.includes('.jpeg') || 
        inputUrl.includes('.png') || 
        inputUrl.includes('.webp') ||
        inputUrl.includes('pinimg.com')
      ) {
        console.log('Pinterest: This is a direct image URL from user\'s own pin');
        setIsDirectImageUrl(true);
        setLoading(false);
        return;
      }
      
      // Otherwise, this is a Pinterest link that needs embedding
      // Extract pin ID from the URL
      let extractedPinId = extractPinId(inputUrl);
      
      // If not found and it's a short URL, resolve it first
      if (!extractedPinId && inputUrl.includes('pin.it')) {
        try {
          const resolvedUrl = await resolveShortUrl(inputUrl);
          console.log('Pinterest: Resolved short URL to:', resolvedUrl);
          extractedPinId = extractPinId(resolvedUrl);
        } catch (err) {
          console.error('Pinterest: Failed to resolve short URL:', err);
        }
      }

      if (extractedPinId) {
        // Create a clean Pinterest URL
        const cleanUrl = `https://www.pinterest.com/pin/${extractedPinId}/`;
        console.log('Pinterest: Using canonical URL:', cleanUrl);
        setPinId(extractedPinId);
        setCanonicalUrl(cleanUrl);
      } else {
        // If we couldn't extract a pin ID, use the original URL
        console.log('Pinterest: No pin ID found, using original URL');
        setCanonicalUrl(inputUrl);
        setError('Could not extract Pinterest pin ID');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Pinterest: Error processing URL:', err);
      setError('Could not load Pinterest pin');
      setLoading(false);
    }
  };

  const extractPinId = (url) => {
    try {
      // Match pin ID from various Pinterest URL formats
      const patterns = [
        /pinterest\.com\/pin\/(\d+)/i,
        /\/pin\/(\d+)/i
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          console.log('Pinterest: Extracted pin ID:', match[1]);
          return match[1];
        }
      }
      
      return null;
    } catch (err) {
      console.error('Pinterest: Error extracting pin ID:', err);
      return null;
    }
  };

  const resolveShortUrl = async (shortUrl) => {
    // Make a HEAD request to follow redirects
    try {
      const response = await fetch(shortUrl, {
        method: 'HEAD',
        redirect: 'follow'
      });
      
      return response.url;
    } catch (err) {
      console.error('Pinterest: Error resolving URL:', err);
      throw err;
    }
  };

  const generateHtml = () => {
    if (!pinId) return '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: transparent;
          }
          .pinterest-container {
            width: 100%;
            max-width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        </style>
      </head>
      <body>
        <div class="pinterest-container">
          <a data-pin-do="embedPin" href="https://www.pinterest.com/pin/${pinId}/" data-pin-width="large"></a>
        </div>

        <script>
          // Add Pinterest embed script
          window.onload = function() {
            const script = document.createElement('script');
            script.async = true;
            script.src = "https://assets.pinterest.com/js/pinit.js";
            document.body.appendChild(script);
          }
        </script>
      </body>
      </html>
    `;
  };

  const handleOpenPinterest = () => {
    if (canonicalUrl) {
      Linking.openURL(canonicalUrl);
    } else if (url) {
      Linking.openURL(url);
    }
  };

  const handleRetry = () => {
    if (url) {
      processUrl(url);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#E60023" />
        </View>
      </View>
    );
  }

  // For user's own pins, display the image directly
  if (isDirectImageUrl) {
    return (
      <View style={[styles.container, style]}>
        <Image 
          source={{ uri: url }} 
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.pinterestBadge}>
          <Icon name="pinterest-p" size={16} color="white" />
        </View>
      </View>
    );
  }

  // For error state
  if (error) {
    return (
      <TouchableOpacity 
        style={[styles.container, style]} 
        onPress={handleOpenPinterest}
        activeOpacity={0.8}
      >
        <View style={styles.fallbackContainer}>
          <Icon name="pinterest-p" size={36} color="#E60023" />
          <Text style={styles.fallbackTitle}>Pinterest Pin</Text>
          <Text style={styles.fallbackSubtitle}>Tap to view on Pinterest</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  // Fallback view if we can't get the pin ID
  if (!pinId) {
    return (
      <TouchableOpacity 
        style={[styles.container, style]} 
        onPress={handleOpenPinterest}
        activeOpacity={0.8}
      >
        <View style={styles.fallbackContainer}>
          <Icon name="pinterest-p" size={36} color="#E60023" />
          <Text style={styles.fallbackTitle}>Pinterest Pin</Text>
          <Text style={styles.fallbackSubtitle}>Tap to view on Pinterest</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Web view with Pinterest embed
  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ html: generateHtml() }}
        style={styles.webview}
        onLoadEnd={() => setLoading(false)}
        onLoad={() => setLoading(false)}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onError={() => {
          console.error('Pinterest: WebView error');
          setError('Failed to load Pinterest content');
        }}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 350,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayButton: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(230, 0, 35, 0.9)',
    paddingVertical: 8,
    margin: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  overlayButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  fallbackSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#E60023',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryText: {
    color: 'white',
    fontWeight: '500',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pinterestBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#E60023',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default PinterestEmbed;