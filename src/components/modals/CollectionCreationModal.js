//React and React Native core imports
import React, { useState } from 'react';
import { View, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and styling
import { AppTextInput, AppButton, AppHeading } from '../utilities/Typography';
import { showToast, TOAST_TYPES } from '../utilities/Toasts';
import addbuttonstyles from '../../styles/addbuttonstyles';

/*
  CollectionCreationModal Component

  Contains all the collection creation logic for the Addbutton including:
  - Collection name input
  - Collection description input
  - Validation and creation logic
*/

const CollectionCreationModal = ({ visible, onClose, onCreateCollection, toast }) => {
  //Collection managing
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');

  const resetState = () => {
    setNewCollectionName('');
    setNewCollectionDescription('');
  };

  //Collection creation handler
  const handleAddCollection = async () => {
    //Input validations
    const trimmedName = newCollectionName.trim();
    if (!trimmedName) {
      showToast(toast, "Collection name cannot be empty", { type: TOAST_TYPES.WARNING });
      return;
    }
    if (trimmedName.toLowerCase() === 'unsorted') {
      showToast(toast, "Cannot use Unsorted as a collection name", { type: TOAST_TYPES.WARNING });
      return;
    }
    try {
      //Call parent function to create
      const collectionId = await onCreateCollection(trimmedName, newCollectionDescription);
      showToast(toast, `${trimmedName} collection created`, { type: TOAST_TYPES.SUCCESS });
      resetState();
      onClose();
      return collectionId;
    }
    catch (error) {
      showToast(toast, "Failed to create collection", { type: TOAST_TYPES.DANGER });
      return null;
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        resetState();
        onClose();
      }}
    >
      <View style={addbuttonstyles.modalBg}>
        <View style={addbuttonstyles.modalContainer}>
          <View style={addbuttonstyles.modalHeader}>
            <AppHeading style={addbuttonstyles.modalTitle}>Create New Collection</AppHeading>
            <TouchableOpacity onPress={() => {
              resetState();
              onClose();
            }}>
              <Ionicons name="close-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <AppTextInput
            style={addbuttonstyles.input}
            placeholder="Collection Name"
            value={newCollectionName}
            onChangeText={setNewCollectionName}
          />

          <AppTextInput
            style={[addbuttonstyles.input, addbuttonstyles.textArea]}
            placeholder="Description (optional)"
            value={newCollectionDescription}
            onChangeText={setNewCollectionDescription}
            multiline={true}
            numberOfLines={3}
          />

          <View style={addbuttonstyles.buttonRow}>
            <AppButton
              style={[addbuttonstyles.actionButton, addbuttonstyles.cancelButton]}
              title="Cancel"
              onPress={() => {
                resetState();
                onClose();
              }}
              textStyle={addbuttonstyles.buttonText}
            />
            <AppButton
              style={[addbuttonstyles.actionButton, addbuttonstyles.confirmButton]}
              title="Create Collection"
              onPress={handleAddCollection}
              textStyle={addbuttonstyles.buttonTextWhite}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CollectionCreationModal;