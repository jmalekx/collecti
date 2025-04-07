//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, Modal, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, TextInput, Platform, Image } from 'react-native';

//Third-party library external imports
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

//Project services and utilities
import { uploadImageToCloudinary } from '../../services/storage';
import { extractPinId, resolveShortUrl, createPinUrl, isDirectPinterestImage } from '../../services/pinterest/pinterestHelpers';
import pinterestService from '../../services/pinterest/pinterestServices';

//Custom component imports and styling
import { AppHeading } from '../utilities/Typography';
import LoadingIndicator from '../utilities/LoadingIndicator';
import { showToast, TOAST_TYPES } from '../utilities/Toasts';
import addbuttonstyles from '../../styles/addbuttonstyles';
import { colours } from '../../styles/commonStyles';
import Dropdown from '../utilities/Dropdown';

/*
  PostCreation Modal Component

  Contains all the post creation logic for the Addbutton including:
  - Image selection from gallery
  - URL input for remote images
  - Platform detection (Instagram, TikTok, Pinterest, YouTube)
  - Pinterest integration for importing pins
  - Collection selection and quick creation
  - Post submission logic
*/

const PostCreationModal = ({
  visible,
  onClose,
  collections = [],
  onAddPost,
  onCreateCollection,
  sharedUrl,
  platform,
  toast
}) => {

  //Content managing
  const [image, setImage] = useState(null); //Image URI from local device gallery
  const [imageUrl, setImageUrl] = useState(''); //Remote image URL(uploaded to cloudinary)
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState(''); //Metadata - later parsed as array
  const [originalSourceUrl, setOriginalSourceUrl] = useState(null);

  //Collection managing
  const [selectedCollection, setSelectedCollection] = useState('Unsorted'); //Defualt to unsorted (user doesnt have to pick)
  const [isNewCollection, setIsNewCollection] = useState(false);
  const [pendingNewCollection, setPendingNewCollection] = useState(null); //Temp collection state following MVC
  const [newCollectionName, setNewCollectionName] = useState('');

  //State transitions
  const [activeTab, setActiveTab] = useState('image'); //Either image or url tab
  const [currentPlatform, setCurrentPlatform] = useState('gallery');
  const [isLoading, setIsLoading] = useState(false);

  //Default collection selection
  useEffect(() => {
    if (collections.length > 0) {
      //ONLY set default collection on initial load or when collections change

      //Skip default selection in these cases:
      //1. When we have a pending new collection
      if (pendingNewCollection) {
        return;
      }

      //2. When user has manually selected a collection that exists in the collections array
      const userSelectedCollection = collections.find(coll => coll.id === selectedCollection);
      if (userSelectedCollection) {
        return;
      }

      //Only set default if we don't have a valid selection yet
      const unsortedCollection = collections.find(coll => coll.name === 'Unsorted');
      if (unsortedCollection) {
        setSelectedCollection(unsortedCollection.id);
      } else {
        setSelectedCollection(collections[0].id);
      }
    }
  }, [collections, pendingNewCollection]);

  //External content sharing - auto open modal and prefill with urls from shared source
  useEffect(() => {
    if (visible && sharedUrl && (platform === 'instagram' || platform === 'tiktok' ||
      platform === 'pinterest' || platform === 'youtube')) {
      setImageUrl(sharedUrl);
      setCurrentPlatform(platform);
      setActiveTab('url'); //Switch to URL tab if shared from different platform

      if (platform === 'pinterest') {
        fetchPinterestData(sharedUrl);
      }
    }
  }, [visible, sharedUrl, platform]);

  //Pinterest data fetch
  useEffect(() => {
    if (visible && platform === 'pinterest' && sharedUrl) {
      fetchPinterestData(sharedUrl);
    }
  }, [visible, platform, sharedUrl]);

  const fetchPinterestData = async (url) => {
    try {
      //Check if user is authenticated with Pinterest
      const isPinterestAuthenticated = await pinterestService.isAuthenticated();

      if (!isPinterestAuthenticated) {
        setImageUrl(url);
        setOriginalSourceUrl(url);
        showToast(toast, "Pinterest not connected. Using link instead", { type: TOAST_TYPES.INFO });
        return;
      }

      //Resolve short URL 
      let resolvedUrl = url;
      if (url.includes('pin.it/')) {
        try {
          resolvedUrl = await resolveShortUrl(url);
        }
        catch (error) {
          console.log("Error resolving short URL:", error);
        }
      }

      //Store the original source URL
      setOriginalSourceUrl(resolvedUrl);

      //Extract pin
      const pinId = extractPinId(resolvedUrl);
      if (!pinId) {
        setImageUrl(url);
        return;
      }

      //Create url
      const PinUrl = createPinUrl(pinId);

      //Try to fetch pin data via API
      try {
        const pinData = await pinterestService.fetchPinData(pinId);

        if (pinData) {
          //Always store the Pinterest URL for the "View on Pinterest" button
          setOriginalSourceUrl(PinUrl);

          if (pinData.is_owner && pinData.image) {
            setImageUrl(pinData.image);
          }
          else {
            setImageUrl(PinUrl);
          }

          setCurrentPlatform('pinterest');

          //Set notes/description if available
          if (pinData.title) {
            setNotes(pinData.title);
          }
          else if (pinData.description) {
            setNotes(pinData.description);
          }

          showToast(toast, "Pinterest pin imported", { type: TOAST_TYPES.SUCCESS });
          return;
        }
      }
      catch (apiError) {
        setImageUrl(PinUrl);
      }
    }
    catch (error) {
      if (url) {
        setImageUrl(url);
        setOriginalSourceUrl(url);
      }
    }
  };

  //State restoration to initial
  const resetModalStates = () => {
    setImage(null);
    setImageUrl('');
    setNotes('');
    setTags('');
    setNewCollectionName('');
    setIsNewCollection(false);
    setPendingNewCollection(null);
    setActiveTab('image');
    setCurrentPlatform('gallery');

    //Reset selected collection to default (Unsorted)
    const unsortedCollection = collections.find(coll => coll.name === 'Unsorted');
    if (unsortedCollection) {
      setSelectedCollection(unsortedCollection.id);
    }
    else if (collections.length > 0) {
      setSelectedCollection(collections[0].id);
    }
  };

  //Manual image picker/selection handler
  const selectImage = async () => {
    try {
      //Request permission to access media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast(toast, "Permission to access media library is required", { type: TOAST_TYPES.WARNING });
        return;
      }

      //Compressing and selecting image optimal for storage
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
        setImageUrl('');
      }
    }
    catch (error) {
      showToast(toast, "Failed to pick image", { type: TOAST_TYPES.DANGER });
    }
  };

  //Handle quick add collection - optimised for inline collection creation
  const handleQuickAddCollection = async () => {
    // Validation
    if (!newCollectionName.trim()) {
      showToast(toast, "Collection name cannot be empty", { type: TOAST_TYPES.WARNING });
      return;
    }

    //Create temporary ID for UI purposes
    const tempId = `temp_${Date.now()}`;
    const tempName = newCollectionName.trim();

    setPendingNewCollection({
      id: tempId,
      name: tempName,
      description: ''
    });

    setSelectedCollection(tempId);
    showToast(toast, `${tempName} will be created when you add this post`, { type: TOAST_TYPES.SUCCESS });

    setIsNewCollection(false);
    setNewCollectionName('');
  };

  //Post submission handler
  const handleAddPost = async () => {
    //Input validations
    if (!image && !imageUrl) {
      showToast(toast, "Select an image or paste Image URL", { type: TOAST_TYPES.WARNING });
      return;
    }
    if (!selectedCollection) {
      showToast(toast, "Select a collection", { type: TOAST_TYPES.WARNING });
      return;
    }
    try {
      setIsLoading(true);

      let collectionToUse = selectedCollection;

      //If pending collection, check if it needs to be created
      if (pendingNewCollection && selectedCollection === pendingNewCollection.id) {
        try {
          //Create the pending collection
          const createdCollectionId = await onCreateCollection(
            pendingNewCollection.name,
            pendingNewCollection.description || ''
          );

          //Use real ID instead of the temporary one
          collectionToUse = createdCollectionId;
        }
        catch (collectionError) {
          showToast(toast, "Failed to create collection", { type: TOAST_TYPES.DANGER });
          setIsLoading(false);
          return;
        }
      }

      let imageToUse;
      let platformToUse = currentPlatform;

      //For Pinterest content store original pin URL as sourceUrl
      let sourceUrl = null;
      if (platformToUse === 'pinterest') {
        //If we have the original source URL (from Pinterest API) use it
        if (originalSourceUrl) {
          sourceUrl = originalSourceUrl;
        }
        //Otherwise try create Pinterest URL from the pin ID
        else if (imageUrl && (imageUrl.includes('pinterest.com/pin/') || isDirectPinterestImage(imageUrl))) {
          //If this is a direct image extract the pin ID from originalSourceUrl
          if (isDirectPinterestImage(imageUrl)) {
            sourceUrl = originalSourceUrl;
          }
          else {
            sourceUrl = imageUrl;
          }
        }
      }

      //If image from gallery upload to Cloudinary first
      if (image) {
        try {
          showToast(toast, "Uploading image...", { type: TOAST_TYPES.INFO });
          //Upload the local image to Cloudinary
          const uploadedUrl = await uploadImageToCloudinary(image);
          if (!uploadedUrl) {
            console.log("Failed to upload image");
          }
          imageToUse = uploadedUrl;
        }
        catch (uploadError) {
          showToast(toast, "Failed to upload image", { type: TOAST_TYPES.DANGER });
          setIsLoading(false);
          return;
        }
      }
      else {
        //Use URL directly
        imageToUse = imageUrl;
      }

      await onAddPost(notes, tags, imageToUse, collectionToUse, platformToUse, sourceUrl);

      resetModalStates();
      onClose();
    }
    catch (error) {
      showToast(toast, "Error adding post", { type: TOAST_TYPES.DANGER });
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        resetModalStates();
        onClose();
      }}
    >
      <View style={addbuttonstyles.modalBg}>
        <View style={[addbuttonstyles.modalContainer, { padding: 20 }]}>
          <View style={addbuttonstyles.modalHeader}>
            <AppHeading style={addbuttonstyles.modalTitle}>Add to Collection</AppHeading>
            <TouchableOpacity onPress={() => {
              resetModalStates();
              onClose();
            }}>
              <Ionicons name="close-outline" size={24} color={colours.mainTexts} />
            </TouchableOpacity>
          </View>

          <ScrollView style={[addbuttonstyles.scrollContainer, { marginBottom: 16 }]}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            {/* Tab Selector */}
            <View style={addbuttonstyles.tabContainer}>
              <TouchableOpacity
                style={[
                  addbuttonstyles.tabButton,
                  activeTab === 'image' && addbuttonstyles.activeTabButton,
                ]}
                onPress={() => setActiveTab('image')}
              >
                <Text style={[
                  addbuttonstyles.tabButtonText,
                  activeTab === 'image' && addbuttonstyles.activeTabButtonText,
                ]}>Gallery Image</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  addbuttonstyles.tabButton,
                  activeTab === 'url' && addbuttonstyles.activeTabButton,
                ]}
                onPress={() => setActiveTab('url')}
              >
                <Text style={[
                  addbuttonstyles.tabButtonText,
                  activeTab === 'url' && addbuttonstyles.activeTabButtonText,
                ]}>Image URL</Text>
              </TouchableOpacity>
            </View>

            {/* Image Select Section */}
            {activeTab === 'image' && (
              <View style={addbuttonstyles.imageSection}>
                {image ? (
                  <View style={addbuttonstyles.selectedImageContainer}>
                    <Image source={{ uri: image }} style={addbuttonstyles.selectedImage} />
                    <TouchableOpacity
                      style={addbuttonstyles.removeImageButton}
                      onPress={() => setImage(null)}
                    >
                      <Ionicons name="close-circle" size={24} color={colours.delete} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={addbuttonstyles.pickImageButton}
                    onPress={selectImage}
                  >
                    <Ionicons name="image-outline" size={40} color={colours.buttonsTextPink} />
                    <Text style={addbuttonstyles.pickImageText}>Select Image from Gallery</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* URL Input Section */}
            {activeTab === 'url' && (
              <View style={addbuttonstyles.urlSection}>
                <View style={[addbuttonstyles.standardInputContainer]}>
                  <TextInput
                    placeholder="Paste an Image URL here"
                    value={imageUrl}
                    onChangeText={text => {
                      setImageUrl(text);
                      //Auto-detect platform based on URL
                      if (text.includes('instagram.com')) {
                        setCurrentPlatform('instagram');
                      }
                      else if (text.includes('tiktok.com')) {
                        setCurrentPlatform('tiktok');
                      }
                      else if (text.includes('pinterest.com')) {
                        setCurrentPlatform('pinterest');
                      }
                      else if (text.includes('youtube.com') || text.includes('youtu.be')) {
                        setCurrentPlatform('youtube');
                      }
                      else {
                        setCurrentPlatform('other');
                      }
                    }}
                    style={addbuttonstyles.standardInput}
                  />
                </View>

                {/* Platform indicator */}
                {imageUrl && (
                  <View style={addbuttonstyles.platformIndicator}>
                    <Text style={addbuttonstyles.platformText}>
                      {currentPlatform === 'instagram' ? 'Instagram Content' :
                        currentPlatform === 'tiktok' ? 'TikTok Content' :
                          currentPlatform === 'pinterest' ? 'Pinterest Content' :
                            currentPlatform === 'youtube' ? 'YouTube Content' :
                              'Web Content'}
                    </Text>
                    {currentPlatform === 'instagram' && <Ionicons name="logo-instagram" size={20} color={colours.instagram} />}
                    {currentPlatform === 'tiktok' && <Ionicons name="logo-tiktok" size={20} color={colours.tiktok} />}
                    {currentPlatform === 'pinterest' && <Ionicons name="logo-pinterest" size={20} color={colours.pinterest} />}
                    {currentPlatform === 'youtube' && <Ionicons name="logo-youtube" size={20} color={colours.youtube} />}
                  </View>
                )}
              </View>
            )}

            {/* Notes Section */}
            <View style={addbuttonstyles.standardInputContainer}>
              <TextInput
                placeholder="Notes"
                value={notes}
                onChangeText={setNotes}
                multiline
                style={[addbuttonstyles.standardInput, addbuttonstyles.textArea]}
              />
            </View>

            {/* Tags Input */}
            <View style={addbuttonstyles.standardInputContainer}>
              <TextInput
                placeholder="Tags (comma separated)"
                value={tags}
                onChangeText={setTags}
                style={addbuttonstyles.standardInput}
              />
            </View>

            {/* Collection Selector Section */}
            <View style={addbuttonstyles.collectionSelectorSection}>
              <Text style={addbuttonstyles.sectionLabel}>Add to Collection:</Text>

              {isNewCollection ? (
                //New Collection Input
                <View style={addbuttonstyles.newCollectionContainer}>
                  <View style={[{ flex: 1, marginRight: 8 }]}>
                    <TextInput
                      placeholder="New Collection Name"
                      value={newCollectionName}
                      onChangeText={setNewCollectionName}
                      style={addbuttonstyles.standardInput}
                    />
                  </View>
                  <TouchableOpacity
                    style={addbuttonstyles.checkmarkButton}
                    onPress={handleQuickAddCollection}
                  >
                    <Ionicons name="checkmark-outline" size={24} color={colours.mainTexts} />
                  </TouchableOpacity>
                </View>
              ) : (
                //Collection Selection with custom dropwdown
                <Dropdown
                  options={collections
                    //Filter out the Unsorted collection to place it at the top
                    .filter(collection => collection.name !== 'Unsorted')
                    //Map all remaining collections to dropdown options format
                    .map(collection => ({
                      label: collection.name,
                      value: collection.id
                    }))
                  }
                  pinnedOptions={[
                    //If pending new collection exists add it to pinned options
                    ...(pendingNewCollection ? [{
                      label: `${pendingNewCollection.name} (New)`,
                      value: pendingNewCollection.id
                    }] : []),
                    //Add Unsorted to pinned options if it exists
                    ...(collections.find(c => c.name === 'Unsorted') ? [{
                      label: 'Unsorted',
                      value: collections.find(c => c.name === 'Unsorted').id
                    }] : [])
                  ]}
                  selectedValue={selectedCollection}
                  onValueChange={(value) => setSelectedCollection(value)}
                  placeholder="Select a collection"
                  addNewOption={true}
                  addNewLabel="Add New Collection"
                  onAddNew={() => setIsNewCollection(true)}
                  //Highlight pending new collection if it exists
                  highlightedValues={pendingNewCollection ? [pendingNewCollection.id] : []}
                />
              )}
            </View>
          </ScrollView>

          {/* Modal Footer */}
          {isLoading ? (
            <View style={addbuttonstyles.loadingContainer}>
              <LoadingIndicator />
            </View>
          ) : (
            <View style={addbuttonstyles.buttonRow}>
              <TouchableOpacity
                style={[addbuttonstyles.actionButton, addbuttonstyles.cancelButton]}
                onPress={() => {
                  resetModalStates();
                  onClose();
                }}
              >
                <Text style={addbuttonstyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[addbuttonstyles.actionButton, addbuttonstyles.confirmButton]}
                onPress={handleAddPost}
              >
                <Text style={addbuttonstyles.buttonTextWhite}>Add Post</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default PostCreationModal;