import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Linking, 
  ActivityIndicator, 
  Image // Import Image from React Native
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../FirebaseConfig';
import { getAuth } from 'firebase/auth';
import { useToast } from 'react-native-toast-notifications';

const PostDetails = ({ route, navigation }) => {
  const { collectionId, postId } = route.params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = getAuth().currentUser?.uid;
  const toast = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(FIREBASE_DB, 'users', userId, 'collections', collectionId, 'posts', postId);
        const postDoc = await getDoc(postRef);
        
        if (postDoc.exists()) {
          setPost({ id: postDoc.id, ...postDoc.data() });
        } else {
          toast.show("Post not found", { type: "danger" });
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        toast.show("Failed to load post", { type: "danger" });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [collectionId, postId]);

  const handlePlatformLink = () => {
    if (post?.platform === 'instagram' && post?.image) {
      Linking.openURL(post.image);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditPost', { collectionId, postId })}
        >
          <MaterialIcons name="edit" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Display image if it exists */}
      {post?.image && (
        <Image source={{ uri: post.image }} style={styles.thumbnail} />
      )}

      <Text style={styles.notes}>{post?.notes}</Text>

      <View style={styles.tagsContainer}>
        {post?.tags?.map((tag, index) => (
          <Text key={index} style={styles.tag}>
            #{tag}
          </Text>
        ))}
      </View>

      {post?.platform && (
        <TouchableOpacity style={styles.platformButton} onPress={handlePlatformLink}>
          <Text style={styles.platformButtonText}>
            View on {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  thumbnail: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  notes: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 16,
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    color: '#666',
  },
  platformButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  platformButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PostDetails;
