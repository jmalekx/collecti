//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Modal } from 'react-native';

//Third-party library external imports
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';

//Project services and utilities
import { useCollectionDetails } from '../../hooks/useCollectionDetails';
import { useSelectionMode } from '../../hooks/useSelectionMode';
import { usePagination } from '../../hooks/usePagination';

//Custom component imports and styling
import { showToast, TOAST_TYPES } from '../../components/utilities/Toasts';
import { AppHeading, AppButton, AppTextInput, AppSubheading } from '../../components/utilities/Typography';
import commonStyles, { colours } from '../../styles/commonStyles';
import addbuttonstyles from '../../styles/addbuttonstyles';
import colldetailstyles from '../../styles/colldetailstyles';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import RenderThumbnail from '../../components/utilities/RenderThumbnail';
import LoadingIndicator from '../../components/utilities/LoadingIndicator';
import SearchBar from '../../components/utilities/SearchBar';
import Dropdown from '../../components/utilities/Dropdown';

/*
  CollectionDetails Component

  Displays details of a specific collection, including posts and options to edit or delete the collection.
  Allows users to search for posts, move or delete multiple posts, and view post details. Acts
  as coordinayor between data management hooks and presentational ui elements.
*/

const CollectionDetails = ({ route, navigation }) => {
  const { collectionId, ownerId, isExternalCollection } = route.params;

  const INITIAL_POSTS_TO_DISPLAY = 6;
  const POSTS_INCREMENT = 4;

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

  const {
    paginatedItems: paginatedPosts,
    hasMore,
    isLoadingMore,
    loadMore,
    resetPagination
  } = usePagination(filteredPosts, INITIAL_POSTS_TO_DISPLAY, POSTS_INCREMENT);


  //State transitions
  const [numColumns, setNumColumns] = useState(2);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [showDeleteCollectionModal, setShowDeleteCollectionModal] = useState(false);
  const [showDeletePostModal, setShowDeletePostModal] = useState(false);
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
  const [isGroupActionModalVisible, setIsGroupActionModalVisible] = useState(false);
  const [selectedTargetCollection, setSelectedTargetCollection] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isAddingNewCollection, setIsAddingNewCollection] = useState(false);


  const isFocused = useIsFocused();

  useFocusEffect(
    React.useCallback(() => {
      fetchData();

      //Set up an event listener for post additions
      const unsubscribe = navigation.addListener('postAdded', (data) => {
        //If the event data matches current collection, refresh posts
        if (data && data.collectionId === collectionId) {
          fetchData();
        }
      });

      //Clean up the event listener
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

  //Reset pagination when search query changes
  useEffect(() => {
    resetPagination();
  }, [searchQuery, resetPagination]);

  //Handle load more on scroll end
  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      loadMore();
    }
  };

  //Render footer with loading indicator
  const renderFooter = () => {
    if (!hasMore) return null;
    return isLoadingMore ? <LoadingIndicator /> : null;
  };

  //UI Helper functions
  const getPlatformIcon = (post) => {
    if (post.thumbnail.includes('instagram.com')) {
      return <Ionicons name="logo-instagram" size={20} color={colours.instagram} />;
    }
    else if (post.thumbnail.includes('tiktok.com')) {
      return <Ionicons name="logo-tiktok" size={20} color={colours.tiktok} />;
    }
    else if (post.thumbnail.includes('youtube.com') || post.thumbnail.includes('youtu.be')) {
      return <Ionicons name="logo-youtube" size={20} color={colours.youtube} />;
    }
    else if (post.platform === 'pinterest' || post.thumbnail.includes('pinterest.com') || post.thumbnail.includes('pin.it')) {
      return <Ionicons name="logo-pinterest" size={20} color={colours.pinterest} />;
    }
    else {
      return <Ionicons name="images-outline" size={20} color={colours.gallery} />;
    }
  };

  //Action handlers focus on UI interaction not business logic
  const handleGroupMove = () => {
    if (selectedPosts.length === 0) {
      showToast(toast, "No posts selected", { type: TOAST_TYPES.WARNING });
      return;
    }

    //Set first collection as default if available
    if (collections.length > 0 && !selectedTargetCollection) {
      setSelectedTargetCollection(collections[0].id);
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

  const handleMoveToExistingCollection = async () => {
    if (!selectedTargetCollection) {
      showToast(toast, "Please select a target collection", { type: TOAST_TYPES.WARNING });
      return;
    }

    const success = await movePostsToCollection(selectedPosts, selectedTargetCollection);
    if (success) {
      setIsGroupActionModalVisible(false);
      setIsSelectionMode(false);
      clearSelections();
    }
  };

  const handleCreateCollectionAndMove = async () => {
    if (!newCollectionName.trim()) {
      showToast(toast, "Collection name cannot be empty", { type: TOAST_TYPES.WARNING });
      return;
    }

    const success = await createCollectionAndMovePosts(selectedPosts, newCollectionName);
    if (success) {
      setNewCollectionName('');
      setIsAddingNewCollection(false);
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

  const renderThumbnail = (item) => {
    return (
      <RenderThumbnail
        thumbnail={item.thumbnail}
        containerStyle={colldetailstyles.postContentContainer}
        thumbnailStyle={colldetailstyles.thumbnail}
        scale={0.42}
      />
    );
  };

  return (
    <commonStyles.Bg>
      <View style={[commonStyles.container, { marginTop: -10 }]}>
        <View style={commonStyles.customHeader}>

          {/* Back Navigation Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={commonStyles.customHeaderBackButton}
          >
            <Ionicons name="chevron-back" size={24} color={colours.mainTexts} />
          </TouchableOpacity>
          <Text style={colldetailstyles.collectionName}>{collectionName}</Text>

          {/* Action Buttons */}
          <View style={commonStyles.customHeaderActions}>
            {isSelectionMode ? (
              <>
                <TouchableOpacity
                  onPress={toggleSelectionMode}
                  style={commonStyles.customActionButton}
                >
                  <Ionicons name="close" size={24} color={colours.mainTexts} />
                </TouchableOpacity>
                <Text style={colldetailstyles.selectionCount}>{selectedPosts.length} selected</Text>
                <TouchableOpacity
                  onPress={handleGroupMove}
                  style={[commonStyles.customActionButton, isExternalCollection && colldetailstyles.disabledIcon]}
                  disabled={isExternalCollection}
                >
                  <Ionicons name="move" size={22} color={isExternalCollection ? colours.mainTexts : colours.buttonsText} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleGroupDelete}
                  style={[commonStyles.customActionButton, isExternalCollection && colldetailstyles.disabledIcon]}
                  disabled={isExternalCollection}
                >
                  <Ionicons name="trash" size={22} color={isExternalCollection ? colours.mainTexts : colours.delete} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={toggleSelectionMode}
                  style={[commonStyles.customActionButton, isExternalCollection && colldetailstyles.disabledIcon]}
                  disabled={isExternalCollection}
                >
                  <Ionicons name="checkmark-circle-outline" size={24} color={isExternalCollection ? "#ccc" : colours.mainTexts} />
                </TouchableOpacity>
                {canEditCollection ? (
                  <>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('EditCollection', { collectionId })}
                      style={commonStyles.customActionButton}
                    >
                      <Ionicons name="create-outline" size={24} color={colours.buttonsTextPink} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowDeleteCollectionModal(true)}
                      style={commonStyles.customActionButton}
                    >
                      <Ionicons name="trash" size={24} color={colours.delete} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      disabled={true}
                      style={[commonStyles.customActionButton, colldetailstyles.disabledIcon]}
                    >
                      <Ionicons name="create-outline" size={24} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={true}
                      style={[commonStyles.customActionButton, colldetailstyles.disabledIcon]}
                    >
                      <Ionicons name="trash" size={24} color="#ccc" />
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>
        </View>

        {/* Description line */}
        <View style={colldetailstyles.headerBottom}>
          <Text style={colldetailstyles.collectionDescription}>{collectionDescription}</Text>
          <Text style={colldetailstyles.postCount}>{posts.length} posts</Text>
        </View>

        {/* Add Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search collections..."
        />

        {/* Posts List */}
        <FlatList
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={paginatedPosts}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          key={numColumns}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={() => (
            <View style={colldetailstyles.emptyContainer}>
              <MaterialIcons name="post-add" size={64} color="#ccc" />
              <Text style={colldetailstyles.emptyText}>
                This collection is empty! Start adding posts to keep things organized.
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                colldetailstyles.postCard,
                isSelectionMode && selectedPosts.includes(item.id) && colldetailstyles.selectedPostCard
              ]}
              onPress={() => {
                if (isSelectionMode) {
                  toggleItemSelection(item.id);
                } else {
                  navigation.navigate('PostDetails', {
                    postId: item.id,
                    collectionId: collectionId,
                    ownerId: effectiveUserId
                  });
                }
              }}
              onLongPress={() => {
                if (!isSelectionMode) {
                  selectSingleItem(item.id);
                }
              }}
            >
              {/* Platform Icon */}
              <View style={colldetailstyles.platformIconContainer}>
                {getPlatformIcon(item)}
              </View>

              {isSelectionMode && (
                <View style={colldetailstyles.checkboxContainer}>
                  <Ionicons
                    name={selectedPosts.includes(item.id) ? "checkmark-circle" : "ellipse-outline"}
                    size={24}
                    color={selectedPosts.includes(item.id) ? colours.buttonsText : colours.subTexts}
                  />
                </View>
              )}

              {/* Post Content */}
              {renderThumbnail(item)}
              <Text
                style={colldetailstyles.postTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.notes}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Group Action Modal (Move) */}
        <Modal
          visible={isGroupActionModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsGroupActionModalVisible(false)}
        >
          <View style={addbuttonstyles.modalBg}>
            <View style={[addbuttonstyles.modalContainer, { padding: 20 }]}>
              <View style={addbuttonstyles.modalHeader}>
                <AppHeading style={addbuttonstyles.modalTitle}>Move {selectedPosts.length} Posts</AppHeading>
                <TouchableOpacity onPress={() => setIsGroupActionModalVisible(false)}>
                  <Ionicons name="close-outline" size={24} color={colours.mainTexts} />
                </TouchableOpacity>
              </View>

              {!isAddingNewCollection ? (
                <>
                  <Text style={colldetailstyles.modalLabel}>Select Target Collection:</Text>
                  {collections.length > 0 ? (
                    <View style={colldetailstyles.dropdownContainer}>
                      <Dropdown
                        options={collections
                          //Filter out the Unsorted collection 
                          .filter(collection => collection.name !== 'Unsorted')
                          .map(collection => ({
                            label: collection.name,
                            value: collection.id
                          }))
                        }
                        selectedValue={selectedTargetCollection}
                        onValueChange={(value) => {
                          if (value === 'new') {
                            setIsAddingNewCollection(true);
                          } else {
                            setSelectedTargetCollection(value);
                          }
                        }}
                        placeholder="Select a collection"
                        addNewOption={true}
                        addNewLabel="Add New Collection"
                        onAddNew={() => setIsAddingNewCollection(true)}
                      />
                    </View>
                  ) : (
                    <View style={colldetailstyles.noCollectionsContainer}>
                      <Text style={colldetailstyles.noCollectionsText}>No other collections available</Text>
                    </View>
                  )}

                  <View style={addbuttonstyles.buttonRow}>
                    <TouchableOpacity
                      style={[addbuttonstyles.actionButton, addbuttonstyles.cancelButton]}
                      onPress={() => setIsGroupActionModalVisible(false)}
                    >
                      <Text style={addbuttonstyles.buttonText}>Cancel</Text>
                    </TouchableOpacity>

                    {collections.length > 0 && (
                      <TouchableOpacity
                        style={[addbuttonstyles.actionButton, addbuttonstyles.confirmButton]}
                        onPress={handleMoveToExistingCollection}
                      >
                        <Text style={addbuttonstyles.buttonTextWhite}>Move</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              ) : (
                <>
                  <Text style={colldetailstyles.modalLabel}>New Collection Name:</Text>
                  <View style={addbuttonstyles.standardInputContainer}>
                    <TextInput
                      placeholder="Enter Collection Name"
                      value={newCollectionName}
                      onChangeText={setNewCollectionName}
                      style={addbuttonstyles.standardInput}
                    />
                  </View>

                  <View style={addbuttonstyles.buttonRow}>
                    <TouchableOpacity
                      style={[addbuttonstyles.actionButton, addbuttonstyles.cancelButton]}
                      onPress={() => {
                        setIsAddingNewCollection(false);
                        setNewCollectionName('');
                      }}
                    >
                      <Text style={addbuttonstyles.buttonText}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[addbuttonstyles.actionButton, addbuttonstyles.confirmButton]}
                      onPress={handleCreateCollectionAndMove}
                    >
                      <Text style={addbuttonstyles.buttonTextWhite}>Create & Move</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
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
          <View style={colldetailstyles.menuModal}>
            <View style={colldetailstyles.menuContent}>
              <TouchableOpacity
                style={colldetailstyles.menuItem}
                onPress={() => {
                  navigation.navigate('EditPost', { collectionId, postId: selectedPost.id });
                  closeMenu();
                }}
              >
                <Text style={colldetailstyles.menuText}>Edit Post</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={colldetailstyles.menuItem}
                onPress={() => deletePost(selectedPost.id)}
              >
                <Text style={[colldetailstyles.menuText, { color: 'red' }]}>Delete Post</Text>
              </TouchableOpacity>
              <TouchableOpacity style={colldetailstyles.menuItem} onPress={closeMenu}>
                <Text style={colldetailstyles.menuText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </commonStyles.Bg>
  );
};

export default CollectionDetails;