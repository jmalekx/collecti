//React and React Native core imports
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, TextInput, StyleSheet, FlatList, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';

//Project services and utilities
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { DEFAULT_THUMBNAIL } from '../../constants';
import RenderThumbnail from '../../components/RenderThumbnail';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useCollectionSearch } from '../../hooks/useCollectionSearch';

//Custom component imports and styling
import commonStyles from '../../styles/commonStyles';

/*
  SearchPage Component

  Implements search functionality for collection discovery across platform
  - Recent collections display on initial load
  - Results are fetched based on user input in the search bar
  - Infinite scroll pagination for loading more results as user scrolls down
  - Bookmarking functionality for collections
  - Collection details navigation
  - Real-time search with debouncing for performance
*/

const SearchPage = ({ navigation }) => {
  //Content managing
  const currentUserId = FIREBASE_AUTH.currentUser?.uid;
  const BATCH_SIZE = 6;

  //State transitions
  const [searchQuery, setSearchQuery] = useState('');
  const initialLoadComplete = useRef(false);

  //Collection search hook
  const {
    results,
    loading,
    loadingMore,
    hasMore,
    resetPagination,
    fetchRecentCollections,
    searchCollections
  } = useCollectionSearch(BATCH_SIZE);

  //Bookmarks hook
  const {
    isBookmarked,
    toggleBookmark,
    loadBookmarks
  } = useBookmarks();

  //Load bookmarks when component mounts or screen comes into focus
  useEffect(() => {
    if (currentUserId) {
      loadBookmarks();
    }

    const unsubscribe = navigation.addListener('focus', () => {
      if (currentUserId) {
        loadBookmarks();
      }
    });

    return unsubscribe;
  }, [navigation, currentUserId, loadBookmarks]);

  //Initial load of collections - only run once on mount
  useEffect(() => {
    const initialLoad = async () => {
      if (results.length === 0) {
        await fetchRecentCollections();
        initialLoadComplete.current = true;
      }
    };
    initialLoad();
  }, []); //Empty dependency array to ensure it only runs once

  //Also fetch on screen focus if no search query is active
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (searchQuery.trim() === '' && results.length === 0) {
        fetchRecentCollections();
        initialLoadComplete.current = true;
      }
    });
    return unsubscribe;
  }, [navigation, searchQuery, results.length, fetchRecentCollections]);

  //Handle infinite scroll
  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore || !initialLoadComplete.current) return;

    if (searchQuery.trim() !== '') {
      searchCollections(searchQuery, true);
    }
    else {
      fetchRecentCollections(true);
    }
  }, [loading, loadingMore, hasMore, searchQuery, searchCollections, fetchRecentCollections]);

  //Handle search query changes with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      resetPagination();
      initialLoadComplete.current = false;

      if (searchQuery.trim() !== '') {
        searchCollections(searchQuery).then(() => {
          initialLoadComplete.current = true;
        });
      }
      else {
        fetchRecentCollections().then(() => {
          initialLoadComplete.current = true;
        });
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]); //Minimal dependencies to avoid re-renders

  //Handle bookmark toggle
  const handleBookmarkToggle = async (collectionId) => {
    try {
      //Get collection data from results
      const collection = results.find(item => item.id === collectionId);

      if (!collection) {
        return;
      }

      //Format collection data for bookmark
      const bookmarkData = {
        id: collectionId,
        ownerId: collection.ownerId,
        imageUrl: collection.thumbnail || DEFAULT_THUMBNAIL,
        title: collection.name,
        description: collection.description || ''
      };

      //Use toggle function from hook - toast is now handled within the hook
      await toggleBookmark(bookmarkData);
    }
    catch (error) {
      //Error handling done within hook
    }
  };

  //Navigation to collection details
  const navigateToCollection = (collectionId, ownerId) => {
    navigation.navigate('CollectionDetails', {
      collectionId,
      ownerId,
      isExternalCollection: ownerId !== currentUserId
    });
  };

  //Render collection item
  const renderCollectionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.collectionCard}
      onPress={() => navigateToCollection(item.id, item.ownerId)}
    >
      <View style={styles.thumbnailContainer}>
        <RenderThumbnail
          thumbnail={item.thumbnail || DEFAULT_THUMBNAIL}
          scale={0.5}
          containerStyle={styles.thumbnailWrapper}
          thumbnailStyle={styles.thumbnail}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.collectionName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.collectionSubtext} numberOfLines={1}>
          {item.ownerId === currentUserId
            ? 'Your Collection'
            : 'Public Collection'}
        </Text>

        {item.ownerId !== currentUserId && (
          <TouchableOpacity
            onPress={() => handleBookmarkToggle(item.id)}
            style={styles.bookmarkButton}
          >
            <Ionicons
              name={isBookmarked(item.id) ? "bookmark" : "bookmark-outline"}
              size={16}
              color="#007AFF"
            />
            <Text style={styles.bookmarkText}>
              {isBookmarked(item.id) ? "Bookmarked" : "Bookmark"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {loading && !loadingMore && (
          <View style={styles.fullScreenLoader}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}

        <Ionicons name="search-outline" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search collections..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item, index) => item.uniqueId || `${item.id}_${index}`} // Fallback key
        numColumns={2}
        columnWrapperStyle={styles.resultGrid}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={10}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
        ListFooterComponent={() => (
          loadingMore ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          ) : null
        )}
        renderItem={renderCollectionItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {loading ? 'Loading collections...' :
                searchQuery.trim() === '' ? 'Recent collections will appear here' : 'No results found'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  resultGrid: {
    justifyContent: 'space-between',
  },
  collectionCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnailContainer: {
    height: 120,
    backgroundColor: '#eee',
  },
  thumbnailWrapper: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 12,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  collectionSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bookmarkButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    maxWidth: '80%',
  },
  fullScreenLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

export default SearchPage;