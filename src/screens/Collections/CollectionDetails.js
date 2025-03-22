import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';
import { Picker } from '@react-native-picker/picker';

// Components
import InstagramEmbed from '../../components/InstagramEmbed';
import TikTokEmbed from '../../components/TiktokEmbed';
import { AppText, AppHeading, AppButton, AppTextInput } from '../../components/Typography';
import { showToast, TOAST_TYPES } from '../../components/Toasts';

// Services
import { 
  getCollection, 
  getAllCollections, 
  updateCollection, 
  deleteCollection as deleteCollectionService,
  createCollection 
} from '../../services/collections';
import { 
  getCollectionPosts, 
  deletePost as deletePostService,
  updateCollectionThumbnail 
} from '../../services/posts';

// Firebase helpers
import { getCurrentUserId } from '../../services/firebase';
import { FIREBASE_DB } from '../../../FirebaseConfig';
import { collection, doc, getDoc, deleteDoc, setDoc } from 'firebase/firestore';

// Constants
import { DEFAULT_THUMBNAIL } from '../../constants';
import commonStyles from '../../commonStyles';

const CollectionDetails = ({ route, navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { collectionId, ownerId, isExternalCollection } = route.params;
  const [posts, setPosts] = useState([]);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [numColumns, setNumColumns] = useState(2);
  
  // Group selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [isGroupActionModalVisible, setIsGroupActionModalVisible] = useState(false);
  const [selectedTargetCollection, setSelectedTargetCollection] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isAddingNewCollection, setIsAddingNewCollection] = useState(false);
  const [collections, setCollections] = useState([]);
  
  // Get the current user ID
  const currentUserId = getCurrentUserId();
  // Use the owner ID if viewing an external collection, otherwise use current user ID
  const effectiveUserId = isExternalCollection ? ownerId : currentUserId;
  const userId = currentUserId; // Use for operations on the user's own collections
  const toast = useToast();
  const canEditCollection = !isExternalCollection && collectionName !== "Unsorted";

  // Fetch collection details and posts
  const fetchData = async () => {
    if (userId && collectionId) {
      await fetchCollectionDetails();
      await fetchPosts();
      await fetchAllCollections();
    }
  }

  // Filter posts based on search query
  const filteredPosts = posts.filter((post) =>
    post.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Fetch collection details using collection service
  const fetchCollectionDetails = async () => {
    try {
      const collectionData = await getCollection(collectionId, effectiveUserId);
      if (collectionData) {
        setCollectionName(collectionData.name);
        setCollectionDescription(collectionData.description || 'No description available');
      } else {
        console.error('Collection not found');
      }
    } catch (error) {
      console.error('Error fetching collection details: ', error);
      showToast(toast, "Error fetching collection details", { type: TOAST_TYPES.DANGER });
    }
  };

  // Fetch all collections for move operation using collections service
  const fetchAllCollections = async () => {
    try {
      const collectionsData = await getAllCollections();
      // Filter out the current collection
      const filteredCollections = collectionsData.filter(coll => coll.id !== collectionId);
      setCollections(filteredCollections);
    } catch (error) {
      console.error('Error fetching collections: ', error);
      showToast(toast, "Error fetching collections", { type: TOAST_TYPES.DANGER });
    }
  };

  // Fetch posts using posts service
  const fetchPosts = async () => {
    try {
      const postsData = await getCollectionPosts(collectionId, effectiveUserId);
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts: ', error);
      showToast(toast, "Error fetching posts", { type: TOAST_TYPES.DANGER });
    }
  };

  // Refetch data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [collectionId, userId])
  );

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedPosts([]);
  };

  // Toggle post selection
  const togglePostSelection = (postId) => {
    setSelectedPosts(prevSelected => {
      if (prevSelected.includes(postId)) {
        return prevSelected.filter(id => id !== postId);
      } else {
        return [...prevSelected, postId];
      }
    });
  };

  // Handle group move action
  const handleGroupMove = () => {
    if (selectedPosts.length === 0) {
      showToast(toast, "No posts selected", { type: TOAST_TYPES.WARNING });
      return;
    }
    
    // Set the first collection as default if available
    if (collections.length > 0 && !selectedTargetCollection) {
      setSelectedTargetCollection(collections[0].id);
    }
    
    setIsGroupActionModalVisible(true);
  };

  // Handle group delete action
  const handleGroupDelete = () => {
    if (selectedPosts.length === 0) {
      showToast(toast, "No posts selected", { type: TOAST_TYPES.WARNING });
      return;
    }

    Alert.alert(
      'Delete Selected Posts',
      `Are you sure you want to delete ${selectedPosts.length} selected posts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const deletePromises = selectedPosts.map(postId => 
                deletePostService(collectionId, postId)
              );
              
              await Promise.all(deletePromises);
              showToast(toast, `${selectedPosts.length} posts deleted successfully`, { type: TOAST_TYPES.SUCCESS });
              
              // Refresh posts and exit selection mode
              fetchPosts();
              setIsSelectionMode(false);
              setSelectedPosts([]);
              
              // Update collection thumbnail
              await updateCollectionThumbnail(collectionId);
            } catch (error) {
              console.error('Error deleting posts: ', error);
              showToast(toast, "Failed to delete posts", { type: TOAST_TYPES.DANGER });
            }
          },
        },
      ]
    );
  };

  // Create new collection and move posts there
  const handleCreateCollectionAndMove = async () => {
    if (!newCollectionName.trim()) {
      showToast(toast, "Collection name cannot be empty", { type: TOAST_TYPES.WARNING });
      return;
    }

    try {
      // Create new collection using service
      const newCollectionData = {
        name: newCollectionName.trim(),
        description: ''
      };
      
      const newCollection = await createCollection(newCollectionData);

      // Move posts to the new collection
      await movePostsToCollection(newCollection.id);
      
      showToast(toast, `Posts moved to new collection: ${newCollectionName}`, { type: TOAST_TYPES.SUCCESS });
      setNewCollectionName('');
      setIsAddingNewCollection(false);
      setIsGroupActionModalVisible(false);
      setIsSelectionMode(false);
      setSelectedPosts([]);
      fetchPosts();
    } catch (error) {
      console.error('Error creating collection and moving posts: ', error);
      showToast(toast, "Failed to move posts", { type: TOAST_TYPES.DANGER });
    }
  };

  // Move posts to selected collection
  const movePostsToCollection = async (targetCollectionId) => {
    try {
      const movePromises = selectedPosts.map(async (postId) => {
        // Get the post data
        const postRef = doc(FIREBASE_DB, 'users', userId, 'collections', collectionId, 'posts', postId);
        const postDoc = await getDoc(postRef);
        
        if (postDoc.exists()) {
          const postData = postDoc.data();
          
          // Add post to target collection
          const newPostRef = doc(collection(FIREBASE_DB, 'users', userId, 'collections', targetCollectionId, 'posts'));
          await setDoc(newPostRef, postData);
          
          // Delete post from current collection
          await deleteDoc(postRef);
        }
      });
      
      await Promise.all(movePromises);
      
      // Update both collections' thumbnails
      await updateCollectionThumbnail(collectionId);
      await updateCollectionThumbnail(targetCollectionId);
      
      return true;
    } catch (error) {
      console.error('Error moving posts: ', error);
      throw error;
    }
  };

  // Handle move to existing collection
  const handleMoveToExistingCollection = async () => {
    if (!selectedTargetCollection) {
      showToast(toast, "Please select a target collection", { type: TOAST_TYPES.WARNING });
      return;
    }

    try {
      await movePostsToCollection(selectedTargetCollection);
      showToast(toast, `${selectedPosts.length} posts moved successfully`, { type: TOAST_TYPES.SUCCESS });
      setIsGroupActionModalVisible(false);
      setIsSelectionMode(false);
      setSelectedPosts([]);
      fetchPosts();
    } catch (error) {
      showToast(toast, "Failed to move posts", { type: TOAST_TYPES.DANGER });
    }
  };

  // Delete collection with confirmation
  const deleteCollection = async () => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Use the service to delete the collection
              await deleteCollectionService(collectionId);
              navigation.goBack(); // Navigate back after deletion
            } catch (error) {
              console.error('Error deleting collection: ', error);
              showToast(toast, "Failed to delete collection", { type: TOAST_TYPES.DANGER });
            }
          },
        },
      ]
    );
  };

  // Delete post with confirmation
  const deletePost = async (postId) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Use the service to delete the post
              await deletePostService(collectionId, postId);
              fetchPosts(); // Refresh the posts list
              setIsMenuVisible(false); // Close the menu
            } catch (error) {
              console.error('Error deleting post: ', error);
              showToast(toast, "Failed to delete post", { type: TOAST_TYPES.DANGER });
            }
          },
        },
      ]
    );
  };

  // Open the menu for a specific post
  const openMenu = (post) => {
    setSelectedPost(post);
    setIsMenuVisible(true);
  };

  // Close the menu
  const closeMenu = () => {
    setSelectedPost(null);
    setIsMenuVisible(false);
  };

  // Render post content based on the platform
  const renderPostContent = (post) => {
    if (post.thumbnail.includes('instagram.com')) {
      return <InstagramEmbed url={post.thumbnail} scale={0.42}/>;
    } else if (post.thumbnail.includes('tiktok.com')) {
      return <TikTokEmbed url={post.thumbnail} scale={0.4} />;
    } else {
      return (
        <Image
          source={{ uri: post.thumbnail }}
          style={styles.thumbnail}
          onError={(e) => console.log('Failed to load thumbnail:', e.nativeEvent.error)}
        />
      );
    }
  };
  return (
    <View style={styles.container}>
      {/* Collection Header */}
      <View style={styles.header}>
      <View style={styles.headerTop}>
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
                <TouchableOpacity onPress={deleteCollection} style={styles.selectionButton}>
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
      <View style={commonStyles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" style={commonStyles.searchIcon} />
        <TextInput
          style={commonStyles.searchInput}
          placeholder="Search posts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Posts List */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={numColumns}
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
                togglePostSelection(item.id);
              } else {
                navigation.navigate('PostDetails', {
                  postId: item.id,
                  collectionId: collectionId
                });
              }
            }}
            onLongPress={() => {
              if (!isSelectionMode) {
                setIsSelectionMode(true);
                setSelectedPosts([item.id]);
              }
            }}
          >
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
            {renderPostContent(item)}
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
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 24,
    fontWeight: 'bold',
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
});

export default CollectionDetails;