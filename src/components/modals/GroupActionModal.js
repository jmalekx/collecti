//React and React Native core imports
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and styling
import { AppHeading } from '../utilities/Typography';
import addbuttonstyles from '../../styles/addbuttonstyles';
import collectionstyles from '../../styles/collectionstyles';
import Dropdown from '../utilities/Dropdown';
import { colours } from '../../styles/commonStyles';
import LoadingIndicator from '../utilities/LoadingIndicator';

/*
  GroupActionModal Component

  Handles the modal for moving multiple posts to an existing collection 
  or creating a new collection and moving posts to it.
  
*/

const GroupActionModal = ({ visible, onClose, collections, selectedPosts, onMoveToExisting, onCreateAndMove }) => {
  const [selectedTargetCollection, setSelectedTargetCollection] = useState('');
  const [isAddingNewCollection, setIsAddingNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isMoving, setIsMoving] = useState(false);

  const handleMoveToExistingCollection = async () => {
    setIsMoving(true);
    try {
      await onMoveToExisting(selectedTargetCollection);
    }
    finally {
      setIsMoving(false);
    }
  };

  const handleCreateCollectionAndMove = async () => {
    setIsMoving(true);
    try {
      await onCreateAndMove(newCollectionName);
    }
    finally {
      setIsMoving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={addbuttonstyles.modalBg}>
        <View style={[addbuttonstyles.modalContainer, { padding: 20 }]}>
          <View style={addbuttonstyles.modalHeader}>
            <AppHeading style={addbuttonstyles.modalTitle}>Move {selectedPosts.length} Posts</AppHeading>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-outline" size={24} color={colours.mainTexts} />
            </TouchableOpacity>
          </View>

          {!isAddingNewCollection ? (
            <>
              <Text style={collectionstyles.modalLabel}>Select Target Collection:</Text>
              {collections.length > 0 ? (
                <View style={collectionstyles.dropdownContainer}>
                  <Dropdown
                    options={collections
                      //Filter out the Unsorted collection 
                      .filter(collection => collection.name !== 'Unsorted')
                      .map(collection => ({
                        label: collection.name,
                        value: collection.id
                      }))
                    }
                    selectedValue={selectedTargetCollection}
                    onValueChange={(value) => {
                      if (value === 'new') {
                        setIsAddingNewCollection(true);
                      } else {
                        setSelectedTargetCollection(value);
                      }
                    }}
                    placeholder="Select a collection"
                    addNewOption={true}
                    addNewLabel="Add New Collection"
                    onAddNew={() => setIsAddingNewCollection(true)}
                  />
                </View>
              ) : (
                <View style={collectionstyles.noCollectionsContainer}>
                  <Text style={collectionstyles.noCollectionsText}>No other collections available</Text>
                </View>
              )}

              <View style={addbuttonstyles.buttonRow}>
                <TouchableOpacity
                  style={[addbuttonstyles.actionButton, addbuttonstyles.cancelButton]}
                  onPress={onClose}
                  disabled={isMoving}
                >
                  <Text style={addbuttonstyles.buttonText}>Cancel</Text>
                </TouchableOpacity>

                {collections.length > 0 && (
                  <TouchableOpacity
                    style={[addbuttonstyles.actionButton, addbuttonstyles.confirmButton]}
                    onPress={handleMoveToExistingCollection}
                    disabled={isMoving}
                  >
                    {isMoving ? (
                      <LoadingIndicator size="small" />
                    ) : (
                      <Text style={addbuttonstyles.buttonTextWhite}>Move</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <>
              <Text style={collectionstyles.modalLabel}>New Collection Name:</Text>
              <View style={addbuttonstyles.standardInputContainer}>
                <TextInput
                  placeholder="Enter Collection Name"
                  value={newCollectionName}
                  onChangeText={setNewCollectionName}
                  style={addbuttonstyles.standardInput}
                />
              </View>

              <View style={addbuttonstyles.buttonRow}>
                <TouchableOpacity
                  style={[addbuttonstyles.actionButton, addbuttonstyles.cancelButton]}
                  onPress={() => {
                    setIsAddingNewCollection(false);
                    setNewCollectionName('');
                  }}
                  disabled={isMoving}
                >
                  <Text style={addbuttonstyles.buttonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[addbuttonstyles.actionButton, addbuttonstyles.confirmButton]}
                  onPress={handleCreateCollectionAndMove}
                  disabled={isMoving}
                >
                  {isMoving ? (
                    <LoadingIndicator size="small" />
                  ) : (
                    <Text style={addbuttonstyles.buttonTextWhite}>Create & Move</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default GroupActionModal;