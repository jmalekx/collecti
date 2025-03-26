/*
  React and React Native core imports
*/
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
/* 
  Custom component imports and styling
*/
import commonStyles from '../commonStyles';


/*
  InstagramEmbed Component

  Implements sandboxed embedding system for content from Instagram, normalising
  platform-specific web content into native application context.

  - URL parsing and validation
  - Injected JS for Custom HTMl for embedding
  - iFrame isolation and content security with navigation restrictions

*/

const InstagramEmbed = ({ url, style, scale = 1 }) => {
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(Date.now());
  const [initialUrl, setInitialUrl] = useState('');
  const webViewRef = useRef(null);

  //Resetting component after change of URL or scale prop
  useEffect(() => {
    setLoading(true);
    setKey(Date.now());
  }, [url, scale]);

  //URL validation and parsing
  let postId;
  if (!url) {
    console.error('Invalid Instagram URL: URL is undefined');
    return null;
  }

  //Strat 1: Standard path-based parsing (extracting post id from url)
  if (url.includes('/p/')) {
    // Format: https://www.instagram.com/p/ABC123/
    const parts = url.split('/');
    const pIndex = parts.indexOf('p');
    if (pIndex !== -1 && parts.length > pIndex + 1) {
      postId = parts[pIndex + 1];
    }
  } 
  //Strat 2: Regex-based parsing
  else if (url.includes('instagram.com')) {
    const match = url.match(/instagram\.com\/(?:p|reel)\/([^\/\?]+)/);
    postId = match ? match[1] : null;
  }

  //Error handling
  if (!postId) {
    console.error('Could not extract Instagram post ID from:', url);
    return (
      <View style={[styles.errorContainer, style]}>
        <Text style={styles.errorText}>Invalid Instagram URL</Text>
      </View>
    );
  }

  //Clean up post ID
  postId = postId.split('?')[0].split('/')[0];
  console.log('Loading Instagram embed with post ID:', postId);
  
  //Using direct embed URL
  const embedUrl = `https://www.instagram.com/p/${postId}/embed/captioned`;

  useEffect(() => {
    if (embedUrl) {
      setInitialUrl(embedUrl);
    }
  }, [embedUrl]);

  //Reloading webview
  const reload = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
      setLoading(true);
    }
  };

  //Custom HTML viewer for embed for proper fitting/adjustment to UI
  const customHtml = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: transparent;
          }
          .embed-container {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            pointer-events: none;
          }
          iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: ${100 / scale}%;
            height: ${100 / scale}%;
            transform: scale(${scale});
            transform-origin: 0 0;
            border: none;
            pointer-events: none;
          }
          /*Transparent overlay to intercept all clicks/navigations that embed usually has*/
          .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 999;
            background-color: transparent;
          }
        </style>
      </head>
      <body>
        <!--Transparent overlay to catch all clicks -->
        <div class="overlay"></div>
        
        <div class="embed-container">
          <iframe src="${embedUrl}" frameborder="0" scrolling="no" allowtransparency="true"></iframe>
        </div>
        
        <script>
          //Adjust container size after iframe loads
          window.onload = function() {
            const iframe = document.querySelector('iframe');
            const overlay = document.querySelector('.overlay');
            
            //Intercept all clicks
            document.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }, true);
            
            overlay.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }, true);
            
            iframe.onload = function() {
              iframe.style.opacity = 1;
            };
          };
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading Instagram post...</Text>
        </View>
      )}

      <WebView
        key={key}
        ref={webViewRef}
        source={{ html: customHtml }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scrollEnabled={false}

        //System to prevent navigation from app due to embedded content
        onShouldStartLoadWithRequest={(request) => {
          // Only allow the initial load of custom HTML and the embedded iframe
          if (!initialUrl) {
            return true;
          }

          //Always allow about:blank and custom HTML
          if (request.url.startsWith('about:blank') ||
            request.url.startsWith('data:text/html') ||
            request.url === initialUrl ||
            request.url === embedUrl) {
            return true;
          }

          //Any other URL, prevent loading and return to custom HTML
          console.log('Blocking navigation to:', request.url);
          setTimeout(() => {
            if (webViewRef.current) {
              webViewRef.current.stopLoading();
              //Force reload custom HTML if needed
              if (webViewRef.current && webViewRef.current.injectJavaScript) {
                webViewRef.current.injectJavaScript(`
                  if (window.location.href !== '${embedUrl}' && 
                      !window.location.href.startsWith('about:blank') && 
                      !window.location.href.startsWith('data:text/html')) {
                    window.location.href = 'about:blank';
                  }
                  true;
                `);
              }
            }
          }, 100);

          return false;
        }}

        //Additional navigation blocking
        onNavigationStateChange={(navState) => {
          if (initialUrl &&
            navState.url !== initialUrl &&
            navState.url !== embedUrl &&
            !navState.url.startsWith('about:blank') &&
            !navState.url.startsWith('data:text/html')) {

            console.log('Detected navigation to:', navState.url);
            if (webViewRef.current) {
              webViewRef.current.stopLoading();
              setTimeout(() => {
                //Reset to custom HTML
                setKey(Date.now()); //Force complete reload
              }, 100);
            }
          }
        }}

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
        injectedJavaScript={`
          //Add click-blocking overlay
          if (!document.querySelector('.overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            overlay.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }, true);
            document.body.appendChild(overlay);
          }
          
          //Block all clicks
          document.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }, true);
          
          //Make all links non-clickable
          const disableLinks = function() {
            const links = document.getElementsByTagName('a');
            for (let i = 0; i < links.length; i++) {
              links[i].style.pointerEvents = 'none';
              links[i].addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }, true);
              links[i].href = 'javascript:void(0)';
            }
          };
          
          disableLinks();
          
          // Run continuously to catch dynamically added links
          setInterval(disableLinks, 1000);
          
          true;
        `}
        cacheEnabled={false}
        incognito={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  container: {
    width: '100%',
    height: 150,
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