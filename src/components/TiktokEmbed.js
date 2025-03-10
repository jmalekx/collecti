import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';

const TikTokEmbed = ({ url, style, scale = 1 }) => {
  const [embedCode, setEmbedCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmbedCode = async () => {
      try {
        const response = await fetch(`https://www.tiktok.com/oembed?url=${url}`);
        const data = await response.json();
        const centeredHtml = `
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
              <style>
                body, html {
                  margin: 0;
                  padding: 0;
                  width: 100%;
                  height: 100%;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  overflow: hidden;
                  background: transparent;
                }
                .embed-container {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  width: 100%;
                  height: 100%;
                }
                iframe {
                  width: 100%;
                  height: 100%;
                  border: none;
                  transform: scale(${scale}); /* Use the prop value here */
                  transform-origin: center;
                }
              </style>
            </head>
            <body>
              <div class="embed-container">
                ${data.html}
              </div>
            </body>
          </html>
        `;
        setEmbedCode(centeredHtml);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch TikTok embed code:", error);
        setLoading(false);
      }
    };

    if (url) {
      fetchEmbedCode();
    }
  }, [url, scale]); 

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
        scalesPageToFit={true}
        scrollEnabled={false} // Disable scrolling
        injectedJavaScript={`
          // Adjust iframe size dynamically
          const iframe = document.querySelector('iframe');
          if (iframe) {
            iframe.style.width = '100%';
            iframe.style.height = '100%';
          }
          true; // Required for injectedJavaScript to work
        `}
        onMessage={() => {}}
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