import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, Modal, TextInput, StyleSheet } from 'react-native';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import { getAuth } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../FirebaseConfig';
import InstagramEmbed from '../APIs/InstagramEmbed';
import TikTokEmbed from '../APIs/TiktokEmbed';

const HomePage = () => {
  const { shareIntent } = useShareIntentContext();  // Extract the shareIntent context
  const [url, setUrl] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    console.log("Share Intent Data:", shareIntent);
    const extractedUrl = shareIntent?.webUrl || shareIntent?.text;
    if (extractedUrl) {
      console.log("Valid URL found:", extractedUrl);
      setUrl(extractedUrl);  // Set the URL if found
      detectPlatform(extractedUrl);  // Detect the platform
    } else {
      console.log("No valid URL found.");
    }

    // Get the current user
    const auth = getAuth();
    if (auth.currentUser) {
      setUserId(auth.currentUser.uid);
    }
  }, [shareIntent]);

  const detectPlatform = (url) => {
    if (url.includes('instagram.com')) {
      setPlatform('instagram');
    } else if (url.includes('pinterest.com')) {
      setPlatform('pinterest');
    } else if (url.includes('tiktok.com')) {
      setPlatform('tiktok');
    } else {
      setPlatform(null);
    }
  };

  const handleAddPost = async () => {
    const collectionId = selectedCollection || 'Unsorted'; // Default to 'Unsorted'
    const postData = {
      url,
      platform,
      notes,
      tags: tags.split(',').map(tag => tag.trim()), // Split tags by comma
      createdAt: new Date(),
    };

    // Add to Firestore (both collection and posts)
    try {
      await setDoc(doc(FIREBASE_DB, 'users', userId, 'collections', collectionId, 'posts', new Date().toISOString()), postData);
      Alert.alert('Success', 'Post added successfully');
      setIsModalVisible(false);  // Close the modal
    } catch (error) {
      console.error('Error adding post: ', error);
      Alert.alert('Error', 'Failed to add post');
    }
  };

  if (!url) {
    return <Text>No valid URL provided.</Text>;  // Return a fallback if URL is not found
  }

  const renderPlatformEmbed = () => {
    switch (platform) {
      case 'instagram':
        return <InstagramEmbed url={url} />;
      case 'pinterest':
        return <PinterestAPI url={url} />;
      case 'tiktok':
        return <TikTokEmbed url={url} />;
      default:
        return <Text>Unsupported platform or invalid URL.</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {renderPlatformEmbed()}
      
      {/* Quick Add / Detailed Add Modal */}
      {userId && (
        <Button title="Share Post" onPress={() => setIsModalVisible(true)} />
      )}
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add to Collection</Text>

            <TextInput
              placeholder="Enter Notes"
              value={notes}
              onChangeText={setNotes}
              style={styles.input}
            />
            <TextInput
              placeholder="Enter Tags (comma separated)"
              value={tags}
              onChangeText={setTags}
              style={styles.input}
            />

            <Button
              title="Quick Add (Auto Add to Unsorted)"
              onPress={() => {
                setSelectedCollection(null);  // Default to 'Unsorted'
                handleAddPost();
              }}
            />
            <Button
              title="Detailed Add (Choose Collection)"
              onPress={() => {
                // Here, you can navigate to a collection selection screen if needed
                Alert.alert("Collection Selection", "Implement collection selection logic.");
              }}
            />
            <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    padding: 8,
    borderRadius: 5,
  },
});

export default function App() {
  return (
    <ShareIntentProvider>
      <HomePage />
    </ShareIntentProvider>
  );
}
