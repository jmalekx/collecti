import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, FlatList, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../FirebaseConfig';
import { 
    collectionGroup, 
    query, 
    where, 
    getDocs, 
    limit, 
    orderBy,
    startAfter 
  } from 'firebase/firestore';
import { DEFAULT_THUMBNAIL } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from 'react-native-toast-notifications';
import { showToast, TOAST_TYPES } from '../../components/Toasts';

const SearchPage = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastVisible, setLastVisible] = useState(null); // Track last document for pagination
    const [hasMore, setHasMore] = useState(true); // Track if more results exist
    const [loadingMore, setLoadingMore] = useState(false);
    const [processedIds, setProcessedIds] = useState(new Set());
    const [loadedIds] = useState(new Set());
    const BATCH_SIZE = 2; // Number of items to load per batch
    const [bookmarkedCollections, setBookmarkedCollections] = useState(new Set());
    const currentUserId = FIREBASE_AUTH.currentUser?.uid;
    const toast = useToast();

    useEffect(() => {
      if (currentUserId) {
        loadBookmarkedCollections();
      }
      
      // Also refresh bookmarked collections when the screen comes into focus
      const unsubscribe = navigation.addListener('focus', () => {
        if (currentUserId) {
          loadBookmarkedCollections();
        }
      });
      
      return unsubscribe;
    }, [navigation, currentUserId]);

    const loadBookmarkedCollections = async () => {
      try {
        const bookmarksJson = await AsyncStorage.getItem(`bookmarkedCollections_${currentUserId}`);
        const bookmarks = bookmarksJson ? JSON.parse(bookmarksJson) : [];
        
        // Create a Set of bookmarked collection IDs for efficient lookup
        const bookmarkedIds = new Set(bookmarks.map(item => item.id));
        setBookmarkedCollections(bookmarkedIds);
      } catch (error) {
        console.error('Error loading bookmarked collections:', error);
      }
    };

    const fetchRecentCollections = async (loadMore = false) => {
        try {
            if (!hasMore && loadMore) return;
            
            if (loadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
                loadedIds.clear(); // Clear loaded IDs on fresh load
            }

            let recentCollectionsQuery;
            if (loadMore && lastVisible) {
                recentCollectionsQuery = query(
                    collectionGroup(FIREBASE_DB, 'collections'),
                    orderBy('createdAt', 'desc'),
                    startAfter(lastVisible),
                    limit(BATCH_SIZE)
                );
            } else {
                recentCollectionsQuery = query(
                    collectionGroup(FIREBASE_DB, 'collections'),
                    orderBy('createdAt', 'desc'),
                    limit(BATCH_SIZE)
                );
            }

            const snapshot = await getDocs(recentCollectionsQuery);
             // Update lastVisible only if we have results
             if (snapshot.docs.length > 0) {
                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
                setHasMore(snapshot.docs.length === BATCH_SIZE);
            } else {
                setHasMore(false);
            }

            const newCollections = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    ownerId: doc.ref.parent.parent.id,
                    uniqueId: `${doc.ref.parent.parent.id}_${doc.id}`
                }))
                .filter(collection => {
                    // Skip if we've already loaded this collection
                    if (loadedIds.has(collection.uniqueId)) {
                        return false;
                    }
                    // Add to loaded IDs
                    loadedIds.add(collection.uniqueId);
                    
                    // Show user's own collections and other's non-Unsorted collections
                    return collection.ownerId === FIREBASE_AUTH.currentUser?.uid || 
                           !collection.name.includes('Unsorted');
                });

            setResults(prev => loadMore ? [...prev, ...newCollections] : newCollections);
        } catch (error) {
            console.error('Error fetching recent collections:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };
  

  const performSearch = async (term, loadMore = false) => {
    try {
      if (!hasMore && loadMore) return;
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const normalizedSearchTerm = term.toLowerCase();

      let collectionsQuery;
      if (loadMore && lastVisible) {
        collectionsQuery = query(
          collectionGroup(FIREBASE_DB, 'collections'),
          where('name', '>=', normalizedSearchTerm),
          where('name', '<=', normalizedSearchTerm + '\uf8ff'),
          orderBy('name'),
          startAfter(lastVisible),
          limit(BATCH_SIZE)
        );
      } else {
        collectionsQuery = query(
          collectionGroup(FIREBASE_DB, 'collections'),
          where('name', '>=', normalizedSearchTerm),
          where('name', '<=', normalizedSearchTerm + '\uf8ff'),
          orderBy('name'),
          limit(BATCH_SIZE)
        );
      }

      const snapshot = await getDocs(collectionsQuery);
      
      // Update lastVisible
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc);
      
      // Check if we've reached the end
      setHasMore(snapshot.docs.length === BATCH_SIZE);

      const newCollections = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          ownerId: doc.ref.parent.parent.id
        }))
        .filter(collection => {
          if (collection.ownerId === FIREBASE_AUTH.currentUser?.uid) {
            return true;
          }
          return !collection.name.includes('Unsorted');
        });

      // Append or replace results
      setResults(prev => loadMore ? [...prev, ...newCollections] : newCollections);
    } catch (error) {
        console.error('Error searching collections:', error);
      } finally {
        if (loadMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    };

  // Handle end reached (infinite scroll)
  const handleLoadMore = React.useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    
    if (searchQuery.trim() !== '') {
        performSearch(searchQuery, true);
    } else {
        fetchRecentCollections(true);
    }
}, [loading, loadingMore, hasMore, searchQuery]);


  // Reset pagination when search query changes
  useEffect(() => {
    setLastVisible(null);
    setHasMore(true);
    
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        performSearch(searchQuery);
      } else {
        fetchRecentCollections();
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const bookmarkCollection = async (collectionId) => {
    try {
      // Get the collection data
      const collection = results.find(item => item.id === collectionId);
      
      if (!collection) {
        console.error("Collection not found in results");
        return;
      }
      
      // Collection data to save in the bookmark
      const bookmarkData = {
        id: collectionId,
        ownerId: collection.ownerId,
        imageUrl: collection.thumbnail || DEFAULT_THUMBNAIL,
        title: collection.name,
        description: collection.description || ''
      };
      
      // Get existing bookmarks with user-specific key
      const bookmarksJson = await AsyncStorage.getItem(`bookmarkedCollections_${currentUserId}`);
      const bookmarks = bookmarksJson ? JSON.parse(bookmarksJson) : [];
      
      // Check if already bookmarked
      const isAlreadyBookmarked = bookmarks.some(item => item.id === collectionId);
      
      if (!isAlreadyBookmarked) {
        // Add to bookmarks and save with user-specific key
        const updatedBookmarks = [...bookmarks, bookmarkData];
        await AsyncStorage.setItem(`bookmarkedCollections_${currentUserId}`, JSON.stringify(updatedBookmarks));
        
        // Update the bookmarked collections set
        setBookmarkedCollections(prev => new Set([...prev, collectionId]));
        
        // Show feedback to user
        showToast(toast,"Collection added to bookmarks",{ type: TOAST_TYPES.SUCCESS });
      } else {
        // Remove from bookmarks
        const updatedBookmarks = bookmarks.filter(item => item.id !== collectionId);
        await AsyncStorage.setItem(`bookmarkedCollections_${currentUserId}`, JSON.stringify(updatedBookmarks));
        
        // Update the bookmarked collections set
        setBookmarkedCollections(prev => {
          const newSet = new Set(prev);
          newSet.delete(collectionId);
          return newSet;
        });
        
        // Show feedback to user
        showToast(toast,"Collection removed from bookmarks",{ type: TOAST_TYPES.INFO });
      }
    } catch (error) {
      console.error("Error managing bookmark:", error);
      showToast(toast,"Could not save or remove this bookmark",{ type: TOAST_TYPES.DANGER });
    }
  };

const navigateToCollection = (collectionId, ownerId) => {
  // Navigate to the collection details screen
  // Set isExternalCollection to true if the collection belongs to another user
  navigation.navigate('CollectionDetails', { 
    collectionId, 
    ownerId,
    isExternalCollection: ownerId !== FIREBASE_AUTH.currentUser?.uid
  });
};

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

      {/* Display search results */}
      <FlatList
                data={results}
                keyExtractor={item => item.uniqueId}
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
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.collectionCard}
                    onPress={() => navigateToCollection(item.id, item.ownerId)}
                  >
                    <Image 
                      source={{ uri: item.thumbnail || DEFAULT_THUMBNAIL }} 
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />
                    <View style={styles.cardContent}>
                      <Text style={styles.collectionName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.collectionSubtext} numberOfLines={1}>
                        {item.ownerId === FIREBASE_AUTH.currentUser?.uid 
                          ? 'Your Collection' 
                          : 'Public Collection'}
                      </Text>
                      
                      {item.ownerId !== FIREBASE_AUTH.currentUser?.uid && (
                        <TouchableOpacity
                          onPress={() => bookmarkCollection(item.id)}
                          style={styles.bookmarkButton}
                        >
                          <Ionicons 
                            name={bookmarkedCollections.has(item.id) ? "bookmark" : "bookmark-outline"} 
                            size={16} 
                            color="#007AFF" 
                          />
                          <Text style={styles.bookmarkText}>
                            {bookmarkedCollections.has(item.id) ? "Bookmarked" : "Bookmark"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
        
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery.trim() === '' 
                ? 'Try searching for collections' 
                : 'No results found'}
            </Text>
          </View>
        }
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
  thumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: '#eee',
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