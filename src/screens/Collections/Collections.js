import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, TextInput, Button } from 'react-native';
import { collection, doc, getDoc, addDoc, query, getDocs } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../FirebaseConfig';
import { useFocusEffect } from '@react-navigation/native';

//HEADER SECTION:
//small profile image, username/displayname, short stats (no. of collections, no. of saved posts)
//edit profile button

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
  }, [userId]);

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
        setUsername(userData.username || FIREBASE_AUTH.currentUser.email); // Use email as default name
        setStats(`${userData.collections || 0} collections | ${userData.posts || 0} posts`);
        setProfilePicture(userData.profilePicture || 'default_image_url'); // Default image URL if not found
      } else {
        console.error('User document does not exist!');
      }
    } catch (error) {
      console.error('Error fetching user profile: ', error);
    }
  };

  // Fetch collections from Firestore
  const fetchCollections = async () => {
    try {
      const q = query(collection(FIREBASE_DB, 'users', userId, 'collections'));
      const querySnapshot = await getDocs(q);
      const userCollections = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCollections(userCollections);
    } catch (error) {
      console.error('Error fetching collections: ', error);
    }
  };

  // Add a new collection to Firestore
  const addCollection = async () => {
    if (!newCollectionName.trim()) {
      alert('Collection name cannot be empty!');
      return;
    }

    try {
      await addDoc(collection(FIREBASE_DB, 'users', userId, 'collections'), {
        name: newCollectionName,
        createdAt: new Date().toISOString(),
        items: [], // Empty array for items initially
      });
      setNewCollectionName(''); // Clear input
      fetchCollections(); // Refresh collections
    } catch (error) {
      console.error('Error adding collection: ', error);
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

      {/* Create New Collection */}
      <View style={styles.newCollectionContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Collection Name"
          value={newCollectionName}
          onChangeText={setNewCollectionName}
        />
        <Button title="Add Collection" onPress={addCollection} />
      </View>

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
            <Text style={styles.collectionName}>{item.name}</Text>
            <Text style={styles.collectionStats}>{item.items.length} posts</Text>
          </TouchableOpacity>
        )}
      />
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
});
