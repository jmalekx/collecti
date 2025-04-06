//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Modal } from 'react-native';

//Third-party library external imports
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';
import { Picker } from '@react-native-picker/picker';

//Project services and utilities

import { useCollectionDetails } from '../../hooks/useCollectionDetails';
import { useSelectionMode } from '../../hooks/useSelectionMode';
import { usePagination } from '../../hooks/usePagination';

//Custom component imports and styling
import { showToast, TOAST_TYPES } from '../../components/utilities/Toasts';
import { AppHeading, AppButton, AppTextInput } from '../../components/utilities/Typography';
import commonStyles from '../../styles/commonStyles';
import ConfirmationModal from '../../components/utilities/ConfirmationModal';
import RenderThumbnail from '../../components/utilities/RenderThumbnail';
import LoadingIndicator from '../../components/utilities/LoadingIndicator';
import SearchBar from '../../components/utilities/SearchBar';

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


  //State trabnsitions
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
      return <Ionicons name="logo-instagram" size={20} color="#E1306C" />;
    }
    else if (post.thumbnail.includes('tiktok.com')) {
      return <Ionicons name="logo-tiktok" size={20} color="#000000" />;
    }
    else if (post.thumbnail.includes('youtube.com') || post.thumbnail.includes('youtu.be')) {
      return <Ionicons name="logo-youtube" size={20} color="#FF0000" />;
    }
    else if (post.platform === 'pinterest' || post.thumbnail.includes('pinterest.com') || post.thumbnail.includes('pin.it')) {
      return <Ionicons name="logo-pinterest" size={20} color="#E60023" />;
    }
    else {
      return <Ionicons name="images-outline" size={20} color="#4CAF50" />;
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
        containerStyle={styles.postContentContainer}
        thumbnailStyle={styles.thumbnail}
        scale={0.42}
      />
    );
  };

  return (
    <commonStyles.Bg>
      <View style={styles.container}>
        {/* Collection Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.collectionName}>{collectionName}</Text>
            <View style={styles.headerIcons}>
              {isSelectionMode ? (
                <>
                  <TouchableOpacity onPress={toggleSelectionMode} style={styles.selectionButton}>
                    <Ionicons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                  <Text style={styles.selectionCount}>{selectedPosts.length} selected</Text>
                  <TouchableOpacity
                    onPress={handleGroupMove}
                    style={[styles.selectionButton, isExternalCollection && styles.disabledIcon]}
                    disabled={isExternalCollection}
                  >
                    <Ionicons name="move" size={22} color={isExternalCollection ? "#ccc" : "#0066cc"} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleGroupDelete}
                    style={[styles.selectionButton, isExternalCollection && styles.disabledIcon]}
                    disabled={isExternalCollection}
                  >
                    <Ionicons name="trash" size={22} color={isExternalCollection ? "#ccc" : "#FF3B30"} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={toggleSelectionMode}
                    style={[styles.selectionButton, isExternalCollection && styles.disabledIcon]}
                    disabled={isExternalCollection}
                  >
                    <Ionicons name="checkmark-circle-outline" size={24} color={isExternalCollection ? "#ccc" : "#000"} />
                  </TouchableOpacity>
                  {canEditCollection ? (
                    <>
                      <TouchableOpacity onPress={() => navigation.navigate('EditCollection', { collectionId })} style={styles.selectionButton}>
                        <Ionicons name="create-outline" size={24} color="#000" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setShowDeleteCollectionModal(true)} style={styles.selectionButton}>
                        <Ionicons name="trash" size={24} color="red" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity disabled={true} style={[styles.selectionButton, styles.disabledIcon]}>
                        <Ionicons name="create-outline" size={24} color="#ccc" />
                      </TouchableOpacity>
                      <TouchableOpacity disabled={true} style={[styles.selectionButton, styles.disabledIcon]}>
                        <Ionicons name="trash" size={24} color="#ccc" />
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </View>
          </View>
          <View style={styles.headerBottom}>
            <Text style={styles.collectionDescription}>{collectionDescription}</Text>
            <Text style={styles.postCount}>{posts.length} posts</Text>
          </View>
        </View>

        {/* Add Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search collections..."
        />

        {/* Posts List */}
        <FlatList
          data={paginatedPosts}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          key={numColumns}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="post-add" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                This collection is empty! Start adding posts to keep things organized.
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.postCard,
                isSelectionMode && selectedPosts.includes(item.id) && styles.selectedPostCard
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
              <View style={styles.platformIconContainer}>
                {getPlatformIcon(item)}
              </View>

              {isSelectionMode && (
                <View style={styles.checkboxContainer}>
                  <Ionicons
                    name={selectedPosts.includes(item.id) ? "checkmark-circle" : "ellipse-outline"}
                    size={24}
                    color={selectedPosts.includes(item.id) ? "#007AFF" : "#999"}
                  />
                </View>
              )}

              {/* Post Content */}
              {renderThumbnail(item)}
              <Text style={styles.postTitle}>{item.notes}</Text>

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
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <AppHeading style={styles.modalTitle}>Move {selectedPosts.length} Posts</AppHeading>
                <TouchableOpacity onPress={() => setIsGroupActionModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              {!isAddingNewCollection ? (
                <>
                  <Text style={styles.modalLabel}>Select Target Collection:</Text>
                  {collections.length > 0 ? (
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={selectedTargetCollection}
                        onValueChange={(itemValue) => {
                          if (itemValue === 'new') {
                            setIsAddingNewCollection(true);
                          } else {
                            setSelectedTargetCollection(itemValue);
                          }
                        }}
                        style={styles.picker}
                      >
                        {collections.map((collection) => (
                          <Picker.Item key={collection.id} label={collection.name} value={collection.id} />
                        ))}
                        <Picker.Item label="+ Create New Collection" value="new" />
                      </Picker>
                    </View>
                  ) : (
                    <View style={styles.noCollectionsContainer}>
                      <Text style={styles.noCollectionsText}>No other collections available</Text>
                    </View>
                  )}

                  <View style={styles.buttonRow}>
                    <AppButton
                      style={[styles.actionButton, styles.cancelButton]}
                      title="Cancel"
                      onPress={() => setIsGroupActionModalVisible(false)}
                      textStyle={styles.buttonText}
                    />

                    {collections.length > 0 && (
                      <AppButton
                        style={[styles.actionButton, styles.confirmButton]}
                        title="Move"
                        onPress={handleMoveToExistingCollection}
                        textStyle={styles.buttonTextWhite}
                      />
                    )}
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.modalLabel}>New Collection Name:</Text>
                  <AppTextInput
                    style={styles.input}
                    placeholder="Enter Collection Name"
                    value={newCollectionName}
                    onChangeText={setNewCollectionName}
                  />

                  <View style={styles.buttonRow}>
                    <AppButton
                      style={[styles.actionButton, styles.cancelButton]}
                      title="Back"
                      onPress={() => {
                        setIsAddingNewCollection(false);
                        setNewCollectionName('');
                      }}
                      textStyle={styles.buttonText}
                    />

                    <AppButton
                      style={[styles.actionButton, styles.confirmButton]}
                      title="Create & Move"
                      onPress={handleCreateCollectionAndMove}
                      textStyle={styles.buttonTextWhite}
                    />
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
          <View style={styles.menuModal}>
            <View style={styles.menuContent}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  navigation.navigate('EditPost', { collectionId, postId: selectedPost.id });
                  closeMenu();
                }}
              >
                <Text style={styles.menuText}>Edit Post</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => deletePost(selectedPost.id)}
              >
                <Text style={[styles.menuText, { color: 'red' }]}>Delete Post</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={closeMenu}>
                <Text style={styles.menuText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </commonStyles.Bg>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  header: {
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 16,
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  collectionName: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    marginHorizontal: 8,
  },
  collectionDescription: {
    fontSize: 16,
    color: '#555',
    flex: 1,
    marginRight: 16,
  },
  postCount: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  postCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    width: '48%',
    margin: '1%',
  },

  backButton: {
    padding: 8,
    marginRight: 8,
  },
  selectedPostCard: {
    backgroundColor: '#e6f2ff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  menuButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  thumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  webview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  menuItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  menuText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  selectionButton: {
    padding: 8,
  },
  selectionCount: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  buttonTextWhite: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  noCollectionsContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  noCollectionsText: {
    fontSize: 16,
    color: '#666',
  },
  disabledIcon: {
    opacity: 0.4,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  icon: {
    marginLeft: 16,
  },
  iconCompact: {
    marginLeft: 8,
  },
  selectionButton: {
    padding: 6,
  },
  platformIconContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
});

export default CollectionDetails;