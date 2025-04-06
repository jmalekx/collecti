//React and React Native core imports
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

//Third-party library external imports
import WebView from 'react-native-webview';

//Custom component imports and styling
import commonStyles from '../../styles/commonStyles';
import LoadingIndicator from '../utilities/LoadingIndicator';

/*
  TiktokEmbed Component

  Implements sandboxed embedding system for content from Tiktok, normalising
  platform-specific web content into native application context.

  - URL parsing and validation
  - Injected JS for Custom HTMl for embedding

*/

const TikTokEmbed = ({ url, style, scale = 1, isInteractive = false }) => {

  //State transitions
  const [embedCode, setEmbedCode] = useState(null);
  const [loading, setLoading] = useState(true);

  //Custom HTML embed code for TikTok video -fetch TikTok embed code from oEmbed API
  useEffect(() => {
    const fetchEmbedCode = async () => {
      try {
        const response = await fetch(`https://www.tiktok.com/oembed?url=${url}`);
        const data = await response.json();
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
                  position: relative;
                }
                iframe {
                  width: 100%;
                  height: 100%;
                  border: none;
                  transform: scale(${scale});
                  transform-origin: center;
                  ${!isInteractive ? 'pointer-events: none;' : ''}
                }
                /* Transparent overlay to block interactions when not interactive */
                .overlay {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  z-index: 999;
                  background-color: transparent;
                  display: ${isInteractive ? 'none' : 'block'};
                }
              </style>
            </head>
            <body>
              <div class="embed-container">
                ${!isInteractive ? '<div class="overlay"></div>' : ''}
                ${data.html}
              </div>
            </body>
          </html>
        `;
        //State update after successful API interaction
        setEmbedCode(customHtml);
        setLoading(false);
      }
      catch (error) {
        setLoading(false);
      }
    };

    //Conditional execution
    if (url) {
      fetchEmbedCode();
    }
  }, [url, scale, isInteractive]);

  //Loading state render
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingIndicator />
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
        scrollEnabled={false}
        injectedJavaScript={`
          const iframe = document.querySelector('iframe');
          if (iframe) {
            iframe.style.width = '100%';
            iframe.style.height = '100%';
          }
          
          ${!isInteractive ? `
            document.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }, true);
            
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
            setInterval(disableLinks, 1000);
          ` : ''}
          true;
        `}
        onMessage={() => { }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default TikTokEmbed;