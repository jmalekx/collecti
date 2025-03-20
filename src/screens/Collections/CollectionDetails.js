import React, { useState, useEffect } from 'react';
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
import { WebView } from 'react-native-webview';
import { collection, doc, getDocs, getDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../FirebaseConfig';
import { getAuth } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import InstagramEmbed from '../../components/InstagramEmbed';
import TikTokEmbed from '../../components/TiktokEmbed';
import commonStyles from '../../commonStyles';
import { AppText, AppHeading, AppButton, AppTextInput } from '../../components/Typography';
import { Picker } from '@react-native-picker/picker';
import { showToast, TOAST_TYPES } from '../../components/Toasts';
import { useToast } from 'react-native-toast-notifications';

const CollectionDetails = ({ route, navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { collectionId } = route.params; // Get the collectionId from route params
  const [posts, setPosts] = useState([]);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [selectedPost, setSelectedPost] = useState(null); // Track the selected post for actions
  const [isMenuVisible, setIsMenuVisible] = useState(false); // Control menu visibility
  const [numColumns, setNumColumns] = useState(2); // Set the initial number of columns
  
  // Group selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [isGroupActionModalVisible, setIsGroupActionModalVisible] = useState(false);
  const [selectedTargetCollection, setSelectedTargetCollection] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isAddingNewCollection, setIsAddingNewCollection] = useState(false);
  const [collections, setCollections] = useState([]);
  
  // Get the current user ID
  const userId = getAuth().currentUser?.uid;
  const toast = useToast();

  // Fetch collection details and posts
  const fetchData = async () => {
    if (userId && collectionId) {
      await fetchCollectionDetails();
      await fetchPosts();
      await fetchAllCollections();
    }
  }

  // Add the filtering logic before the return statement
  const filteredPosts = posts.filter((post) =>
    post.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Fetch collection details (name and description)
  const fetchCollectionDetails = async () => {
    try {
      const collectionRef = doc(FIREBASE_DB, 'users', userId, 'collections', collectionId);
      const collectionDoc = await getDoc(collectionRef);
      if (collectionDoc.exists()) {
        setCollectionName(collectionDoc.data().name);
        setCollectionDescription(collectionDoc.data().description || 'No description available');
      } else {
        console.error('Collection not found');
      }
    } catch (error) {
      console.error('Error fetching collection details: ', error);
    }
  };

  // Fetch all collections for the move operation
  const fetchAllCollections = async () => {
    try {
      const collectionsRef = collection(FIREBASE_DB, 'users', userId, 'collections');
      const querySnapshot = await getDocs(collectionsRef);
      const collectionsData = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        // Filter out the current collection
        .filter(coll => coll.id !== collectionId);
      setCollections(collectionsData);
    } catch (error) {
      console.error('Error fetching collections: ', error);
    }
  };

  // Fetch posts for the selected collection
  const fetchPosts = async () => {
    try {
      const postsRef = collection(FIREBASE_DB, 'users', userId, 'collections', collectionId, 'posts');
      const querySnapshot = await getDocs(postsRef);
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts: ', error);
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
                deleteDoc(doc(FIREBASE_DB, 'users', userId, 'collections', collectionId, 'posts', postId))
              );
              
              await Promise.all(deletePromises);
              showToast(toast, `${selectedPosts.length} posts deleted successfully`, { type: TOAST_TYPES.SUCCESS });
              
              // Refresh posts and exit selection mode
              fetchPosts();
              setIsSelectionMode(false);
              setSelectedPosts([]);
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
      // Create new collection
      const newCollectionRef = doc(collection(FIREBASE_DB, 'users', userId, 'collections'));
      await setDoc(newCollectionRef, {
        name: newCollectionName,
        description: '',
        createdAt: new Date().toISOString(),
        thumbnail: '',
      });

      // Move posts to the new collection
      await movePostsToCollection(newCollectionRef.id);
      
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
              const collectionRef = doc(FIREBASE_DB, 'users', userId, 'collections', collectionId);
              await deleteDoc(collectionRef);
              navigation.goBack(); // Navigate back after deletion
            } catch (error) {
              console.error('Error deleting collection: ', error);
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
              const postRef = doc(FIREBASE_DB, 'users', userId, 'collections', collectionId, 'posts', postId);
              await deleteDoc(postRef);
              fetchPosts(); // Refresh the posts list
              setIsMenuVisible(false); // Close the menu
            } catch (error) {
              console.error('Error deleting post: ', error);
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
                  <MaterialIcons name="close" size={24} color="#000" style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.selectionCount}>{selectedPosts.length} selected</Text>
                <TouchableOpacity onPress={handleGroupMove} style={styles.selectionButton}>
                  <MaterialIcons name="drive-file-move" size={24} color="#0066cc" style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleGroupDelete} style={styles.selectionButton}>
                  <MaterialIcons name="delete" size={24} color="#FF3B30" style={styles.icon} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={toggleSelectionMode} style={styles.selectionButton}>
                  <MaterialIcons name="select-all" size={24} color="#000" style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('EditCollection', { collectionId })}>
                  <MaterialIcons name="edit" size={24} color="#000" style={styles.icon} />
                </TouchableOpacity>
                {collectionName !== "Unsorted" && (
                  <TouchableOpacity onPress={deleteCollection}>
                    <MaterialIcons name="delete" size={24} color="red" style={styles.icon} />
                  </TouchableOpacity>
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
      <TextInput
        style={styles.searchInput}
        placeholder="Search posts..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

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
                <MaterialIcons 
                  name={selectedPosts.includes(item.id) ? "check-box" : "check-box-outline-blank"} 
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
            <Text style={styles.modalTitle}>Move {selectedPosts.length} Posts</Text>
            
            {!isAddingNewCollection ? (
              <>
                <Text style={styles.modalLabel}>Select Target Collection:</Text>
                {collections.length > 0 ? (
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
                ) : (
                  <View style={styles.noCollectionsContainer}>
                    <Text style={styles.noCollectionsText}>No other collections available</Text>
                  </View>
                )}
                
                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.cancelButton]} 
                    onPress={() => setIsGroupActionModalVisible(false)}
                  >
                    <Text style={styles.actionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  {collections.length > 0 && (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.confirmButton]} 
                      onPress={handleMoveToExistingCollection}
                    >
                      <Text style={styles.actionButtonText}>Move</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalLabel}>New Collection Name:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Collection Name"
                  value={newCollectionName}
                  onChangeText={setNewCollectionName}
                />
                
                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.cancelButton]} 
                    onPress={() => {
                      setIsAddingNewCollection(false);
                      setNewCollectionName('');
                    }}
                  >
                    <Text style={styles.actionButtonText}>Back</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.confirmButton]} 
                    onPress={handleCreateCollectionAndMove}
                  >
                    <Text style={styles.actionButtonText}>Create & Move</Text>
                  </TouchableOpacity>
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
    marginLeft: 16, // Add spacing between icons
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
    position: 'relative', // For positioning the 3-dots button
    width: '48%', // Adjust width for 2 columns
    margin: '1%', // To create spacing between items
  },
  selectedPostCard: {
    backgroundColor: '#e6f2ff', // Light blue background for selected posts
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  menuButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1, // Ensure the button is above other content
  },
  thumbnail: {
    width: '100%',
    height: 150, // Adjust height for 4:3 aspect ratio
    borderRadius: 8,
    marginBottom: 8,
  },
  webview: {
    width: '100%',
    height: 150, // Adjust height for 4:3 aspect ratio
    borderRadius: 8,
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postDescription: {
    fontSize: 14,
    color: '#555',
    marginVertical: 8,
  },
  postTags: {
    fontSize: 12,
    color: '#888',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    fontSize: 16,
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
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    height: 150,
  },
  fallbackText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  picker: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
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
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
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
});

export default CollectionDetails;