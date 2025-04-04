//React and React Native core imports
import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Share, TouchableOpacity } from 'react-native';

//Third-party library external imports
import { WebView } from 'react-native-webview';

/*
  YouTubeEmbed Component

  Implements sandboxed embedding system for YouTube videos, normalising
  platform-specific web content into native application context.

  - URL parsing and validation
  - Injected JS for Custom HTML for embedding
  - iFrame isolation and content security
*/

const YouTubeEmbed = ({ url, style, scale = 1, isInteractive = false }) => {
    const [loading, setLoading] = useState(true);

    //Extract video ID from YouTube URL
    const extractVideoId = (youtubeUrl) => {
        if (!youtubeUrl) return null;

        //Handle different YouTube URL formats
        let videoId = null;

        //Format: youtube.com/watch?v=VIDEO_ID
        const watchRegex = /youtube\.com\/watch\?v=([^&]+)/;
        const watchMatch = youtubeUrl.match(watchRegex);
        if (watchMatch) {
            videoId = watchMatch[1];
        }

        //Format: youtu.be/VIDEO_ID
        const shortRegex = /youtu\.be\/([^?&]+)/;
        const shortMatch = youtubeUrl.match(shortRegex);
        if (shortMatch) {
            videoId = shortMatch[1];
        }

        //Format: youtube.com/embed/VIDEO_ID
        const embedRegex = /youtube\.com\/embed\/([^?&]+)/;
        const embedMatch = youtubeUrl.match(embedRegex);
        if (embedMatch) {
            videoId = embedMatch[1];
        }

        return videoId;
    };

    const videoId = extractVideoId(url);

    if (!videoId) {
        return (
            <View style={[styles.errorContainer, style]}>
                <Text style={styles.errorText}>Invalid YouTube URL</Text>
            </View>
        );
    }

    //Function to share YouTube video
    const shareVideo = async () => {
        try {
            const shareUrl = `https://youtu.be/${videoId}`;
            await Share.share({
                message: `Check out this YouTube video: ${shareUrl}`,
                url: shareUrl
            });
        } catch (error) {
            console.log('Error sharing video:', error);
        }
    };

    //Create embed URL for the iframe
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    //Custom HTML for responsive YouTube embed
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
        ${!isInteractive ? '<div class="overlay"></div>' : ''}
        <div class="embed-container">
          <iframe src="${embedUrl}?playsinline=1&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </body>
    </html>
  `;

    return (
        <View style={[styles.container, style]}>
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading YouTube video...</Text>
                </View>
            )}

            <WebView
                source={{ html: customHtml }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scrollEnabled={false}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                allowsFullscreenVideo={isInteractive}
                injectedJavaScript={!isInteractive ? `
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
          true;
        ` : ''}
            />

            {isInteractive && (
                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={shareVideo}
                >
                    <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
            )}
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
        position: 'relative',
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
    },
    shareButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 12,
    }
});

export default YouTubeEmbed;