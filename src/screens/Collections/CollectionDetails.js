//React and React Native core imports
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Modal, TouchableOpacity } from 'react-native';

//Third-party library external imports
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';
import { Ionicons } from '@expo/vector-icons';

//Project services and utilities
import { useCollectionDetails } from '../../hooks/useCollectionDetails';
import { useSelectionMode } from '../../hooks/useSelectionMode';
import { usePagination } from '../../hooks/usePagination';
import { useSorting } from '../../hooks/useSorting';

//Custom component imports and styling
import { showToast, TOAST_TYPES } from '../../components/utilities/Toasts';
import commonStyles, { colours } from '../../styles/commonStyles';
import collectionstyles from '../../styles/collectionstyles';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import LoadingIndicator from '../../components/utilities/LoadingIndicator';
import SearchBar from '../../components/utilities/SearchBar';
import CollectionDetailHeader from '../../components/layout/Collections/CollectionDetailHeader';
import PostGrid from '../../components/layout/Collections/PostGrid';
import GroupActionModal from '../../components/modals/GroupActionModal';
import SortMenu from '../../components/layout/Collections/SortMenu';

/*
  CollectionDetails Component

  Displays details of a specific collection, including posts and options to edit or delete the collection.
  Allows users to search for posts, move or delete multiple posts, and view post details. Acts
  as coordinayor between data management hooks and presentational ui elements.
  
*/

const CollectionDetails = ({ route, navigation }) => {
  const { collectionId, ownerId, isExternalCollection } = route.params;

  const INITIAL_POSTS_TO_DISPLAY = 6;
  const POSTS_INCREMENT = 8;

  //Context states
  const toast = useToast();

  //Use custom hooks
  const {
    posts,
    filteredPosts,
    collections,
    collectionName,
    collectionDescription,
    loading,
    searchQuery,
    setSearchQuery,
    canEditCollection,
    effectiveUserId,
    currentUserId,
    fetchData,
    deleteCollection,
    deletePost,
    deleteMultiplePosts,
    movePostsToCollection,
    createCollectionAndMovePosts,
    setupPostsListener
  } = useCollectionDetails(collectionId, ownerId, isExternalCollection);

  const {
    isSelectionMode,
    selectedItems: selectedPosts,
    toggleSelectionMode,
    toggleItemSelection,
    selectSingleItem,
    clearSelections,
    setIsSelectionMode
  } = useSelectionMode();

  // Use the sorting hook
  const {
    sortedItems: sortedPosts,
    sortOption,
    sortOptions,
    showSortMenu,
    setShowSortMenu,
    handleSortChange
  } = useSorting(filteredPosts);

  //State transitions
  const [numColumns, setNumColumns] = useState(2);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [showDeleteCollectionModal, setShowDeleteCollectionModal] = useState(false);
  const [showDeletePostModal, setShowDeletePostModal] = useState(false);
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
  const [isGroupActionModalVisible, setIsGroupActionModalVisible] = useState(false);

  const isFocused = useIsFocused();

  useFocusEffect(
    React.useCallback(() => {
      fetchData();

      //Set up event listener for post additions
      const unsubscribe = navigation.addListener('postAdded', (data) => {
        //If data matches current collection refresh posts
        if (data && data.collectionId === collectionId) {
          fetchData();
        }
      });

      //Clean up
      return () => {
        unsubscribe();
      };
    }, [collectionId, fetchData, navigation])
  );

  //Setup realtime listener for posts
  useEffect(() => {
    const unsubscribe = setupPostsListener();
    return () => unsubscribe();
  }, [setupPostsListener]);

  //Use sorted posts with pagination
  const {
    paginatedItems: paginatedPosts,
    hasMore,
    isLoadingMore,
    loadMore,
    resetPagination
  } = usePagination(sortedPosts, INITIAL_POSTS_TO_DISPLAY, POSTS_INCREMENT);

  //Reset pagination when search query or sort option changes
  useEffect(() => {
    resetPagination();
  }, [searchQuery, sortOption, resetPagination]);

  //Handle load more on scroll end
  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  //Action handlers focus on UI interaction not business logic
  const handleGroupMove = () => {
    if (selectedPosts.length === 0) {
      showToast(toast, "No posts selected", { type: TOAST_TYPES.WARNING });
      return;
    }
    setIsGroupActionModalVisible(true);
  };

  const handleGroupDelete = () => {
    if (selectedPosts.length === 0) {
      showToast(toast, "No posts selected", { type: TOAST_TYPES.WARNING });
      return;
    }
    setShowDeleteGroupModal(true);
  };

  const handleConfirmGroupDelete = async () => {
    const success = await deleteMultiplePosts(selectedPosts);
    if (success) {
      setShowDeleteGroupModal(false);
      setIsSelectionMode(false);
      clearSelections();
    }
  };

  const handleDeleteCollection = async () => {
    const success = await deleteCollection();
    if (success) {
      setShowDeleteCollectionModal(false);
      navigation.goBack();
    }
  };

  const handleMoveToExistingCollection = async (targetCollectionId) => {
    if (!targetCollectionId) {
      showToast(toast, "Please select a target collection", { type: TOAST_TYPES.WARNING });
      return;
    }

    const success = await movePostsToCollection(selectedPosts, targetCollectionId);
    if (success) {
      setIsGroupActionModalVisible(false);
      setIsSelectionMode(false);
      clearSelections();
    }
  };

  const handleCreateCollectionAndMove = async (newCollectionName) => {
    if (!newCollectionName.trim()) {
      showToast(toast, "Collection name cannot be empty", { type: TOAST_TYPES.WARNING });
      return;
    }

    const success = await createCollectionAndMovePosts(selectedPosts, newCollectionName);
    if (success) {
      setIsGroupActionModalVisible(false);
      setIsSelectionMode(false);
      clearSelections();
    }
  };

  //UI helpers
  const closeMenu = () => {
    setSelectedPost(null);
    setIsMenuVisible(false);
  };

  return (
    <commonStyles.Bg>
      <View style={[commonStyles.container, { marginTop: -10 }]}>

        {/* Collection Header Component */}
        <CollectionDetailHeader
          navigation={navigation}
          collectionName={collectionName}
          collectionDescription={collectionDescription}
          postsCount={posts.length}
          isSelectionMode={isSelectionMode}
          selectedPosts={selectedPosts}
          toggleSelectionMode={toggleSelectionMode}
          handleGroupMove={handleGroupMove}
          handleGroupDelete={handleGroupDelete}
          isExternalCollection={isExternalCollection}
          canEditCollection={canEditCollection}
          setShowDeleteCollectionModal={setShowDeleteCollectionModal}
          collectionId={collectionId}
        />

        {/* Search Bar and Sort Button */}
        <View style={collectionstyles.searchSortContainer}>
          <View style={collectionstyles.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search posts..."
            />
          </View>

          <TouchableOpacity
            style={collectionstyles.sortButton}
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <Ionicons name="filter-outline" size={20} color={colours.buttonsTextPink} />
          </TouchableOpacity>
        </View>

        {/* Sort Menu Component */}
        <SortMenu
          visible={showSortMenu}
          onClose={() => setShowSortMenu(false)}
          sortOption={sortOption}
          onSortChange={handleSortChange}
          sortOptions={sortOptions}
        />

        {/* Posts List */}
        <FlatList
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={paginatedPosts}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          key={numColumns}
          onEndReached={() => {
            handleLoadMore();
          }}
          onEndReachedThreshold={0.2}
          scrollEventThrottle={16}
          removeClippedSubviews={false}
          ListFooterComponent={() => (
            <View style={{ padding: 10, alignItems: 'center' }}>
              {isLoadingMore && <LoadingIndicator />}
              {hasMore && !isLoadingMore && (
                <TouchableOpacity
                  style={{
                    padding: 10,
                    backgroundColor: colours.primary,
                    borderRadius: 5,
                    alignItems: 'center',
                    marginTop: 10,
                    width: '50%'
                  }}
                  onPress={() => {
                    loadMore();
                  }}
                >
                  <Text style={{ color: colours.buttonsTextPink }}>Load More</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={collectionstyles.emptyContainer}>
              <MaterialIcons name="post-add" size={64} color={colours.grey} />
              <Text style={collectionstyles.emptyText}>
                This collection is empty! Start adding posts to keep things organised.
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <PostGrid
              item={item}
              isSelectionMode={isSelectionMode}
              selectedPosts={selectedPosts}
              toggleItemSelection={toggleItemSelection}
              selectSingleItem={selectSingleItem}
              navigation={navigation}
              collectionId={collectionId}
              effectiveUserId={effectiveUserId}
            />
          )}
        />

        {/* Group Action Modal (Move) */}
        <GroupActionModal
          visible={isGroupActionModalVisible}
          onClose={() => setIsGroupActionModalVisible(false)}
          collections={collections}
          selectedPosts={selectedPosts}
          onMoveToExisting={handleMoveToExistingCollection}
          onCreateAndMove={handleCreateCollectionAndMove}
        />

        <View>
          {/* Delete Collection Modal */}
          <ConfirmationModal
            visible={showDeleteCollectionModal}
            onClose={() => setShowDeleteCollectionModal(false)}
            title="Delete Collection"
            message="Are you sure you want to delete this collection? This action cannot be undone."
            primaryAction={handleDeleteCollection}
            primaryText="Delete"
            primaryStyle="danger"
            icon="trash-outline"
          />

          {/* Delete Group Modal */}
          <ConfirmationModal
            visible={showDeleteGroupModal}
            onClose={() => setShowDeleteGroupModal(false)}
            title={`Delete ${selectedPosts.length} Posts`}
            message="Are you sure you want to delete these posts? This action cannot be undone."
            primaryAction={handleConfirmGroupDelete}
            primaryText="Delete"
            primaryStyle="danger"
            icon="trash-outline"
          />
        </View>

        {/* Menu Modal */}
        <Modal
          visible={isMenuVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeMenu}
        >
          <View style={collectionstyles.menuModal}>
            <View style={collectionstyles.menuContent}>
              <TouchableOpacity
                style={collectionstyles.menuItem}
                onPress={() => {
                  navigation.navigate('EditPost', { collectionId, postId: selectedPost.id });
                  closeMenu();
                }}
              >
                <Text style={collectionstyles.menuText}>Edit Post</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={collectionstyles.menuItem}
                onPress={() => deletePost(selectedPost.id)}
              >
                <Text style={[collectionstyles.menuText, { color: 'red' }]}>Delete Post</Text>
              </TouchableOpacity>
              <TouchableOpacity style={collectionstyles.menuItem} onPress={closeMenu}>
                <Text style={collectionstyles.menuText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </commonStyles.Bg>
  );
};

export default CollectionDetails;