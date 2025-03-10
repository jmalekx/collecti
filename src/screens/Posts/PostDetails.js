import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
    ActivityIndicator,
    Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { doc, getDoc, deleteDoc, getDocs, collection, updateDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../FirebaseConfig';
import { getAuth } from 'firebase/auth';
import { useToast } from 'react-native-toast-notifications';
import { useFocusEffect } from '@react-navigation/native';
import { Alert } from 'react-native';
import { DEFAULT_THUMBNAIL } from '../../constants';
import InstagramEmbed from '../../components/InstagramEmbed';
import TikTokEmbed from '../../components/TiktokEmbed';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const formatPlatform = (platform) => {
    if (!platform) return 'Gallery';
    return platform.charAt(0).toUpperCase() + platform.slice(1);
};

const PostDetails = ({ route, navigation }) => {
    const { collectionId, postId } = route.params;
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const userId = getAuth().currentUser?.uid;
    const toast = useToast();

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

    const handleDelete = async () => {
        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this post? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Delete the post
                            const postRef = doc(
                                FIREBASE_DB,
                                'users',
                                userId,
                                'collections',
                                collectionId,
                                'posts',
                                postId
                            );
                            await deleteDoc(postRef);

                            // Get all remaining posts in the collection
                            const postsRef = collection(
                                FIREBASE_DB,
                                'users',
                                userId,
                                'collections',
                                collectionId,
                                'posts'
                            );
                            const postsSnapshot = await getDocs(postsRef);
                            const posts = postsSnapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            }));

                            // Sort posts by date to get the most recent one
                            const sortedPosts = posts.sort((a, b) =>
                                new Date(b.createdAt) - new Date(a.createdAt)
                            );

                            // Update collection with new thumbnail
                            const collectionRef = doc(
                                FIREBASE_DB,
                                'users',
                                userId,
                                'collections',
                                collectionId
                            );

                            // Update the collection document with new thumbnail and post count
                            await updateDoc(collectionRef, {
                                thumbnail: sortedPosts[0]?.thumbnail || DEFAULT_THUMBNAIL,
                                lastUpdated: new Date().toISOString() // Add this to trigger collection update
                            });

                            toast.show("Post deleted successfully", { type: "success" });
                            navigation.goBack();
                        } catch (error) {
                            console.error('Error deleting post:', error);
                            toast.show("Failed to delete post", { type: "error" });
                        }
                    }
                }
            ]
        );
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchPost();
        }, [collectionId, postId])
    );

    const handlePlatformLink = () => {
        if (post?.platform === 'instagram' && post?.image) {
            Linking.openURL(post.image);
        } else if (post?.platform === 'tiktok' && post?.image) {
            const tiktokUrl = post.image.split('?')[0]; // Remove any query parameters
            Linking.openURL(tiktokUrl);
        }
    };

    const renderPostContent = () => {
        if (post.platform === 'instagram' && post.image.includes('instagram.com')) {
            return (
              <View>
                <InstagramEmbed url={post.image} style={styles.thumbnail} scale={0.1}/>
              </View>
            );
          }
      
          if (post.platform === 'tiktok' && post.image.includes('tiktok.com')) {
            return (
              <View style={styles.embedContainer}>
                <TikTokEmbed url={post.image} style={styles.thumbnail} scale={0.64} />
              </View>
            );
          }

        if (post.platform === 'pinterest') {
        return (
            <View>
            <Image 
                source={{ uri: post.image }} 
                style={styles.thumbnail}
            />
            <TouchableOpacity onPress={() => Linking.openURL(post.image)}>
                <Text style={styles.linkText}>Open in Pinterest</Text>
            </TouchableOpacity>
            </View>
            );
        }
      
          return (
            <Image 
              source={{ uri: post.image }} 
              style={styles.thumbnail}
              resizeMode="contain"
            />
          );
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
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('EditPost', { collectionId, postId })}
                        style={styles.headerButton}
                    >
                        <MaterialIcons name="edit" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleDelete}
                        style={styles.headerButton}
                    >
                        <MaterialIcons name="delete" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Use the renderPostContent function instead of conditional rendering */}
            {renderPostContent()}

            <Text style={styles.notes}>{post?.notes}</Text>
            <View style={styles.metaContainer}>
                {post?.createdAt && (
                    <Text style={styles.dateText}>
                        Saved on {formatDate(post.createdAt)}
                    </Text>
                )}
                <Text style={styles.platformText}>
                    From {formatPlatform(post?.platform)}
                </Text>
            </View>

            <View style={styles.tagsContainer}>
                {post?.tags?.map((tag, index) => (
                    <Text key={index} style={styles.tag}>
                        #{tag}
                    </Text>
                ))}
            </View>

            {post?.platform && post.platform !== 'gallery' && (
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
        height: 400,
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
    metaContainer: {
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: '#007AFF',
        paddingLeft: 12,
    },
    dateText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 4,
    },
    platformText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 16,
    },
    headerButton: {
        padding: 4,
    },
    platformButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    platformButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default PostDetails;