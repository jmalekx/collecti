//React and React Native core imports
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

//Third-party library external imports
import WebView from 'react-native-webview';

//Custom component imports and styling
import commonStyles, { colours, shadowStyles } from '../../styles/commonStyles';
import embedstyles from '../../styles/embedstyles';
import LoadingIndicator from '../utilities/LoadingIndicator';

/*
  TiktokEmbed Component

  Implements sandboxed embedding system for content from Tiktok, normalising
  platform-specific web content into native application context.

  - URL parsing and validation
  - Injected JS for Custom HTML for embedding
  - Support for both video and photo carousel content

*/

const TikTokEmbed = ({ url, style, scale = 1, isInteractive = false }) => {

  //State transitions
  const [embedCode, setEmbedCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPhotoContent, setIsPhotoContent] = useState(false);
  const [authorName, setAuthorName] = useState('');

  //Check if URL is a photo/carousel content
  const isPhotoUrl = (url) => {
    return url && url.includes('/photo/');
  };

  //Extract username from URL
  const extractUsername = (url) => {
    if (!url) return '';
    const match = url.match(/@([^\/]+)/);
    return match ? match[1] : '';
  };

  //Custom HTML embed code for TikTok video - fetch TikTok embed code from oEmbed API
  useEffect(() => {
    const fetchEmbedCode = async () => {
      try {
        //Reset states
        setIsPhotoContent(false);
        setAuthorName('');

        //Check if this is a photo URL
        const photoContent = isPhotoUrl(url);
        if (photoContent) {
          setIsPhotoContent(true);
          setAuthorName(extractUsername(url));
          setLoading(false);
          return;
        }

        //For video content proceed with API call
        const response = await fetch(`https://www.tiktok.com/oembed?url=${url}`);
        const data = await response.json();

        //Extract author name if available
        if (data.author_name) {
          setAuthorName(data.author_name.replace('@', ''));
        }

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
        //If failed with API call, check if photo URL that we missed
        if (!isPhotoContent && isPhotoUrl(url)) {
          setIsPhotoContent(true);
          setAuthorName(extractUsername(url));
        }
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
      <View style={commonStyles.loadingContainer}>
        <LoadingIndicator />
      </View>
    );
  }

  //Photo carousel fallback
  if (isPhotoContent) {
    return (
      <View style={[embedstyles.container, style]}>
        <View style={{
          width: '100%',
          height: '100%',
          backgroundColor: colours.lightestpink,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          borderRadius: 8,
          ...shadowStyles.light
        }}>
          {/* TikTok logo/branding at top */}
          <View style={{

            top: 10,
            alignItems: 'center',
            zIndex: 2,
            flexDirection: 'row',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: 6,
            borderRadius: 12,
            ...shadowStyles.light
          }}>
            <Text style={{
              color: colours.lightestpink,
              fontWeight: 'bold',
              fontSize: 12
            }}>
              TikTok
            </Text>
          </View>

          {/* Content indicator */}
          <View style={{
            backgroundColor: colours.primary,
            padding: 12,
            borderRadius: 12,
            width: '80%',
            alignItems: 'center',
            ...shadowStyles.light
          }}>
            {/* User info */}
            {authorName ? (
              <Text style={{
                color: colours.buttonsTextPink,
                fontWeight: 'bold',
                fontSize: 12,
              }}>
                @{authorName}
              </Text>
            ) : null}

            <Text style={{
              color: colours.mainTexts,
              fontSize: 14,
              fontWeight: '500'
            }}>
              Photo Carousel
            </Text>
          </View>

          {/* Decoration elements */}
          <View style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <View style={{
              width: 15,
              height: 15,
              borderRadius: 15,
              backgroundColor: colours.buttonsTextPink,
              marginBottom: 5,
              ...shadowStyles.light
            }} />
            <View style={{
              width: 15,
              height: 15,
              borderRadius: 15,
              backgroundColor: colours.buttonsTextPink,
              marginBottom: 5,
              opacity: 0.5,
              ...shadowStyles.light
            }} />
            <View style={{
              width: 15,
              height: 15,
              borderRadius: 15,
              backgroundColor: colours.buttonsTextPink,
              opacity: 0.3,
              ...shadowStyles.light
            }} />
          </View>
        </View>
      </View>
    );
  }

  if (!embedCode) {
    return <Text>No valid TikTok embed code found.</Text>;
  }

  return (
    <View style={[embedstyles.container, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: embedCode }}
        style={embedstyles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
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

export default TikTokEmbed;