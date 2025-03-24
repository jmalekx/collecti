import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { useToast } from 'react-native-toast-notifications';
import { showToast, TOAST_TYPES } from '../../components/Toasts';
import { getCollection, updateCollection } from '../../services/collections';

const EditCollection = ({ route, navigation }) => {
  const toast = useToast();
  const { collectionId } = route.params; // Get the collectionId from route params
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');

  // Get the current user ID
  const userId = getAuth().currentUser?.uid;

  // Fetch the current collection details when the screen loads
  useEffect(() => {
    const fetchCollectionDetails = async () => {
      try {
        // Use the service
        const collection = await getCollection(collectionId);
        if (collection) {
          setCollectionName(collection.name);
          setCollectionDescription(collection.description || '');
        }
      } catch (error) {
        console.error('Error fetching collection details: ', error);
      }
    };

    fetchCollectionDetails();
  }, [collectionId, userId]);

  // Save the updated collection details
  const saveChanges = async () => {
    if (!collectionName.trim()) {
      showToast(toast, "Collection name cannot be empty", { type: TOAST_TYPES.WARNING });
      return;
    }

    try {
      // Use the service
      await updateCollection(collectionId, {
        name: collectionName,
        description: collectionDescription,
      });

      showToast(toast, "Collection updated successfully", { type: TOAST_TYPES.INFO });
      navigation.goBack();
    } catch (error) {
      console.error('Error updating collection: ', error);
      showToast(toast, "Failed to update collection", { type: TOAST_TYPES.DANGER });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Collection Name</Text>
      <TextInput
        style={styles.input}
        value={collectionName}
        onChangeText={setCollectionName}
        placeholder="Enter collection name"
      />

      <Text style={styles.label}>Collection Description</Text>
      <TextInput
        style={styles.input}
        value={collectionDescription}
        onChangeText={setCollectionDescription}
        placeholder="Enter collection description"
        multiline
      />

      <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditCollection;