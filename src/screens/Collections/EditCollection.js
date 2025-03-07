import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { doc, updateDoc, getDoc} from 'firebase/firestore';
import { FIREBASE_DB } from '../../../FirebaseConfig';
import { getAuth } from 'firebase/auth';
import { useToast } from 'react-native-toast-notifications';

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
        const collectionRef = doc(FIREBASE_DB, 'users', userId, 'collections', collectionId);
        const collectionDoc = await getDoc(collectionRef);
        if (collectionDoc.exists()) {
          setCollectionName(collectionDoc.data().name);
          setCollectionDescription(collectionDoc.data().description || '');
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
      toast.show("Collection name cannot be empty", {type: "warning",});
      return;
    }

    try {
      const collectionRef = doc(FIREBASE_DB, 'users', userId, 'collections', collectionId);
      await updateDoc(collectionRef, {
        name: collectionName,
        description: collectionDescription,
      });
      toast.show("Collection updated successfully", {type: "success",});
      navigation.goBack(); // Navigate back to the previous screen
    } catch (error) {
      console.error('Error updating collection: ', error);
      toast.show("Failed to update collection ", {type: "danger",});
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