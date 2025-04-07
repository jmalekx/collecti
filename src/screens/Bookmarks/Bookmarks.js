//React and React Native core imports
import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';

//Third-party library external imports
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

//Project services and utilities
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { DEFAULT_THUMBNAIL } from '../../constants';
import { useBookmarks } from '../../hooks/useBookmarks';
import { usePagination } from '../../hooks/usePagination';

//Custom component imports and styling
import commonStyles, { colours } from '../../styles/commonStyles';
import bookmarkstyles from '../../styles/bookmarkstyles';
import { AppButton } from '../../components/utilities/Typography';
import LoadingIndicator from '../../components/utilities/LoadingIndicator';

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

  //Use custom bookmark hook for all bookmark operations
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


  const navigation = useNavigation();
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
      style={bookmarkstyles.collectionCard}
      onPress={() => navigateToCollectionDetail(item)}
    >
      {/* Collection Thumbnail */}
      <View style={bookmarkstyles.thumbnailContainer}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={bookmarkstyles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={{ uri: DEFAULT_THUMBNAIL }}
            style={bookmarkstyles.thumbnail}
            resizeMode="cover"
          />
        )}
      </View>

      {/* Collection Metadata */}
      <View style={bookmarkstyles.collectionInfo}>
        <Text style={bookmarkstyles.collectionTitle}>{item.name}</Text>
        <Text style={bookmarkstyles.collectionDescription} numberOfLines={2}>
          {item.description || 'No description available'}
        </Text>
      </View>

      {/* Bookmark removal button */}
      <TouchableOpacity
        style={bookmarkstyles.bookmarkButton}
        onPress={() => removeBookmark(item.id)}
      >
        <Ionicons name="bookmark" size={24} color={colours.buttonsTextPink} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  //Empty bookmarks state component
  const EmptyBookmarksMessage = () => (
    <View style={bookmarkstyles.emptyContainer}>
      {/* Visual Empty State Indicator */}
      <Ionicons name="bookmark-outline" size={64} color={colours.darkergrey} />
      <Text style={bookmarkstyles.emptyText}>You haven't bookmarked any collections yet.</Text>
      <AppButton
        style={commonStyles.pinkbutton}
        textStyle={commonStyles.pinkbuttonText}
        title="Explore Collections"
        onPress={() => navigation.navigate('SearchScreen')}
      />
    </View>
  );

  //Render footer with loading indicator
  const renderFooter = () => {
    if (!hasMore) return null;
    return isLoadingMore ? <LoadingIndicator /> : null;
  };

  return (
    <commonStyles.Bg>
      <View style={[commonStyles.container, { marginTop: -4 }]}>

        {/* Content */}
        {loading ? (
          <View style={commonStyles.loadingContainer}>
            <LoadingIndicator />
          </View>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            data={paginatedBookmarks}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={bookmarkedCollections.length === 0 ? bookmarkstyles.emptyListContent : bookmarkstyles.listContent}
            ListEmptyComponent={EmptyBookmarksMessage}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
          />
        )}
      </View>
    </commonStyles.Bg>
  );
};

export default Bookmarks;