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
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { useToast } from 'react-native-toast-notifications';
import { useFocusEffect } from '@react-navigation/native';
import { DEFAULT_THUMBNAIL } from '../../../constants';
import InstagramEmbed from '../../../components/InstagramEmbed';
import TikTokEmbed from '../../../components/TiktokEmbed';
import { showToast, TOAST_TYPES } from '../../../components/Toasts';
import { getPost, deletePost } from '../../../services/posts';
import LinkifyIt from 'linkify-it';
import ConfirmationModal
    from '../../../components/ConfirmationModal';
const linkify = LinkifyIt();

const TextWithLinks = ({ text, style }) => {
    if (!text) return null;

    const matches = linkify.match(text);
    if (!matches) {
        return <Text style={style}>{text}</Text>;
    }

    const elements = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
        // Add text before the link
        if (match.index > lastIndex) {
            elements.push(
                <Text key={`text-${i}`} style={style}>
                    {text.substring(lastIndex, match.index)}
                </Text>
            );
        }

        // Add the link
        elements.push(
            <Text
                key={`link-${i}`}
                style={[style, styles.link]}
                onPress={() => Linking.openURL(match.url)}
            >
                {match.text}
            </Text>
        );

        lastIndex = match.lastIndex;
    });

    // Add text after the last link
    if (lastIndex < text.length) {
        elements.push(
            <Text key={`text-last`} style={style}>
                {text.substring(lastIndex)}
            </Text>
        );
    }

    return <Text>{elements}</Text>;
};

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
    const { collectionId, postId, ownerId } = route.params;
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentUserId = getAuth().currentUser?.uid;
    // Use the owner ID from params if available, otherwise use current user ID
    const effectiveUserId = ownerId || currentUserId;
    // Check if this is another user's collection
    const isExternalCollection = ownerId && ownerId !== currentUserId;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const toast = useToast();

    const fetchPost = async () => {
        try {
            // Pass the effective user ID to the getPost service
            const postData = await getPost(collectionId, postId, effectiveUserId);
            if (postData) {
                setPost(postData);
            } else {
                showToast(toast, "Post not found", { type: TOAST_TYPES.DANGER });
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error fetching post:', error);
            showToast(toast, "Failed to load post", { type: TOAST_TYPES.DANGER });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchPost();
        }, [collectionId, postId])
    );

    const confirmDelete = async () => {
        try {
            await deletePost(collectionId, postId);
            showToast(toast, "Post deleted successfully", { type: TOAST_TYPES.SUCCESS });
            setShowDeleteModal(false);
            navigation.goBack();
        } catch (error) {
            console.error('Error deleting post:', error);
            showToast(toast, "Failed to delete post", { type: TOAST_TYPES.DANGER });
            setShowDeleteModal(false);
        }
    };

    const handlePlatformLink = () => {
        if (!post) return;

        const postUrl = post.image || post.thumbnail || post.originalUrl;

        if (!postUrl) {
            showToast(toast, "No URL available to open", { type: TOAST_TYPES.WARNING });
            return;
        }

        if (post.platform === 'instagram') {
            Linking.openURL(postUrl);
        } else if (post.platform === 'tiktok') {
            const tiktokUrl = postUrl.split('?')[0]; // Remove any query parameters
            Linking.openURL(tiktokUrl);
        } else if (post.platform === 'pinterest') {
            Linking.openURL(postUrl);
        }
    };


    const renderPostContent = () => {
        // First check if the post object exists
        if (!post) return null;

        // Check for multiple possible URL fields with fallbacks
        const postUrl = post.image || post.thumbnail || post.originalUrl;

        if (!postUrl) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Unable to load content</Text>
                </View>
            );
        }

        // For Instagram posts
        if (post.platform === 'instagram' && postUrl.includes('instagram.com')) {
            return (
                <View>
                    <InstagramEmbed url={postUrl} style={styles.thumbnail} scale={0.1} />
                </View>
            );
        }

        // For TikTok posts
        if (post.platform === 'tiktok' && postUrl.includes('tiktok.com')) {
            return (
                <View style={styles.embedContainer}>
                    <TikTokEmbed url={postUrl} style={styles.thumbnail} scale={0.64} />
                </View>
            );
        }

        // For Pinterest posts
        if (post.platform === 'pinterest') {
            return (
                <View>
                    <Image
                        source={{ uri: postUrl }}
                        style={styles.thumbnail}
                    />
                    <TouchableOpacity onPress={() => Linking.openURL(postUrl)}>
                        <Text style={styles.linkText}>Open in Pinterest</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // Default image rendering
        return (
            <Image
                source={{ uri: postUrl }}
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
                    <Ionicons name="chevron-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    {isExternalCollection ? (
                        // Disabled buttons for external collections
                        <>
                            <TouchableOpacity
                                disabled={true}
                                style={[styles.headerButton, styles.disabledIcon]}
                            >
                                <Ionicons name="create-outline" size={24} color="#ccc" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                disabled={true}
                                style={[styles.headerButton, styles.disabledIcon]}
                            >
                                <Ionicons name="trash" size={24} color="#ccc" />
                            </TouchableOpacity>
                        </>
                    ) : (
                        // Enabled buttons for user's own collections
                        <>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('EditPost', { collectionId, postId })}
                                style={styles.headerButton}
                            >
                                <Ionicons name="create-outline" size={24} color="#007AFF" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleDelete}
                                style={styles.headerButton}
                            >
                                <Ionicons name="trash" size={24} color="#FF3B30" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            {renderPostContent()}

            <TextWithLinks text={post?.notes} style={styles.notes} />
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

            {/* Delete Post Modal */}
            <ConfirmationModal
                visible={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Post"
                message="Are you sure you want to delete this post? This action cannot be undone."
                primaryAction={confirmDelete}
                primaryText="Delete"
                primaryStyle="danger"
                icon="trash-outline"
            />
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
    link: {
        color: '#007AFF',
        textDecorationLine: 'underline',
    },
    disabledIcon: {
        opacity: 0.4,
    },
});

export default PostDetails;