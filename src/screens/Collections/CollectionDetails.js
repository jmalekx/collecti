import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { collection, doc, getDocs, getDoc, deleteDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../FirebaseConfig';
import { getAuth } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; 

const CollectionDetails = ({ route, navigation }) => {
  const { collectionId } = route.params; // Get the collectionId from route params
  const [posts, setPosts] = useState([]);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [selectedPost, setSelectedPost] = useState(null); // Track the selected post for actions
  const [isMenuVisible, setIsMenuVisible] = useState(false); // Control menu visibility
  const [numColumns, setNumColumns] = useState(2); // Set the initial number of columns

  // Get the current user ID
  const userId = getAuth().currentUser?.uid;

  // Fetch collection details and posts
  const fetchData = async () => {
    if (userId && collectionId) {
      await fetchCollectionDetails();
      await fetchPosts();
    }
  }
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
      // Render Instagram posts as WebView embeds
      return (
        <WebView
          source={{ uri: `https://www.instagram.com/p/${post.thumbnail.split('/')[4]}/embed` }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      );
    } else {
      // Render other posts as images
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
            {/* Edit Button */}
            <TouchableOpacity onPress={() => navigation.navigate('EditCollection', { collectionId })}>
              <MaterialIcons name="edit" size={24} color="#000" style={styles.icon} />
            </TouchableOpacity>
            {/* Delete Button */}
            {collectionName !== "Unsorted" && (
              <TouchableOpacity onPress={deleteCollection}>
                <MaterialIcons name="delete" size={24} color="red" style={styles.icon} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.headerBottom}>
          <Text style={styles.collectionDescription}>{collectionDescription}</Text>
          <Text style={styles.postCount}>{posts.length} posts</Text>
        </View>
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        numColumns={numColumns} // Use the state to dynamically control columns
        key={numColumns} // Force a re-render when numColumns changes
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            {/* 3-Dots Button */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => openMenu(item)}
            >
              <MaterialIcons name="more-vert" size={24} color="#000" />
            </TouchableOpacity>

            {/* Post Content */}
            {renderPostContent(item)}
            <Text style={styles.postTitle}>{item.notes}</Text>
          </View>
        )}
      />

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
});

export default CollectionDetails;