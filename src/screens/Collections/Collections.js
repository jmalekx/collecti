import React, { useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useUserData } from '../../hooks/useUserData';
import AddButton from '../../components/AddButton';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../FirebaseConfig';
import { DEFAULT_PROFILE_PICTURE, DEFAULT_THUMBNAIL } from '../../constants';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useToast } from 'react-native-toast-notifications';
import InstagramEmbed from '../../components/InstagramEmbed';
import TikTokEmbed from '../../components/TiktokEmbed';
import commonStyles from '../../commonStyles';
import { showToast, TOAST_TYPES } from '../../components/Toasts';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ProfileHeader = ({ username, stats, profilePicture, onEditProfile }) => (
  <View style={styles.header}>
    <Image
      source={{ uri: profilePicture }}
      style={styles.profilePicture}
      onError={(e) => console.log('Failed to load profile picture:', e.nativeEvent.error)}
    />
    <Text style={styles.username}>{username}</Text>
    <Text style={styles.stats}>{stats}</Text>
    <TouchableOpacity 
    onPress={onEditProfile}
    style={styles.button}>
      <Text style={styles.buttonText}>Edit Profile</Text>
    </TouchableOpacity>
  </View>
);

const Collections = ({ }) => {
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
      showToast(toast,"Collection created successfully", { type: TOAST_TYPES.SUCCESS, });
    } catch (error) {
      console.error('Error adding collection: ', error);
      showToast(toast, "Failed to create collection", { type: TOAST_TYPES.DANGER });
    }
  };

  const handleAddPost = async (notes, tags, image, selectedCollection, postPlatform) => {
    try {
      let thumbnail = image || DEFAULT_THUMBNAIL;
      let originalUrl = image;

      // Check if platform is Instagram and generate embed URL
      if (postPlatform === 'instagram' && image.includes('instagram.com')) {
        // Extract post ID following the same pattern as in InstagramEmbed.js
        let postId;
        
        if (image.includes('/p/')) {
          // Format: https://www.instagram.com/p/ABC123/
          const parts = image.split('/');
          const pIndex = parts.indexOf('p');
          if (pIndex !== -1 && parts.length > pIndex + 1) {
            postId = parts[pIndex + 1];
          }
        } else if (image.includes('instagram.com')) {
          // Try to extract from any Instagram URL
          const match = image.match(/instagram\.com\/(?:p|reel)\/([^\/\?]+)/);
          postId = match ? match[1] : null;
        }
        
        if (postId) {
          // Clean up the post ID (remove any trailing slashes or parameters)
          postId = postId.split('?')[0].split('/')[0];
          thumbnail = `https://www.instagram.com/p/${postId}/embed`;
        }
      }

      const postData = {
        notes,
        tags: tags.split(',').map((tag) => tag.trim()), // Convert tags string to array
        image: originalUrl, // Store the original URL
        platform: postPlatform,
        createdAt: new Date().toISOString(),
        thumbnail, // Store the embed URL or image URL as thumbnail
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
      if (!collectionDoc.data()?.thumbnail || collectionDoc.data().thumbnail === DEFAULT_THUMBNAIL) {
        await updateDoc(collectionRef, { thumbnail });
      }
      showToast(toast,"Post added successfully", { type: TOAST_TYPES.SUCCESS });

      // No need to explicitly call fetchCollections since useUserData hook
      // will automatically update via its real-time listener

    } catch (error) {
      console.error('Error adding post: ', error);
      showToast(toast,"Failed to add post", { type: TOAST_TYPES.DANGER });
    }
  };

  // Improved renderThumbnail function to match CollectionDetails approach
  const renderThumbnail = (thumbnail) => {
    if (thumbnail && thumbnail.includes('instagram.com')) {
      return (
        <View style={styles.instagramContainer}>
          <InstagramEmbed 
            url={thumbnail} 
            style={styles.instagramEmbed}
            scale={0.1}
          />
        </View>
      );
    } else if (thumbnail && thumbnail.includes('tiktok.com')) {
      return (
        <TikTokEmbed 
          url={thumbnail} 
          style={styles.instagramEmbed}
          scale={0.3}
        />
      );
    } else if (thumbnail && thumbnail.includes('pinterest.com')) {
      return (
        <Image
          source={{ uri: thumbnail }}
          style={styles.thumbnail}
          onError={(e) => console.log('Failed to load Pinterest thumbnail:', e.nativeEvent.error)}
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
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search collections..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

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
  ...commonStyles,
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
  grid: {
    justifyContent: 'space-between',
  },
  collectionCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden', 
  },
  collectionName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  collectionStats: {
    fontSize: 12,
    color: '#555',
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  instagramContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  instagramEmbed: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});