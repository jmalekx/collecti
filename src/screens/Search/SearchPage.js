//React and React Native core imports
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';

//Project services and utilities
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { DEFAULT_THUMBNAIL } from '../../constants';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useCollectionSearch } from '../../hooks/useCollectionSearch';

//Custom component imports and styling
import commonStyles, { colours } from '../../styles/commonStyles';
import searchstyles from '../../styles/searchstyles'; // Import the new styles
import RenderThumbnail from '../../components/utilities/RenderThumbnail';
import LoadingIndicator from '../../components/utilities/LoadingIndicator';
import SearchBar from '../../components/utilities/SearchBar';

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
    searchCollections,
  } = useCollectionSearch(BATCH_SIZE);

  //Bookmarks hook
  const { isBookmarked, toggleBookmark, loadBookmarks } = useBookmarks();

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
    } else {
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
      } else {
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
      const collection = results.find((item) => item.id === collectionId);

      if (!collection) {
        return;
      }

      //Format collection data for bookmark - SIMPLIFIED
      const bookmarkData = {
        id: collectionId,
        name: collection.name,
        ownerId: collection.ownerId,
        imageUrl: collection.thumbnail || DEFAULT_THUMBNAIL,
        description: collection.description || '',
      };

      //Use toggle function from hook
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
      isExternalCollection: ownerId !== currentUserId,
    });
  };

  //Render collection item
  const renderCollectionItem = ({ item }) => (
    <TouchableOpacity
      style={searchstyles.collectionCard}
      onPress={() => navigateToCollection(item.id, item.ownerId)}
    >
      <View style={searchstyles.thumbnailContainer}>
        <RenderThumbnail
          thumbnail={item.thumbnail || DEFAULT_THUMBNAIL}
          scale={
            item.thumbnail.includes('tiktok.com') ? 0.5 :
                item.thumbnail.includes('instagram.com') ? 0.01 :
                  undefined
          }
          containerStyle={searchstyles.thumbnailWrapper}
          thumbnailStyle={searchstyles.thumbnail}
        />
      </View>
      <View style={searchstyles.cardContent}>
        <Text style={searchstyles.collectionName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={searchstyles.collectionSubtext} numberOfLines={1}>
          {item.ownerId === currentUserId ? 'Your Collection' : 'Public Collection'}
        </Text>

        {item.ownerId !== currentUserId ? (
          <TouchableOpacity
            onPress={() => handleBookmarkToggle(item.id)}
            style={searchstyles.bookmarkButton}
          >
            <Ionicons
              name={isBookmarked(item.id) ? 'bookmark' : 'bookmark-outline'}
              size={12}
              color={colours.buttonsTextPink}
            />
            <Text style={searchstyles.bookmarkText}>
              {isBookmarked(item.id) ? 'Bookmarked' : 'Bookmark'}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={searchstyles.unbookmarkableText}>
            Cannot bookmark
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <commonStyles.Bg>
      <View style={[commonStyles.container, { marginTop: -15 }]}>
        <View>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search collections..."
          />
        </View>

        {loading && !loadingMore && (
          <View style={commonStyles.loadingContainer}>
            <LoadingIndicator />
          </View>
        )}

        <FlatList
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={results}
          keyExtractor={(item, index) => item.uniqueId || `${item.id}_${index}`} // Fallback key
          numColumns={2}
          columnWrapperStyle={searchstyles.resultGrid}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={10}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
          ListFooterComponent={() =>
            loadingMore ? (
              <View style={searchstyles.loadingContainer}>
                <LoadingIndicator />
              </View>
            ) : null
          }
          renderItem={renderCollectionItem}
          ListEmptyComponent={
            <View style={searchstyles.emptyContainer}>
              <Ionicons name="search" size={64} color="#ccc" />
              <Text style={searchstyles.emptyText}>
                {loading
                  ? 'Loading collections...'
                  : searchQuery.trim() === ''
                    ? 'Recent collections will appear here'
                    : 'No results found'}
              </Text>
            </View>
          }
        />
      </View>
    </commonStyles.Bg>
  );
};

export default SearchPage;