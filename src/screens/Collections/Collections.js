//React and React Native core imports
import React, { useState, useLayoutEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

//Third-party library external imports
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

//Project services and utilities
import { useUserData } from '../../hooks/useUserData';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { DEFAULT_PROFILE_PICTURE } from '../../constants';

//Custom component imports and styling
import commonStyles from '../../styles/commonStyles';
import ProfileHeader from '../../components/ProfileHeader';
import RenderThumbnail from '../../components/RenderThumbnail';

/*
  Collections component displays the user's collections and allows searching through them.
  Props:
  - userProfile: The user's profile data.
  - collections: The user's collections data.
*/

const Collections = ({ }) => {
  const navigation = useNavigation();
  const { userProfile, collections } = useUserData();
  const [searchQuery, setSearchQuery] = useState('');

  //Header with settings button
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

  //Username and pfp
  const username = userProfile?.username || FIREBASE_AUTH.currentUser?.email?.split('@')[0] || 'User';
  const profilePicture = userProfile?.profilePicture || DEFAULT_PROFILE_PICTURE;

  //Calculate stats directly from collections
  const stats = `${collections.length} collections | ${collections.reduce((sum, collection) => sum + collection.items.length, 0)
    } posts`;

  //Filter collections based on search query
  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  //Sort collections by creation date (newest first), with "Unsorted" always at the top
  const sortedCollections = [...filteredCollections].sort((a, b) => {
    //Always keep "Unsorted" collection at the top
    if (a.name === "Unsorted") return -1;
    if (b.name === "Unsorted") return 1;

    return b.createdAt - a.createdAt;
  });

  return (
    <commonStyles.Bg>
      <View style={styles.container}>

        {/* Profile Header */}
        <ProfileHeader
          username={username}
          stats={stats}
          profilePicture={profilePicture}
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
          data={sortedCollections}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ justifyContent: 'space-between' }} // Ensures items don't stretch
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.collectionCard}
              onPress={() => navigation.navigate('CollectionDetails', { collectionId: item.id })}
            >
              {/* Collection Thumbnail */}
              <RenderThumbnail
                thumbnail={item.thumbnail}
                containerStyle={styles.thumbnailContainer}
                thumbnailStyle={styles.thumbnail}
              />
              <Text style={styles.collectionName}>{item.name}</Text>
              <Text style={styles.collectionStats}>{item.items.length} posts</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </commonStyles.Bg>
  );
};

export default Collections;

const styles = StyleSheet.create({
  ...commonStyles,
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