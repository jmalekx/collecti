import React, { useState, useEffect } from 'react';
import { View, Alert, Button, Text, Image, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { collection, doc, getDoc, addDoc, query, getDocs } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../FirebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import AddButton from '../../components/AddButton';

const DEFAULT_THUMBNAIL = 'https://i.pinimg.com/736x/f6/51/5a/f6515a3403f175ed9a0df4625daaaffd.jpg';
const DEFAULT_PROFILE_PICTURE = 'https://i.pinimg.com/736x/9c/8b/20/9c8b201fbac282d91c766e250d0e3bc6.jpg';

const ProfileHeader = ({ username, stats, profilePicture, onEditProfile }) => (
  <View style={styles.header}>
    <Image
      source={{ uri: profilePicture || DEFAULT_PROFILE_PICTURE }}
      style={styles.profilePicture}
      onError={(e) => console.log('Failed to load profile picture:', e.nativeEvent.error)}
    />
    <Text style={styles.username}>{username}</Text>
    <Text style={styles.stats}>{stats}</Text>
    <Button title="Edit Profile" onPress={onEditProfile} />
  </View>
);

const Collections = ({ navigation }) => {
  const [collections, setCollections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [username, setUsername] = useState('Loading...');
  const [stats, setStats] = useState('Loading...');
  const [profilePicture, setProfilePicture] = useState('');
  const userId = FIREBASE_AUTH.currentUser?.uid;

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchCollections();
    }
  }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        fetchUserProfile();
        fetchCollections();
      }
    }, [userId])
  );

  // Recalculate stats whenever collections change
  useEffect(() => {
    const collectionsCount = collections.length;
    const totalPosts = collections.reduce((sum, collection) => sum + collection.items.length, 0);
    setStats(`${collectionsCount} collections | ${totalPosts} posts`);
  }, [collections]);

  const fetchUserProfile = async () => {
    try {
      const userDoc = await getDoc(doc(FIREBASE_DB, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUsername(userData.username || FIREBASE_AUTH.currentUser.email);
        setProfilePicture(userData.profilePicture || DEFAULT_PROFILE_PICTURE);
      } else {
        console.error('User document does not exist!');
      }
    } catch (error) {
      console.error('Error fetching user profile: ', error);
    }
  };

  const fetchCollections = async () => {
    try {
      const q = query(collection(FIREBASE_DB, 'users', userId, 'collections'));
      const querySnapshot = await getDocs(q);
  
      let userCollections = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const collectionData = doc.data();
  
        // Fetch posts count and thumbnail
        const postsQuery = query(collection(FIREBASE_DB, 'users', userId, 'collections', doc.id, 'posts'));
        const postsSnapshot = await getDocs(postsQuery);
        const posts = postsSnapshot.docs.map((postDoc) => postDoc.data());
  
        return {
          id: doc.id,
          name: collectionData.name,
          description: collectionData.description || '',
          createdAt: collectionData.createdAt || new Date().toISOString(),
          postCount: posts.length,
          items: posts,
          thumbnail: posts.length > 0 ? posts[0].thumbnail : DEFAULT_THUMBNAIL,
          isPinned: collectionData.isPinned || false,
        };
      }));
  
      // Ensure 'Unsorted' collection exists
      const unsortedPostsQuery = query(collection(FIREBASE_DB, 'users', userId, 'collections', 'Unsorted', 'posts'));
      const unsortedPostsSnapshot = await getDocs(unsortedPostsQuery);
      const unsortedPosts = unsortedPostsSnapshot.docs.map((doc) => doc.data());
  
      let unsortedCollection = {
        id: 'Unsorted',
        name: 'Unsorted',
        description: 'Posts not yet assigned to a collection',
        createdAt: new Date().toISOString(),
        postCount: unsortedPosts.length,
        items: unsortedPosts,
        thumbnail: unsortedPosts.length > 0 ? unsortedPosts[0].thumbnail : DEFAULT_THUMBNAIL,
        isPinned: true,
      };
  
      // Combine 'Unsorted' with other collections
      const allCollections = [unsortedCollection, ...userCollections.filter(col => col.id !== 'Unsorted')];
  
      setCollections(allCollections);
    } catch (error) {
      console.error('Error fetching collections: ', error);
    }
  };
  

  const handleAddCollection = async (collectionName, collectionDescription) => {
    try {
      const newCollectionRef = await addDoc(collection(FIREBASE_DB, 'users', userId, 'collections'), {
        name: collectionName,
        description: collectionDescription,  // Save the description
        createdAt: new Date().toISOString(),
        items: [],
        thumbnail: DEFAULT_THUMBNAIL,
      });
  
      // Refresh the collections list and update stats
      await fetchCollections();
  
      Alert.alert('Success', 'Collection created successfully');
    } catch (error) {
      console.error('Error adding collection: ', error);
      Alert.alert('Error', 'Failed to create collection');
    }
  };
  

  const handleAddPost = async (notes, tags, image, selectedCollection) => {
    try {
      const postData = {
        notes,
        tags: tags.split(',').map(tag => tag.trim()), // Convert tags string to array
        image, // Use the image passed from AddButton
        createdAt: new Date().toISOString(),
        thumbnail: image || DEFAULT_THUMBNAIL, // Use the image or default thumbnail
      };
  
      // Add a new document to the selected collection's 'posts' subcollection
      await addDoc(
        collection(FIREBASE_DB, 'users', userId, 'collections', selectedCollection, 'posts'),
        postData
      );
  
      // Refresh the collections list and update stats
      await fetchCollections();
  
      Alert.alert('Success', 'Post added successfully');
    } catch (error) {
      console.error('Error adding post: ', error);
      Alert.alert('Error', 'Failed to add post');
    }
  };
  

  // Filter collections based on search query
  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <ProfileHeader
        username={username}
        stats={stats}
        profilePicture={profilePicture}
        onEditProfile={() => navigation.navigate('EditProfile')}
      />

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search collections..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Collection Grid */}
      <FlatList
        data={filteredCollections}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.collectionCard}
            onPress={() => navigation.navigate('CollectionDetails', { collectionId: item.id })}
          >
            <Image
              source={{ uri: item.thumbnail || DEFAULT_THUMBNAIL }}
              style={styles.thumbnail}
              onError={(e) => console.log('Failed to load thumbnail:', e.nativeEvent.error)}
            />
            <Text style={styles.collectionName}>{item.name}</Text>
            <Text style={styles.collectionStats}>{item.items.length} posts</Text>
          </TouchableOpacity>
        )}
      />

      {/* AddButton Component */}
      <View style={styles.addButtonContainer}>
        <AddButton onAddPost={handleAddPost} onAddCollection={handleAddCollection} collections={collections}/>
      </View>
    </View>
  );
};

export default Collections;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    fontSize: 16,
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
    justifyContent: 'flex-end',
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
});