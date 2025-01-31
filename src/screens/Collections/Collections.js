import React, { useState, useEffect } from 'react';
import { View, Alert, Text, Image, FlatList, TouchableOpacity, StyleSheet, TextInput, Button } from 'react-native';
import { collection, doc, getDoc, addDoc, query, getDocs } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../FirebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import AddButton from '../../components/AddButton';

//MAIN SECTION:
//grid layout of collection cards (2 columns? or just stacked 1 col each)
//each collection has thmb image(of posts inside preview? or recently saved post), name, no. of posts in col
//small menu btn for edit, delete, pin
//drag and drop to reorganise collections
//create new colleciton button

const ProfileHeader = ({ username, stats, profilePicture, onEditProfile }) => (
    <View style={styles.header}>
      <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
      <Text style={styles.username}>{username}</Text>
      <Text style={styles.stats}>{stats}</Text>
      <Button title="Edit Profile" onPress={onEditProfile} />
    </View>
  );

  const Collections = ({ navigation }) => {
    const [collections, setCollections] = useState([]);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [username, setUsername] = useState('Loading...');
    const [stats, setStats] = useState('Loading...');
    const [profilePicture, setProfilePicture] = useState('');
    const userId = FIREBASE_AUTH.currentUser?.uid;

  // Fetch user profile and collections on component mount
  useEffect(() => {
    if (userId) {
        fetchUserProfile();
        fetchCollections();
    }
  }, [userId, collections]);

   // Refetch profile and collections when the screen is focused (after editing profile)
   useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        fetchUserProfile();
        fetchCollections();
      }
    }, [userId])
  );


  // Fetch user profile from Firestore
  const fetchUserProfile = async () => {
    try {
        const userDoc = await getDoc(doc(FIREBASE_DB, 'users', userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsername(userData.username || FIREBASE_AUTH.currentUser.email);
            
            // Fetch collections to get the post count
            const collectionsCount = collections.length;
            const totalPosts = collections.reduce((sum, collection) => sum + collection.items.length, 0);
            
            setStats(`${collectionsCount} collections | ${totalPosts} posts`);
            
            // Set profile picture, default if empty
            setProfilePicture(userData.profilePicture && userData.profilePicture.trim() !== '' 
                ? userData.profilePicture 
                : 'https://i.pinimg.com/736x/9c/8b/20/9c8b201fbac282d91c766e250d0e3bc6.jpg'); // Default PFP URL
        } else {
            console.error('User document does not exist!');
        }
    } catch (error) {
        console.error('Error fetching user profile: ', error);
    }
};


// Inside your fetchCollections function, ensure you're fetching the thumbnail as well
const fetchCollections = async () => {
    try {
      const q = query(collection(FIREBASE_DB, 'users', userId, 'collections'));
      const querySnapshot = await getDocs(q);
      const userCollections = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // Fetch the thumbnail for each collection
      const collectionsWithThumbnails = await Promise.all(userCollections.map(async (collection) => {
        const thumbnail = collection.items.length > 0 ? collection.items[0].thumbnail : 'default_thumbnail_url';
        return { ...collection, thumbnail };
      }));
  
      setCollections(collectionsWithThumbnails);
    } catch (error) {
      console.error('Error fetching collections: ', error);
    }
  };

  const handleAddPost = async (notes, tags) => {
      const postData = {
        url,
        platform,
        notes,
        tags: tags.split(',').map(tag => tag.trim()),
        createdAt: new Date(),
      };
  
      try {
        await setDoc(doc(FIREBASE_DB, 'users', userId, 'collections', 'Unsorted', 'posts', new Date().toISOString()), postData);
        Alert.alert('Success', 'Post added successfully');
      } catch (error) {
        console.error('Error adding post: ', error);
        Alert.alert('Error', 'Failed to add post');
      }
    };
  
    const handleAddCollection = async (collectionName) => {
      try {
        const newCollectionRef = await addDoc(collection(FIREBASE_DB, 'users', userId, 'collections'), {
          name: collectionName,
          description: '', // Empty string for description initially
          createdAt: new Date().toISOString(),
          items: [], // Empty array for items initially
        });
    
        // Add the new collection to the state immediately
        setCollections(prevCollections => [
          ...prevCollections,
          {
            id: newCollectionRef.id,
            name: collectionName,
            description: '',
            createdAt: new Date().toISOString(),
            items: [], // Empty array for items initially
            thumbnail: 'default_thumbnail_url', // Default thumbnail
          }
        ]);
    
        Alert.alert('Success', 'Collection created successfully');
      } catch (error) {
        console.error('Error adding collection: ', error);
        Alert.alert('Error', 'Failed to create collection');
      }
    };
    

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <ProfileHeader
        username={username}
        stats={stats}
        profilePicture={profilePicture}
        onEditProfile={() => navigation.navigate('EditProfile')}
        />
      {/* Collection Grid */}
      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        numColumns={2} // Grid layout: 2 columns
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.collectionCard}
            onPress={() => navigation.navigate('CollectionDetails', { collectionId: item.id })}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <Text style={styles.collectionName}>{item.name}</Text>
            <Text style={styles.collectionStats}>{item.items.length} posts</Text>
          </TouchableOpacity>
        )}
      />
      {/* AddButton Component */}
      <View style={styles.addButtonContainer}>
        <AddButton onAddPost={handleAddPost} onAddCollection={handleAddCollection} />
      </View>
    </View>
  );
};

export default Collections;

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40, // Circular image
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  stats: {
    fontSize: 14,
    color: '#888',
    marginVertical: 8,
  },
  newCollectionContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  grid: {
    justifyContent: 'space-between',
  },
  collectionCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  collectionStats: {
    fontSize: 12,
    color: '#555',
  },
  addButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end', // Ensures the button is at the bottom
  },
});
