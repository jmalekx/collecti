import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useToast } from "react-native-toast-notifications";
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import pinterestService from '../services/pinterest/pinterestServices';
import { AppText, AppHeading, AppButton, AppTextInput } from '../components/Typography';

const AddButton = ({ onAddPost, onAddCollection, sharedUrl, platform, collections = [] }) => {
  const toast = useToast();
  const isScreenFocused = useIsFocused();
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
  const [isAddingNewCollection, setIsAddingNewCollection] = useState(false);
  const [pendingNewCollection, setPendingNewCollection] = useState(null);

  useEffect(() => {
    if (!isScreenFocused) {
      setIsFabMenuVisible(false);
    }
  }, [isScreenFocused]);

  // Automatically open the modal and pre-fill the URL for Instagram, TikTok, and Pinterest
  useEffect(() => {
    console.log("==== ADD BUTTON EFFECT ====");
    console.log("sharedUrl:", sharedUrl);
    console.log("platform:", platform);
    console.log("Should open modal:", Boolean(sharedUrl && (platform === 'instagram' || platform === 'tiktok' || platform === 'pinterest')));

    if (sharedUrl && (platform === 'instagram' || platform === 'tiktok' || platform === 'pinterest')) {
      setImageUrl(sharedUrl); // Pre-fill the image URL field with the shared URL
      setIsModalVisible(true); // Open the "Add New Post" modal
    }
  }, [sharedUrl, platform]);

  const resetModalStates = () => {
    setImage(null);
    setImageUrl('');
    setNotes('');
    setTags('');
    setSelectedCollection('Unsorted');
    setNewCollectionName('');
    setNewCollectionDescription('');
    setIsAddingNewCollection(false);
    setPendingNewCollection(null);
  };

  const fetchPinterestData = async (url) => {
    try {
      if (platform === 'pinterest' && url) {
        // Extract pin ID from URL
        const pinId = url.match(/pin\/(\d+)/)?.[1];
        if (pinId) {
          const pinData = await pinterestService.fetchPinData(pinId);
          setImageUrl(pinData.image);
          setNotes(pinData.description || '');
        }
      }
    } catch (error) {
      console.error('Error fetching Pinterest data:', error);
      toast.show("Failed to fetch Pinterest data", { type: "warning" });
    }
  };

  useEffect(() => {
    if (isModalVisible && platform === 'pinterest' && sharedUrl) {
      fetchPinterestData(sharedUrl);
    }
  }, [isModalVisible, platform, sharedUrl]);

  const handleAddPost = () => {
    if (!image && !imageUrl) {
      toast.show("Please select an image or paste an Image URL", { type: "warning" });
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
    setIsAddingNewCollection(false);
  };

  const handleAddCollection = (name, description) => {
    const trimmedName = name.trim().toLowerCase();

    if (!trimmedName) {
      toast.show("Collection name cannot be empty!", { type: "warning" });
      return;
    }

    if (trimmedName === 'unsorted') {
      toast.show('Cannot use "Unsorted" as a collection name', { type: "warning" });
      return;
    }

    // Call parent function to add collection
    onAddCollection(trimmedName, description);
    // Store the pending collection name
    setPendingNewCollection(trimmedName);
    setIsAddCollectionModalVisible(false);
  };

  // Add this useEffect to handle the new collection selection
  useEffect(() => {
    if (pendingNewCollection && collections.length > 0) {
      const newCollection = collections.find(c => c.name.toLowerCase() === pendingNewCollection.toLowerCase());
      if (newCollection) {
        setSelectedCollection(newCollection.id);
        setPendingNewCollection(null);
      }
    }
  }, [collections, pendingNewCollection]);

  // Modify the checkmark button's onPress handler
  const handleQuickAddCollection = () => {
    if (!newCollectionName.trim()) {
      toast.show("Collection name cannot be empty", { type: "warning" });
      return;
    }

    handleAddCollection(newCollectionName, '');
    setIsAddingNewCollection(false);
    setNewCollectionName('');
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
          onRequestClose={() => {
            resetModalStates();
            setIsAddCollectionModalVisible(false);
          }}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <AppHeading style={styles.modalTitle}>Create New Collection</AppHeading>
                <TouchableOpacity onPress={() => setIsAddCollectionModalVisible(false)}>
                  <Ionicons name="close-outline" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <AppTextInput
                style={styles.input}
                placeholder="Collection Name"
                value={newCollectionName}
                onChangeText={setNewCollectionName}
              />

              <AppTextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (optional)"
                value={newCollectionDescription}
                onChangeText={setNewCollectionDescription}
                multiline={true}
                numberOfLines={3}
              />

              <View style={styles.buttonRow}>
                <AppButton
                  style={[styles.actionButton, styles.cancelButton]}
                  title="Cancel"
                  onPress={() => setIsAddCollectionModalVisible(false)}
                  textStyle={styles.buttonText}
                />
                <AppButton
                  style={[styles.actionButton, styles.confirmButton]}
                  title="Create Collection"
                  onPress={() => handleAddCollection(newCollectionName, newCollectionDescription)}
                  textStyle={styles.buttonTextWhite}
                />
              </View>
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
              <View style={styles.modalHeader}>
                <AppHeading style={styles.modalTitle}>Add to Collection</AppHeading>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <Ionicons name="close-outline" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.scrollContainer}>
                {/* Image Upload or URL */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Image</Text>
                  <TouchableOpacity onPress={handleImagePicker} style={styles.uploadButton}>
                    <Ionicons name="images-outline" size={24} color="#fff" />
                    <Text style={styles.uploadButtonText}>Choose Image</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.orText}>OR</Text>
                  
                  <AppTextInput
                    placeholder="Paste image URL"
                    value={imageUrl}
                    onChangeText={setImageUrl}
                    style={styles.input}
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Details</Text>
                  <AppTextInput
                    placeholder="Notes"
                    value={notes}
                    onChangeText={setNotes}
                    style={[styles.input, styles.textArea]}
                    multiline={true}
                    numberOfLines={3}
                  />
                  
                  <AppTextInput
                    placeholder="Tags (comma separated)"
                    value={tags}
                    onChangeText={setTags}
                    style={styles.input}
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Select Collection</Text>
                  {/* Collection selection */}
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedCollection}
                      onValueChange={(itemValue) => {
                        if (itemValue === 'new') {
                          setIsAddingNewCollection(true);
                        } else {
                          setSelectedCollection(itemValue);
                        }
                      }}
                      style={styles.picker}
                    >
                      {collections.map((collection) => (
                        <Picker.Item key={collection.id} label={collection.name} value={collection.id} />
                      ))}
                      <Picker.Item label="+ Add New Collection" value="new" />
                    </Picker>
                  </View>

                  {/* Modify the Picker's add new collection section */}
                  {isAddingNewCollection && (
                    <View style={styles.newCollectionContainer}>
                      <AppTextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="New Collection Name"
                        value={newCollectionName}
                        onChangeText={setNewCollectionName}
                      />
                      <TouchableOpacity
                        style={styles.checkmarkButton}
                        onPress={handleQuickAddCollection}
                      >
                        <Ionicons name="checkmark-outline" size={24} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </ScrollView>

              <View style={styles.buttonRow}>
                <AppButton
                  style={[styles.actionButton, styles.cancelButton]}
                  title="Cancel"
                  onPress={() => setIsModalVisible(false)}
                  textStyle={styles.buttonText}
                />
                <AppButton
                  style={[styles.actionButton, styles.confirmButton]}
                  title="Add Post"
                  onPress={handleAddPost}
                  textStyle={styles.buttonTextWhite}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* FAB Button */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setIsFabMenuVisible(!isFabMenuVisible)}
      >
        <Ionicons name="add-outline" size={30} color="#fff" />
      </TouchableOpacity>

      {/* FAB Menu Options */}
      {isFabMenuVisible && (
        <View style={styles.fabMenu}>
          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={() => {
              resetModalStates();
              setIsModalVisible(true);
              setIsFabMenuVisible(false);
            }}
          >
            <MaterialIcons name="post-add" size={24} color="#007bff" style={styles.menuIcon} />
            <Text style={styles.fabMenuText}>Add New Post</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={() => {
              resetModalStates();
              setIsAddCollectionModalVisible(true);
              setIsFabMenuVisible(false);
            }}
          >
            <Ionicons name="folder-open" size={24} color="#007bff" style={styles.menuIcon} />
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
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContainer: {
    maxHeight: '70%',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  newCollectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkmarkButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 8,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  buttonTextWhite: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabMenu: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    width: 200,
    overflow: 'hidden',
  },
  fabMenuItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  fabMenuText: {
    fontSize: 16,
    color: '#333',
  },
});

export default AddButton;