import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator, Alert } from 'react-native';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import axios from 'axios';

const Home = () => {
  const { shareIntent } = useShareIntentContext();
  const [imageUrl, setImageUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = shareIntent?.webUrl || shareIntent?.text;
    if (url) {
      const instagramPostUrl = url;
      fetchInstagramPostDetails(instagramPostUrl);
    } else {
      console.warn("No valid webUrl or text in shareIntent");
    }
  }, [shareIntent]);

  const fetchInstagramPostDetails = async (postUrl) => {
    try {
      const regex = /(?:\/p\/)([\w-]+)(?:\/?)/;
      const matches = postUrl.match(regex);
      const postId = matches ? matches[1] : null;

      if (postId) {
        const response = await axios.get('https://instagram-scraper-api3.p.rapidapi.com/media_info', {
          params: { code_or_id_or_url: postId },
          headers: {
            'x-rapidapi-key': '91f8bcc39fmsh3c62f574d8e6f21p10890bjsn3e4115017744',
            'x-rapidapi-host': 'instagram-scraper-api3.p.rapidapi.com'
          }
        });

        const post = response.data?.data?.items?.[0];
        if (post) {
          const imageUrl = post.image_versions2?.candidates?.[0]?.url;
          const captionText = post.caption?.text || 'No caption available';

          setImageUrl(imageUrl);
          setCaption(captionText);
        } else {
          console.warn("No post data found.");
        }
      } else {
        console.warn("Invalid Instagram post ID.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch Instagram post details.");
      console.error("Error fetching Instagram post details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      {imageUrl ? (
        <>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
          <Text style={styles.caption}>{caption}</Text>
        </>
      ) : (
        <Text>No image found for this post.</Text>
      )}
    </View>
  );
};

export default function App() {
  return (
    <ShareIntentProvider>
      <Home />
    </ShareIntentProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  caption: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});
