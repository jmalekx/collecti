//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, Image } from 'react-native';

//Third-party library external imports
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/FontAwesome';

//Project services and utilities
import { extractPinId, resolveShortUrl, isDirectPinterestImage, createPinUrl } from '../../services/pinterest/pinterestHelpers';

//Custom component imports and styling
import LoadingIndicator from '../utilities/LoadingIndicator';
import commonStyles from '../../styles/commonStyles';
import embedstyles from '../../styles/embedstyles';

/*
  PinterestEmbed Component

  A component for embedding Pinterest pins, handling various URL formats:
  - Direct pinterest pin urls
  - Pinterest short urls (pin.it)
  - Direct image urls from Pinterest (using api)

  Renders content in one of three ways:
  - 1. A WebView with an embedded Pinterest pin
  - 2. A direct Image component (for direct image urls) 
  
*/

const PinterestEmbed = ({ url, style, scale = 1, isInteractive = false }) => {

  //State transitions`
  const [loading, setLoading] = useState(true);
  const [pinId, setPinId] = useState(null);
  const [pinUrl, setPinUrl] = useState('');
  const [isDirectImageUrl, setIsDirectImageUrl] = useState(false);

  useEffect(() => {
    if (url) {
      processUrl(url);
    }
  }, [url]);

  const processUrl = async (inputUrl) => {
    try {
      setLoading(true);

      //Check if direct image
      if (isDirectPinterestImage(inputUrl)) {
        setIsDirectImageUrl(true);
        setLoading(false);
        return;
      }

      //Otherwise oembed
      let extractedPinId = extractPinId(inputUrl);

      //Resolve short url if not found
      if (!extractedPinId && inputUrl.includes('pin.it')) {
        try {
          const resolvedUrl = await resolveShortUrl(inputUrl);
          extractedPinId = extractPinId(resolvedUrl);
        }
        catch (error) {
          console.log('Pinterest: Failed to resolve short URL:', error);
        }
      }

      if (extractedPinId) {
        //Create clean pin url
        const cleanUrl = createPinUrl(extractedPinId);
        setPinId(extractedPinId);
        setPinUrl(cleanUrl);
      }
      else {
        //Use original url if no id
        setPinUrl(inputUrl);
      }

      setLoading(false);
    }
    catch (error) {
      setLoading(false);
    }
  };

  //Custom HTMl embed
  const generateHtml = () => {
    if (!pinId) return '';

    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    .embed-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }
    .pinterest-container {
      width: 100%;
      max-width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      transform: scale(${scale});
      transform-origin: center;
    }
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
    <div class="pinterest-container">
      <a data-pin-do="embedPin" href="https://www.pinterest.com/pin/${pinId}/" data-pin-width="large"></a>
    </div>
    ${!isInteractive ? '<div class="overlay"></div>' : ''}
    </div>

    <script>
    //Add Pinterest embed script
    (function() {
      const script = document.createElement('script');
      script.async = true;
      script.src = "https://assets.pinterest.com/js/pinit.js";
      document.body.appendChild(script);
      
      //Block all interactions if not interactive
      if (!${isInteractive}) {
      // Make all links non-clickable
      const disableLinks = function() {
        const links = document.getElementsByTagName('a');
        for (let i = 0; i < links.length; i++) {
        links[i].style.pointerEvents = 'none';
        }
      };
      
      //Run once initially
      disableLinks();
      
      //Run again after Pinterest script has loaded
      script.onload = disableLinks;
      
      //Run continuously to catch dynamically added links
      setInterval(disableLinks, 500);
      
      //Block all clicks
      document.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, true);
      }
    })();
    </script>
  </body>
  </html>
  `;
  };

  const handleOpenPinterest = () => {
    if (pinUrl) {
      Linking.openURL(pinUrl);
    }
    else if (url) {
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <View style={[commonStyles.container]}>
        <View style={commonStyles.loadingContainer}>
          <LoadingIndicator />
        </View>
      </View>
    );
  }

  //For users own pins display image directly
  if (isDirectImageUrl) {
    return (
      <View style={[embedstyles.container, style]}>
        <Image
          source={{ uri: url }}
          style={embedstyles.image}
          resizeMode="cover"
        />
        <View style={embedstyles.pinterestBadge}>
          <Icon name="pinterest-p" size={16} color="white" />
        </View>
        {!isInteractive && (
          <TouchableOpacity
            style={embedstyles.overlay}
            activeOpacity={1}
            onPress={() => {/* Prevent interaction */ }}
          />
        )}
      </View>
    );
  }

  //Fallback view if cant get the pin ID
  if (!pinId) {
    return (
      <TouchableOpacity
        style={[embedstyles.container, style]}
        onPress={handleOpenPinterest}
        activeOpacity={0.8}
      >
        <View style={embedstyles.fallbackContainer}>
          <Icon name="pinterest-p" size={36} color="#E60023" />
          <Text style={embedstyles.fallbackTitle}>Pinterest Pin</Text>
          <Text style={embedstyles.fallbackSubtitle}>Tap to view on Pinterest</Text>
        </View>
      </TouchableOpacity>
    );
  }

  //Web view with Pinterest embed
  return (
    <View style={[embedstyles.container, style]}>
      <WebView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        source={{ html: generateHtml() }}
        style={embedstyles.webview}
        onLoadEnd={() => setLoading(false)}
        onLoad={() => setLoading(false)}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        cacheEnabled={false}
        incognito={true}
      />
    </View>
  );
};

export default PinterestEmbed;