import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';

const Bookmarks = () => {
  const [bookmarkedCollections, setBookmarkedCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const currentUserId = FIREBASE_AUTH.currentUser?.uid;

  useEffect(() => {
    // Load bookmarked collections when the component mounts
    if (currentUserId) {
      loadBookmarkedCollections();
    }

    // Add listener for when the screen comes into focus to refresh data
    const unsubscribe = navigation.addListener('focus', () => {
      if (currentUserId) {
        loadBookmarkedCollections();
      }
    });

    return unsubscribe;
  }, [navigation, currentUserId]);

  const loadBookmarkedCollections = async () => {
    try {
      setLoading(true);
      // Use user-specific key for bookmarks
      const bookmarksJson = await AsyncStorage.getItem(`bookmarkedCollections_${currentUserId}`);
      const bookmarks = bookmarksJson ? JSON.parse(bookmarksJson) : [];
      setBookmarkedCollections(bookmarks);
    } catch (error) {
      console.error('Error loading bookmarked collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (collectionId) => {
    try {
      // Filter out the collection to be removed
      const updatedBookmarks = bookmarkedCollections.filter(
        collection => collection.id !== collectionId
      );

      // Update state
      setBookmarkedCollections(updatedBookmarks);

      // Save to AsyncStorage with user-specific key
      await AsyncStorage.setItem(`bookmarkedCollections_${currentUserId}`, JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const navigateToCollectionDetail = (collection) => {
    navigation.navigate('CollectionDetails', {
      collectionId: collection.id,
      ownerId: collection.ownerId,
      isExternalCollection: collection.ownerId !== currentUserId
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.collectionCard}
      onPress={() => navigateToCollectionDetail(item)}
    >
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
        style={styles.collectionImage}
      />
      <View style={styles.collectionInfo}>
        <Text style={styles.collectionTitle}>{item.title}</Text>
        <Text style={styles.collectionDescription} numberOfLines={2}>
          {item.description || 'No description available'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.bookmarkButton}
        onPress={() => removeBookmark(item.id)}
      >
        <Ionicons name="bookmark" size={24} color="#FF6B6B" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const EmptyBookmarksMessage = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>You haven't bookmarked any collections yet</Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Search')}
      >
        <Text style={styles.exploreButtonText}>Explore Collections</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Bookmarks</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading bookmarks...</Text>
        </View>
      ) : (
        <FlatList
          data={bookmarkedCollections}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={bookmarkedCollections.length === 0 ? styles.emptyListContent : styles.listContent}
          ListEmptyComponent={EmptyBookmarksMessage}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  collectionCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  collectionImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  collectionInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  collectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  collectionDescription: {
    fontSize: 14,
    color: '#666',
  },
  bookmarkButton: {
    justifyContent: 'center',
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default Bookmarks;