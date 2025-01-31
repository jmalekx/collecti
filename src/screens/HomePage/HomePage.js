import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, Modal, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import { getAuth } from 'firebase/auth';
import { collection, doc, setDoc, addDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../FirebaseConfig';
import InstagramEmbed from '../APIs/InstagramEmbed';
import TikTokEmbed from '../APIs/TiktokEmbed';

const HomePage = () => {
  const { shareIntent } = useShareIntentContext();
  const [url, setUrl] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [userId, setUserId] = useState(null);
  const [isFabMenuVisible, setIsFabMenuVisible] = useState(false); // Manage FAB menu visibility
  const [isAddCollectionModalVisible, setIsAddCollectionModalVisible] = useState(false);

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
    const collectionId = selectedCollection || 'Unsorted'; 
    const postData = {
      url,
      platform,
      notes,
      tags: tags.split(',').map(tag => tag.trim()),
      createdAt: new Date(),
    };

    try {
      await setDoc(doc(FIREBASE_DB, 'users', userId, 'collections', collectionId, 'posts', new Date().toISOString()), postData);
      Alert.alert('Success', 'Post added successfully');
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error adding post: ', error);
      Alert.alert('Error', 'Failed to add post');
    }
  };

  const addCollection = async () => {
    if (!newCollectionName.trim()) {
      alert('Collection name cannot be empty!');
      return;
    }
  
    try {
      await addDoc(collection(FIREBASE_DB, 'users', userId, 'collections'), {
        name: newCollectionName,
        description: '', // Empty string for description initially
        createdAt: new Date().toISOString(),
        items: [], // Empty array for items initially
      });
      setNewCollectionName(''); // Clear input
      setIsFabMenuVisible(false); // Close the FAB menu
      setIsAddCollectionModalVisible(false); // Close the "Create Collection" popup
      Alert.alert('Success', 'Collection created successfully'); // Confirmation alert
    } catch (error) {
      console.error('Error adding collection: ', error);
      Alert.alert('Error', 'Failed to create collection');
    }
  };

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

      {/* Add New Collection Modal */}
      {isAddCollectionModalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={isAddCollectionModalVisible}
          onRequestClose={() => setIsAddCollectionModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add New Collection</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Collection Name"
                value={newCollectionName}
                onChangeText={setNewCollectionName}
              />
              <Button title="Create Collection" onPress={addCollection} />
              <Button title="Cancel" onPress={() => setIsAddCollectionModalVisible(false)} />
            </View>
          </View>
        </Modal>
      )}

      {/* Quick Add / Detailed Add Modal */}
      {userId && (
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
                  setSelectedCollection(null);
                  handleAddPost();
                }}
              />
              <Button
                title="Detailed Add (Choose Collection)"
                onPress={() => {
                  Alert.alert("Collection Selection", "Implement collection selection logic.");
                }}
              />
              <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
            </View>
          </View>
        </Modal>
      )}

      {/* FAB Button */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setIsFabMenuVisible(!isFabMenuVisible)} // Toggle FAB menu visibility
      >
        <Text style={styles.fabButtonText}>+</Text>
      </TouchableOpacity>

      {/* FAB Menu Options */}
      {isFabMenuVisible && (
        <View style={styles.fabMenu}>
          <TouchableOpacity style={styles.fabMenuItem} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.fabMenuText}>Add New Post</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fabMenuItem} onPress={() => setIsAddCollectionModalVisible(true)}>
            <Text style={styles.fabMenuText}>Add New Collection</Text>
          </TouchableOpacity>
        </View>
      )}
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
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabButtonText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  fabMenu: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 200,
    padding: 10,
  },
  fabMenuItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  fabMenuText: {
    fontSize: 16,
    color: '#007bff',
  },
});

export default function App() {
  return (
    <ShareIntentProvider>
      <HomePage />
    </ShareIntentProvider>
  );
};
