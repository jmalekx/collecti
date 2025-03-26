import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useUserData } from '../../hooks/useUserData';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { DEFAULT_PROFILE_PICTURE, DEFAULT_THUMBNAIL } from '../../constants';
import InstagramEmbed from '../../components/InstagramEmbed';
import TikTokEmbed from '../../components/TiktokEmbed';
import commonStyles from '../../commonStyles';
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
  const navigation = useNavigation();
  const { userProfile, collections } = useUserData();
  const [searchQuery, setSearchQuery] = useState('');

  //header with settings button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('UserSettings')}
          style={styles.headerButton}
        >
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Derived values from userProfile and collections
  const username = userProfile?.username || FIREBASE_AUTH.currentUser?.email?.split('@')[0] || 'User';
  const profilePicture = userProfile?.profilePicture || DEFAULT_PROFILE_PICTURE;

  // Calculate stats directly from collections
  const stats = `${collections.length} collections | ${collections.reduce((sum, collection) => sum + collection.items.length, 0)
    } posts`;

  // Filter collections based on search query
  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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