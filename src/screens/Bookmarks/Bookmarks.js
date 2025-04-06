//React and React Native core imports
import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

//Third-party library external imports
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

//Project services and utilities
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { DEFAULT_THUMBNAIL } from '../../constants';
import { useBookmarks } from '../../hooks/useBookmarks';
import { usePagination } from '../../hooks/usePagination';

//Custom component imports and styling
import commonStyles, { shadowStyles } from '../../styles/commonStyles';
import { AppButton } from '../../components/utilities/Typography';
import RenderThumbnail from '../../components/utilities/RenderThumbnail';

/*
  Bookmarks Screen

  Displays a list of bookmarked collections for the current user
  Implements persistence for bookmarks using custom useBookmarks hook.
  Uses pagination for efficiently loading large numbers of bookmarks.

  -Read: Load bookmarked collections (via hook)
  -Delete: Remove bookmarked collection (via hook)
  -Navigation: View the bookmarked collections
  -Pagination: Load bookmarks incrementally as user scrolls
*/

const Bookmarks = () => {

  const INITIAL_BOOKMARKS_TO_DISPLAY = 5;
  const BOOKMARKS_INCREMENT = 4;

  //Use the custom bookmark hook for all bookmark operations
  const {
    bookmarkedCollections,
    loading,
    loadBookmarks,
    removeBookmark
  } = useBookmarks();

  //Use pagination hook for bookmarked collections
  const {
    paginatedItems: paginatedBookmarks,
    hasMore,
    isLoadingMore,
    loadMore,
    resetPagination
  } = usePagination(bookmarkedCollections, INITIAL_BOOKMARKS_TO_DISPLAY, BOOKMARKS_INCREMENT);

  //Navigation hook
  const navigation = useNavigation();

  //User authentication
  const currentUserId = FIREBASE_AUTH.currentUser?.uid;

  //Focus listener for data refresh using the hooks loadBookmarks function
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (currentUserId) {
        loadBookmarks();
        resetPagination();
      }
    });

    return unsubscribe;
  }, [navigation, currentUserId, loadBookmarks, resetPagination]);

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      loadMore();
    }
  };

  //Navigate to collection details screen of bookmarked collection
  const navigateToCollectionDetail = (collection) => {
    //Context parameters
    navigation.navigate('CollectionDetails', {
      collectionId: collection.id,
      ownerId: collection.ownerId,
      //Rendering different UI based on ownership
      isExternalCollection: collection.ownerId !== currentUserId
    });
  };

  //Render bookmarked collection item
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.collectionCard}
      onPress={() => navigateToCollectionDetail(item)}
    >
      {/* Collection Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <RenderThumbnail
          thumbnail={item.imageUrl || DEFAULT_THUMBNAIL}
          variant="card" // Using variant from preset instead of fixed scale
          containerStyle={styles.thumbnailWrapper}
          thumbnailStyle={styles.collectionImage}
        />
      </View>

      {/* Collection Metadata */}
      <View style={styles.collectionInfo}>
        <Text style={styles.collectionTitle}>{item.title}</Text>
        <Text style={styles.collectionDescription} numberOfLines={2}>
          {item.description || 'No description available'}
        </Text>
      </View>

      {/* Bookmark removal button */}
      <TouchableOpacity
        style={styles.bookmarkButton}
        onPress={() => removeBookmark(item.id)}
      >
        <Ionicons name="bookmark" size={24} color="#FF6B6B" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  //Empty bookmarks state component
  const EmptyBookmarksMessage = () => (
    <View style={styles.emptyContainer}>
      {/* Visual Empty State Indicator */}
      <Ionicons name="bookmark-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>You haven't bookmarked any collections yet</Text>
      <AppButton
        style={styles.pinkbutton}
        textStyle={styles.pinkbuttonText}
        title="Explore Collections"
        onPress={() => navigation.navigate('SearchScreen')}
      />
    </View>
  );

  return (
    <commonStyles.Bg>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading bookmarks...</Text>
          </View>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            data={paginatedBookmarks}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={bookmarkedCollections.length === 0 ? styles.emptyListContent : styles.listContent}
            ListEmptyComponent={EmptyBookmarksMessage}
            onEndReached={handleLoadMore}
          />
        )}
      </View>
    </commonStyles.Bg>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
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
    ...shadowStyles.light,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  thumbnailWrapper: {
    width: '100%',
    height: '100%',
  },
  collectionImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});

export default Bookmarks;