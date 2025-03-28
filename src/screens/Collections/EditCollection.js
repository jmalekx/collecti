//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

//Third-party library external imports
import { useToast } from 'react-native-toast-notifications';

//Project services and utilities
import { getCurrentUserId } from '../../services/firebase';
import { showToast, TOAST_TYPES } from '../../components/Toasts';
import { getCollection, updateCollection } from '../../services/collections';

//Custom component imports and styling
import commonStyles from '../../styles/commonStyles';

/*
    EditCollection Screen

    Implements (MVC) Model-View-Controller pattern for collection editing with proper
    service abstraction and CRUD operations, separating concerns between UI and data.
    Manages editing collection metadata using service layer.
*/

const EditCollection = ({ route, navigation }) => {

  //Route parameters
  const { collectionId } = route.params;

  //State transitions
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [loading, setLoading] = useState(false);

  //Context states
  const toast = useToast();

  //Initial data fetch
  useEffect(() => {
    const fetchCollectionDetails = async () => {
      try {
        setLoading(true);
        //Get current user from service
        const userId = getCurrentUserId();

        if (!userId) {
          showToast(toast, "Authentication error", { type: TOAST_TYPES.DANGER });
          navigation.goBack();
          return;
        }
        const collection = await getCollection(collectionId, userId);

        if (collection) {
          setCollectionName(collection.name);
          setCollectionDescription(collection.description || '');
        }
        else {
          showToast(toast, "Collection not found", { type: TOAST_TYPES.WARNING });
          navigation.goBack();
        }
      }
      catch (error) {
        console.error('Error fetching collection details:', error);
        showToast(toast, "Failed to load collection details", { type: TOAST_TYPES.DANGER });
      }
      finally {
        setLoading(false);
      }
    };

    fetchCollectionDetails();
  }, [collectionId, navigation, toast]);

  //Save collection changes
  const saveChanges = async () => {
    //Input validation
    if (!collectionName.trim()) {
      showToast(toast, "Collection name cannot be empty", { type: TOAST_TYPES.WARNING });
      return;
    }

    try {
      setLoading(true);
      const userId = getCurrentUserId();

      if (!userId) {
        showToast(toast, "Authentication error", { type: TOAST_TYPES.DANGER });
        return;
      }

      await updateCollection(collectionId, {
        name: collectionName,
        description: collectionDescription,
        updatedAt: new Date().toISOString(), 
      }, userId);

      showToast(toast, "Collection updated successfully", { type: TOAST_TYPES.SUCCESS });
      navigation.goBack();
    } 
    catch (error) {
      console.error('Error updating collection:', error);
      showToast(toast, "Failed to update collection", { type: TOAST_TYPES.DANGER });
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Collection Name */}
      <Text style={styles.label}>Collection Name</Text>
      <TextInput
        style={styles.input}
        value={collectionName}
        onChangeText={setCollectionName}
        placeholder="Enter collection name"
        editable={!loading}
      />

      {/* Collection Description */}
      <Text style={styles.label}>Collection Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={collectionDescription}
        onChangeText={setCollectionDescription}
        placeholder="Enter collection description"
        multiline
        numberOfLines={4}
        editable={!loading}
      />

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.disabledButton]}
        onPress={saveChanges}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? "Saving..." : "Save Changes"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditCollection;