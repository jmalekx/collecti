import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, Button, StyleSheet, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';

const AddButton = ({ onAddPost, onAddCollection, sharedUrl, platform, collections = [] }) => {
  const [isFabMenuVisible, setIsFabMenuVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddCollectionModalVisible, setIsAddCollectionModalVisible] = useState(false);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('Unsorted'); // Default collection
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');

  // Automatically open the modal and pre-fill the URL for Instagram and TikTok
  useEffect(() => {
    if (sharedUrl && (platform === 'instagram' || platform === 'tiktok')) {
      setImageUrl(sharedUrl); // Pre-fill the image URL field with the shared URL
      setIsModalVisible(true); // Open the "Add New Post" modal
    }
  }, [sharedUrl, platform]);

  const handleAddPost = () => {
    if (!image && !imageUrl) {
      Alert.alert('Error', 'Please select an image or paste an image URL');
      return;
    }
  
    const imageToUse = image ? image : imageUrl || DEFAULT_THUMBNAIL;
    const collectionToUse = selectedCollection || 'Unsorted';
  
    // Ensure platform is 'gallery' if not defined
    const platformToUse = platform || 'gallery';
    onAddPost(notes, tags, imageToUse, collectionToUse, platformToUse);
  
    setIsModalVisible(false);
    setNotes('');
    setTags('');
    setImage(null);
    setImageUrl('');
    setIsFabMenuVisible(false);
  };
  

  const handleAddCollection = () => {
    const trimmedName = newCollectionName.trim().toLowerCase();

    if (!trimmedName) {
      alert('Collection name cannot be empty!');
      return;
    }

    if (trimmedName === 'unsorted') {
      alert('You cannot name a collection "Unsorted" as it is the default collection.');
      return;
    }
    onAddCollection(newCollectionName, newCollectionDescription);
    setIsAddCollectionModalVisible(false);
    setNewCollectionName('');
    setNewCollectionDescription('');
    setIsFabMenuVisible(false);
  };

  const handleImagePicker = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 1 },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('Image picker error: ', response.errorMessage);
        } else {
          setImage(response.assets[0].uri);
        }
      }
    );
  };

  return (
    <View>
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

              <TextInput
                style={styles.input}
                placeholder="Enter Description"
                value={newCollectionDescription}
                onChangeText={setNewCollectionDescription}
              />

              <Button title="Create Collection" onPress={handleAddCollection} />
              <Button title="Cancel" onPress={() => setIsAddCollectionModalVisible(false)} />
            </View>
          </View>
        </Modal>
      )}

      {/* Quick Add / Detailed Add Modal */}
      {isModalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add to Collection</Text>

              {/* Image Upload or URL */}
              <TouchableOpacity onPress={handleImagePicker} style={styles.uploadButton}>
                <Text>Upload Image</Text>
              </TouchableOpacity>
              <TextInput
                placeholder="Or paste image URL"
                value={imageUrl}
                onChangeText={setImageUrl}
                style={styles.input}
              />

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

              {/* Dropdown to select collection */}
              <Picker
                selectedValue={selectedCollection}
                onValueChange={(itemValue) => setSelectedCollection(itemValue)}
                style={styles.input}
              >
                {collections.map((collection) => (
                  <Picker.Item key={collection.id} label={collection.name} value={collection.id} />
                ))}
              </Picker>

              <Button title="Quick Add" onPress={handleAddPost} />
              <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
            </View>
          </View>
        </Modal>
      )}

      {/* FAB Button */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setIsFabMenuVisible(!isFabMenuVisible)}
      >
        <Text style={styles.fabButtonText}>+</Text>
      </TouchableOpacity>

      {/* FAB Menu Options */}
      {isFabMenuVisible && (
        <View style={styles.fabMenu}>
          <TouchableOpacity style={styles.fabMenuItem} onPress={() => { setIsModalVisible(true); setIsFabMenuVisible(false); }}>
            <Text style={styles.fabMenuText}>Add New Post</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fabMenuItem} onPress={() => { setIsAddCollectionModalVisible(true); setIsFabMenuVisible(false); }}>
            <Text style={styles.fabMenuText}>Add New Collection</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  uploadButton: {
    backgroundColor: '#007bff',
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
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

export default AddButton;