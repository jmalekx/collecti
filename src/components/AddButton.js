import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useToast } from 'react-native-toast-notifications';
import { useIsFocused } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import pinterestService from '../services/pinterest/pinterestServices';
import { AppText, AppHeading, AppButton, AppTextInput } from './Typography';
import { showToast, TOAST_TYPES } from './Toasts';
import { uploadImageToCloudinary } from '../services/storage';

const AddButton = ({
  onAddPost,
  onCreateCollection,
  collections = [],
  sharedUrl,
  platform
}) => {
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
  const [activeTab, setActiveTab] = useState('image'); // 'image' or 'url'
  const [currentPlatform, setCurrentPlatform] = useState('gallery');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isScreenFocused) {
      setIsFabMenuVisible(false);
    }
  }, [isScreenFocused]);

  // Set default collection if available
  useEffect(() => {
    if (collections.length > 0) {
      // Set Unsorted as default collection if available
      const unsortedCollection = collections.find(coll => coll.name === 'Unsorted');
      if (unsortedCollection) {
        setSelectedCollection(unsortedCollection.id);
      } else {
        // Otherwise use the first collection
        setSelectedCollection(collections[0].id);
      }
    }
  }, [collections]);

  // Automatically open the modal and pre-fill the URL for Instagram, TikTok, and Pinterest
  useEffect(() => {
    console.log("==== ADD BUTTON EFFECT ====");
    console.log("sharedUrl:", sharedUrl);
    console.log("platform:", platform);
    console.log("Should open modal:", Boolean(sharedUrl && (platform === 'instagram' || platform === 'tiktok' || platform === 'pinterest')));

    if (sharedUrl && (platform === 'instagram' || platform === 'tiktok' || platform === 'pinterest')) {
      setImageUrl(sharedUrl); // Pre-fill the image URL field with the shared URL
      setCurrentPlatform(platform); // Set the platform
      setActiveTab('url'); // Switch to URL tab
      setIsModalVisible(true); // Open the modal
    }
  }, [sharedUrl, platform]);

  const resetModalStates = () => {
    setImage(null);
    setImageUrl('');
    setNotes('');
    setTags('');
    
    // Find Unsorted collection if it exists
    const unsortedCollection = collections.find(coll => coll.name === 'Unsorted');
    if (unsortedCollection) {
      setSelectedCollection(unsortedCollection.id);
    } else if (collections.length > 0) {
      setSelectedCollection(collections[0].id);
    } else {
      setSelectedCollection('Unsorted'); // Fallback to string if no collections
    }
    
    setNewCollectionName('');
    setNewCollectionDescription('');
    setIsAddingNewCollection(false);
    setPendingNewCollection(null);
    setActiveTab('image');
    setCurrentPlatform('gallery');
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
      showToast(toast, "Failed to fetch Pinterest data", { type: TOAST_TYPES.WARNING });
    }
  };

  useEffect(() => {
    if (isModalVisible && platform === 'pinterest' && sharedUrl) {
      fetchPinterestData(sharedUrl);
    }
  }, [isModalVisible, platform, sharedUrl]);

  const handleAddPost = async () => {
    if (!image && !imageUrl) {
      showToast(toast, "Please select an image or paste an Image URL", { type: TOAST_TYPES.WARNING });
      return;
    }

    // Validate collection
    if (!selectedCollection) {
      showToast(toast, "Please select a collection", { type: TOAST_TYPES.WARNING });
      return;
    }

    try {
      setIsLoading(true);

      let imageToUse = imageUrl;
      let platformToUse = currentPlatform;

      // For image from gallery, upload to Cloudinary
      if (image) {
        try {
          // Upload the image and get back a URL
          imageToUse = await uploadImageToCloudinary(image);
          platformToUse = 'gallery';
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          showToast(toast, "Failed to upload image", { type: TOAST_TYPES.DANGER });
          setIsLoading(false);
          return;
        }
      } else if (imageUrl.includes('instagram.com')) {
        platformToUse = 'instagram';
      } else if (imageUrl.includes('tiktok.com')) {
        platformToUse = 'tiktok';
      } else if (imageUrl.includes('pinterest.com')) {
        platformToUse = 'pinterest';
      }

      // Add post with the image URL (either from Cloudinary or direct URL)
      await onAddPost(notes, tags, imageToUse, selectedCollection, platformToUse);

      // Reset form and close modal
      resetModalStates();
      setIsModalVisible(false);
      setIsFabMenuVisible(false);

    } catch (error) {
      console.error('Error adding post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCollection = async (name, description) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      showToast(toast, "Collection name cannot be empty!", { type: TOAST_TYPES.WARNING });
      return;
    }

    if (trimmedName.toLowerCase() === 'unsorted') {
      showToast(toast, 'Cannot use "Unsorted" as a collection name', { type: TOAST_TYPES.WARNING });
      return;
    }

    try {
      // Call parent function to add collection
      const collectionId = await onCreateCollection(trimmedName, description);
      // Store the collection ID
      setSelectedCollection(collectionId);
      setIsAddCollectionModalVisible(false);
      return collectionId;
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  // Handle quick add collection
  const handleQuickAddCollection = async () => {
    if (!newCollectionName.trim()) {
      showToast(toast, "Collection name cannot be empty", { type: TOAST_TYPES.WARNING });
      return;
    }

    const collectionId = await handleAddCollection(newCollectionName, '');
    if (collectionId) {
      setIsAddingNewCollection(false);
      setNewCollectionName('');
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast(toast, "Permission to access media library is required", { type: TOAST_TYPES.WARNING });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.5,
        compress: 0.5,
        base64: false,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setCurrentPlatform('gallery');
        setActiveTab('image');
        setImageUrl(''); // Clear URL when image is picked
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showToast(toast, "Failed to pick image", { type: TOAST_TYPES.DANGER });
    }
  };

  return (
    <View>
      {/* Add New Collection Modal */}
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

      {/* Add Post Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          resetModalStates();
          setIsModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackground}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <AppHeading style={styles.modalTitle}>Add to Collection</AppHeading>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer}>
              {/* Tab Selector */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === 'image' && styles.activeTabButton,
                  ]}
                  onPress={() => setActiveTab('image')}
                >
                  <Text style={[
                    styles.tabButtonText,
                    activeTab === 'image' && styles.activeTabButtonText,
                  ]}>Gallery Image</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === 'url' && styles.activeTabButton,
                  ]}
                  onPress={() => setActiveTab('url')}
                >
                  <Text style={[
                    styles.tabButtonText,
                    activeTab === 'url' && styles.activeTabButtonText,
                  ]}>Image URL</Text>
                </TouchableOpacity>
              </View>

              {/* Image Picker Section */}
              {activeTab === 'image' && (
                <View style={styles.imageSection}>
                  {image ? (
                    <View style={styles.selectedImageContainer}>
                      <Image source={{ uri: image }} style={styles.selectedImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => setImage(null)}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.pickImageButton}
                      onPress={pickImage}
                    >
                      <Ionicons name="image-outline" size={40} color="#007AFF" />
                      <Text style={styles.pickImageText}>Select Image from Gallery</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* URL Input Section */}
              {activeTab === 'url' && (
                <View style={styles.urlSection}>
                  <AppTextInput
                    placeholder="Paste an Image URL here"
                    value={imageUrl}
                    onChangeText={text => {
                      setImageUrl(text);
                      // Auto-detect platform
                      if (text.includes('instagram.com')) {
                        setCurrentPlatform('instagram');
                      } else if (text.includes('tiktok.com')) {
                        setCurrentPlatform('tiktok');
                      } else if (text.includes('pinterest.com')) {
                        setCurrentPlatform('pinterest');
                      } else {
                        setCurrentPlatform('other');
                      }
                    }}
                    style={styles.urlInput}
                  />

                  {/* Platform indicator */}
                  {imageUrl && (
                    <View style={styles.platformIndicator}>
                      <Text style={styles.platformText}>
                        {currentPlatform === 'instagram' ? 'Instagram Content' :
                          currentPlatform === 'tiktok' ? 'TikTok Content' :
                            currentPlatform === 'pinterest' ? 'Pinterest Content' :
                              'Web Content'}
                      </Text>
                      {currentPlatform === 'instagram' && <Ionicons name="logo-instagram" size={20} color="#E1306C" />}
                      {currentPlatform === 'tiktok' && <Ionicons name="logo-tiktok" size={20} color="#000000" />}
                      {currentPlatform === 'pinterest' && <Ionicons name="logo-pinterest" size={20} color="#E60023" />}
                    </View>
                  )}
                </View>
              )}

              {/* Notes Section */}
              <AppTextInput
                placeholder="Notes"
                value={notes}
                onChangeText={setNotes}
                multiline
                style={styles.notesInput}
              />

              {/* Tags Input */}
              <AppTextInput
                placeholder="Tags (comma separated)"
                value={tags}
                onChangeText={setTags}
                style={styles.tagsInput}
              />

              {/* Collection Selector Section */}
              <View style={styles.collectionSelectorSection}>
                <Text style={styles.sectionLabel}>Add to Collection:</Text>

                {isAddingNewCollection ? (
                  // New Collection Input
                  <View style={styles.newCollectionContainer}>
                    <AppTextInput
                      placeholder="New Collection Name"
                      value={newCollectionName}
                      onChangeText={setNewCollectionName}
                      style={styles.newCollectionInput}
                    />
                    <TouchableOpacity
                      style={styles.checkmarkButton}
                      onPress={handleQuickAddCollection}
                    >
                      <Ionicons name="checkmark-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  // Collection Picker
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
                )}
              </View>
            </ScrollView>

            {/* Modal Footer */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Uploading image...</Text>
              </View>
            ) : (
              <View style={styles.buttonRow}>
                <AppButton
                  style={[styles.actionButton, styles.cancelButton]}
                  title="Cancel"
                  onPress={() => {
                    resetModalStates();
                    setIsModalVisible(false);
                  }}
                  textStyle={styles.buttonText}
                />
                <AppButton
                  style={[styles.actionButton, styles.confirmButton]}
                  title="Add Post"
                  onPress={handleAddPost}
                  textStyle={styles.buttonTextWhite}
                />
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  tabButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#007AFF',
    fontWeight: '600',
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
  imageSection: {
    marginBottom: 15,
    alignItems: 'center',
  },
  pickImageButton: {
    width: '100%',
    height: 150,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  pickImageText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  selectedImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 15,
  },
  urlSection: {
    marginBottom: 15,
  },
  urlInput: {
    height: 50,
  },
  platformIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 4,
  },
  platformText: {
    marginRight: 8,
    color: '#666',
    fontSize: 14,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  tagsInput: {
    marginBottom: 15,
  },
  collectionSelectorSection: {
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
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
  newCollectionInput: {
    flex: 1,
  },
  checkmarkButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    bottom: 40,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabMenu: {
    position: 'absolute',
    bottom: 110,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    alignSelf: 'center',
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
});

export default AddButton;