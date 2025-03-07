import React, { useState } from 'react';
import { View, Button, Text, Image, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { WebView } from 'react-native-webview';
import { useUserData } from '../../hooks/useUserData';
import AddButton from '../../components/AddButton';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../FirebaseConfig';
import { DEFAULT_PROFILE_PICTURE, DEFAULT_THUMBNAIL } from '../../constants';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { useToast } from 'react-native-toast-notifications';

const ProfileHeader = ({ username, stats, profilePicture, onEditProfile }) => (
  <View style={styles.header}>
    <Image
      source={{ uri: profilePicture }}
      style={styles.profilePicture}
      onError={(e) => console.log('Failed to load profile picture:', e.nativeEvent.error)}
    />
    <Text style={styles.username}>{username}</Text>
    <Text style={styles.stats}>{stats}</Text>
    <Button title="Edit Profile" onPress={onEditProfile} />
  </View>
);

const Collections = ({ navigation }) => {
  const toast = useToast();
  const { userProfile, collections } = useUserData();
  const [searchQuery, setSearchQuery] = useState('');
  const userId = FIREBASE_AUTH.currentUser?.uid;

  // Derived values from userProfile and collections
  const username = userProfile?.username || FIREBASE_AUTH.currentUser?.email;
  const profilePicture = userProfile?.profilePicture || DEFAULT_PROFILE_PICTURE;

  // Calculate stats directly from collections
  const stats = `${collections.length} collections | ${collections.reduce((sum, collection) => sum + collection.items.length, 0)
    } posts`;

  // Filter collections based on search query
  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCollection = async (collectionName, collectionDescription) => {
    try {
      await addDoc(collection(FIREBASE_DB, 'users', userId, 'collections'), {
        name: collectionName,
        description: collectionDescription,
        createdAt: new Date().toISOString(),
        items: [],
        thumbnail: DEFAULT_THUMBNAIL,
      });
      toast.show("Collection created successfully", { type: "success", });
    } catch (error) {
      console.error('Error adding collection: ', error);
      toast.show("Failed to create collection", { type: "danger" });
    }
  };

  const handleAddPost = async (notes, tags, image, selectedCollection, postPlatform) => {
    try {
      let thumbnail = image || DEFAULT_THUMBNAIL;

      // Check if platform is Instagram and generate embed URL
      if (postPlatform === 'instagram' && image.includes('instagram.com')) {
        const postId = image.split('/')[4]; // Extract post ID
        thumbnail = `https://www.instagram.com/p/${postId}/embed`;
      }

      const postData = {
        notes,
        tags: tags.split(',').map((tag) => tag.trim()), // Convert tags string to array
        image,
        platform: postPlatform,
        createdAt: new Date().toISOString(),
        thumbnail,
      };

      const postsRef = collection(
        FIREBASE_DB,
        'users',
        userId,
        'collections',
        selectedCollection,
        'posts'
      );

      await addDoc(postsRef, postData);

      // Update collection thumbnail if this is the first post
      const collectionRef = doc(FIREBASE_DB, 'users', userId, 'collections', selectedCollection);
      const collectionDoc = await getDoc(collectionRef);
      if (!collectionDoc.data()?.thumbnail) {
        await updateDoc(collectionRef, { thumbnail });
      }
      toast.show("Post added successfully", { type: "success" });

      // No need to explicitly call fetchCollections since useUserData hook
      // will automatically update via its real-time listener

    } catch (error) {
      console.error('Error adding post: ', error);
      toast.show("Failed to add post", { type: "danger" });
    }
  };

  const renderThumbnail = (thumbnail) => {
    if (thumbnail.includes('instagram.com')) {
      const postId = thumbnail.split('/')[4]; // Extract the post ID from the URL
      const embedUrl = `https://www.instagram.com/p/${postId}/embed`;

      return (
        <WebView
          source={{ uri: embedUrl }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      );
    } else {
      return (
        <Image
          source={{ uri: thumbnail || DEFAULT_THUMBNAIL }}
          style={styles.thumbnail}
          onError={(e) => console.log('Failed to load thumbnail:', e.nativeEvent.error)}
        />
      );
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
        columnWrapperStyle={{ justifyContent: 'space-between' }} // Ensures items don't stretch
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.collectionCard}
            onPress={() => navigation.navigate('CollectionDetails', { collectionId: item.id })}
          >
            {renderThumbnail(item.thumbnail)}
            <Text style={styles.collectionName}>{item.name}</Text>
            <Text style={styles.collectionStats}>{item.items.length} posts</Text>
          </TouchableOpacity>
        )}
      />

      {/* AddButton Component */}
      <View style={styles.addButtonContainer}>
        <AddButton
          onAddPost={handleAddPost}
          onAddCollection={handleAddCollection}
          collections={collections}
        />
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
    width: '48%', // Ensure it fits within 2 columns
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16, // Space between rows
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
  webview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
});