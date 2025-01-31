import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, Button, Alert } from 'react-native';
import { collection, doc, getDocs, getDoc, deleteDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../FirebaseConfig';
import { getAuth } from 'firebase/auth';

const CollectionDetails = ({ route, navigation }) => {
  const { collectionId } = route.params; // Get the collectionId from route params
  const [posts, setPosts] = useState([]);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');

  // Get the current user ID
  const userId = getAuth().currentUser?.uid;

  useEffect(() => {
    if (userId && collectionId) {
      fetchCollectionDetails();
      fetchPosts();
    }
  }, [userId, collectionId]);

  // Fetch collection details (name and description)
  const fetchCollectionDetails = async () => {
    try {
      const collectionRef = doc(FIREBASE_DB, 'users', userId, 'collections', collectionId);
      const collectionDoc = await getDoc(collectionRef);
      if (collectionDoc.exists()) {
        setCollectionName(collectionDoc.data().name);
        setCollectionDescription(collectionDoc.data().description || 'No description available');
      } else {
        console.error('Collection not found');
      }
    } catch (error) {
      console.error('Error fetching collection details: ', error);
    }
  };

  // Fetch posts for the selected collection
  const fetchPosts = async () => {
    try {
      const postsRef = collection(FIREBASE_DB, 'users', userId, 'collections', collectionId, 'posts');
      const querySnapshot = await getDocs(postsRef);
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts: ', error);
    }
  };

  // Delete collection with confirmation
  const deleteCollection = async () => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const collectionRef = doc(FIREBASE_DB, 'users', userId, 'collections', collectionId);
              await deleteDoc(collectionRef);
              navigation.goBack(); // Navigate back after deletion
            } catch (error) {
              console.error('Error deleting collection: ', error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Collection Header */}
      <View style={styles.header}>
        <Text style={styles.collectionName}>{collectionName}</Text>
        <Text style={styles.collectionDescription}>{collectionDescription}</Text>
      </View>

      {/* Edit and Delete Buttons */}
      <View style={styles.buttonContainer}>
        <Button title="Edit Collection" onPress={() => navigation.navigate('EditCollection', { collectionId })} />
        <Button title="Delete Collection" onPress={deleteCollection} color="red" />
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postDescription}>{item.description}</Text>
            <Text style={styles.postTags}>Tags: {item.tags.join(', ')}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 16,
  },
  collectionName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  collectionDescription: {
    fontSize: 16,
    color: '#555',
    marginTop: 8,
  },
  buttonContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postDescription: {
    fontSize: 14,
    color: '#555',
    marginVertical: 8,
  },
  postTags: {
    fontSize: 12,
    color: '#888',
  },
  postPlatform: {
    fontSize: 12,
    color: '#888',
  },
});

export default CollectionDetails;
