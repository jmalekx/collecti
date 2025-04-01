import { useState, useCallback, useEffect } from 'react';
import { useToast } from 'react-native-toast-notifications';
import { doc, getDoc, deleteDoc, setDoc, collection } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { showToast, TOAST_TYPES } from '../components/Toasts';
import {
  getCollection,
  getAllCollections,
  deleteCollection as deleteCollectionService,
  createCollection
} from '../services/collections';
import {
  getCollectionPosts,
  deletePost as deletePostService,
  updateCollectionThumbnail,
  subscribeToPosts
} from '../services/posts';

/**
 * Custom hook for managing collection details and operations
 */
export const useCollectionDetails = (collectionId, ownerId, isExternalCollection) => {
  // State
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
// Get the current user ID directly
const currentUserId = FIREBASE_AUTH.currentUser?.uid;

  // Use the owner ID if viewing an external collection, otherwise use current user ID
  const effectiveUserId = isExternalCollection ? ownerId : currentUserId;
  const toast = useToast();
  const canEditCollection = !isExternalCollection && collectionName !== "Unsorted";
  
  // Fetch collection details
  const fetchCollectionDetails = useCallback(async () => {
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
  }, [collectionId, effectiveUserId, toast]);

  // Fetch all collections for move operation
  const fetchAllCollections = useCallback(async () => {
    try {
      const collectionsData = await getAllCollections();
      // Filter out the current collection
      const filteredCollections = collectionsData.filter(coll => coll.id !== collectionId);
      setCollections(filteredCollections);
    } catch (error) {
      console.error('Error fetching collections: ', error);
      showToast(toast, "Error fetching collections", { type: TOAST_TYPES.DANGER });
    }
  }, [collectionId, toast]);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    try {
      const postsData = await getCollectionPosts(collectionId, effectiveUserId);
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts: ', error);
      showToast(toast, "Error fetching posts", { type: TOAST_TYPES.DANGER });
    }
  }, [collectionId, effectiveUserId, toast]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    if (currentUserId && collectionId) {
      await fetchCollectionDetails();
      await fetchPosts();
      await fetchAllCollections();
    }
    setLoading(false);
  }, [currentUserId, collectionId, fetchCollectionDetails, fetchPosts, fetchAllCollections]);

  const deleteCollection = useCallback(async () => {
    try {
      // Make sure to pass currentUserId to the service
      await deleteCollectionService(collectionId, currentUserId);
      showToast(toast, "Collection deleted successfully", { type: TOAST_TYPES.INFO });
      return true;
    } catch (error) {
      console.error('Error deleting collection: ', error);
      showToast(toast, "Failed to delete collection", { type: TOAST_TYPES.DANGER });
      return false;
    }
  }, [collectionId, currentUserId, toast]);

  // Delete post
  const deletePost = useCallback(async (postId) => {
    try {
      await deletePostService(collectionId, postId);
      await fetchPosts();
      return true;
    } catch (error) {
      console.error('Error deleting post: ', error);
      showToast(toast, "Failed to delete post", { type: TOAST_TYPES.DANGER });
      return false;
    }
  }, [collectionId, fetchPosts, toast]);

  // Delete multiple posts
  const deleteMultiplePosts = useCallback(async (postIds) => {
    try {
      const batchPromises = postIds.map(postId =>
        deletePostService(collectionId, postId)
      );
      await Promise.all(batchPromises);
      await fetchPosts();
      showToast(toast, `${postIds.length} posts deleted`, { type: TOAST_TYPES.SUCCESS });
      return true;
    } catch (error) {
      console.error('Error deleting posts: ', error);
      showToast(toast, "Failed to delete posts", { type: TOAST_TYPES.DANGER });
      return false;
    }
  }, [collectionId, fetchPosts, toast]);

  // Move posts to another collection
  const movePostsToCollection = useCallback(async (postIds, targetCollectionId) => {
    try {
      const movePromises = postIds.map(async (postId) => {
        // Get the post data
        const postRef = doc(FIREBASE_DB, 'users', currentUserId, 'collections', collectionId, 'posts', postId);
        const postDoc = await getDoc(postRef);

        if (postDoc.exists()) {
          const postData = postDoc.data();

          // Add post to target collection
          const newPostRef = doc(collection(FIREBASE_DB, 'users', currentUserId, 'collections', targetCollectionId, 'posts'));
          await setDoc(newPostRef, postData);

          // Delete post from current collection
          await deleteDoc(postRef);
        }
      });

      await Promise.all(movePromises);

      // Update both collections' thumbnails
      await updateCollectionThumbnail(collectionId);
      await updateCollectionThumbnail(targetCollectionId);

      await fetchPosts();
      showToast(toast, `${postIds.length} posts moved successfully`, { type: TOAST_TYPES.SUCCESS });
      return true;
    } catch (error) {
      console.error('Error moving posts: ', error);
      showToast(toast, "Failed to move posts", { type: TOAST_TYPES.DANGER });
      return false;
    }
  }, [collectionId, currentUserId, fetchPosts, toast]);

  // Create new collection and move posts
  const createCollectionAndMovePosts = useCallback(async (postIds, newCollectionName) => {
    try {
      // Create new collection
      const newCollectionData = {
        name: newCollectionName.trim(),
        description: ''
      };

      const newCollection = await createCollection(newCollectionData);

      // Move posts to the new collection
      await movePostsToCollection(postIds, newCollection.id);
      
      showToast(toast, `Posts moved to new collection: ${newCollectionName}`, { type: TOAST_TYPES.SUCCESS });
      return true;
    } catch (error) {
      console.error('Error creating collection and moving posts: ', error);
      showToast(toast, "Failed to move posts", { type: TOAST_TYPES.DANGER });
      return false;
    }
  }, [movePostsToCollection, toast]);

  // Filter posts based on search query
  useEffect(() => {
    if (posts.length > 0) {
      const filtered = posts.filter(post =>
        post.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts([]);
    }
  }, [posts, searchQuery]);

  // Set up real-time listener for posts
  const setupPostsListener = useCallback(() => {
    if (collectionId && effectiveUserId) {
      return subscribeToPosts(collectionId, (updatedPosts) => {
        setPosts(updatedPosts);
      }, effectiveUserId);
    }
    return () => {};
  }, [collectionId, effectiveUserId]);

  return {
    // State
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
    
    // Functions
    fetchData,
    deleteCollection,
    deletePost,
    deleteMultiplePosts,
    movePostsToCollection,
    createCollectionAndMovePosts,
    setupPostsListener
  };
};