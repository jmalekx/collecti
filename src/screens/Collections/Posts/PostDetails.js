//React and React Native core imports
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { useToast } from 'react-native-toast-notifications';
import { useFocusEffect } from '@react-navigation/native';

//Project services and utilities
import { showToast, TOAST_TYPES } from '../../../components/Toasts';
import { getPost } from '../../../services/posts';
import { handlePostDeletion, handleOpenInPlatform } from '../../../services/postActionService';
import { shouldShowPlatformLink, getPlatformDisplayName } from '../../../services/platformService';
import ConfirmationModal from '../../../components/ConfirmationModal';
import LinkTexts from '../../../components/LinkTexts';
import { formatDate, formatPlatform } from '../../../utils/formatting';
import RenderPosts from '../../../components/RenderPosts';

//Custom component imports and styling
import commonStyles from '../../../styles/commonStyles';

/*
    PostDetails Screen

    Implements Composite View Pattern to display details of post info with
    platform-specific rendering. Displays content, metadata and appropriate actions
    based on user authentication
*/

const PostDetails = ({ route, navigation }) => {

    //State transitions
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    //Content managing
    const { collectionId, postId, ownerId } = route.params;

    //User authentication
    const currentUserId = getAuth().currentUser?.uid;
    const effectiveUserId = ownerId || currentUserId; //Use owner ID from params otherwise current
    const isExternalCollection = ownerId && ownerId !== currentUserId;

    //Context states
    const toast = useToast();

    //Fetch post data from service
    const fetchPost = async () => {
        try {
            //Service layer interaction
            const postData = await getPost(collectionId, postId, effectiveUserId);
            if (postData) {
                setPost(postData);
            }
            else {
                showToast(toast, "Post not found", { type: TOAST_TYPES.DANGER });
                navigation.goBack();
            }
        }
        catch (error) {
            console.error('Error fetching post:', error);
            showToast(toast, "Failed to load post", { type: TOAST_TYPES.DANGER });
        }
        finally {
            setLoading(false);
        }
    };

    //Delete post action handler
    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchPost();
        }, [collectionId, postId])
    );

    //Delete confirmation handler
    const confirmDelete = async () => {
        const success = await handlePostDeletion(collectionId, postId, toast);
        if (success) {
            setShowDeleteModal(false);
            navigation.goBack();
        }
        else {
            setShowDeleteModal(false);
        }
    };

    //Platform-specific link handling using service
    const handlePlatformLink = async () => {
        try {
          if (post.platform === 'pinterest' && post.sourceUrl) {
            Linking.openURL(post.sourceUrl).catch(err => {
              console.error('Error opening Pinterest URL:', err);
              showToast(toast, "Could not open Pinterest URL", { type: TOAST_TYPES.DANGER });
            });
          } 
          else {
            // Use the correctly imported function
            await handleOpenInPlatform(post, toast);
          }
        } 
        catch (error) {
          console.error('Error in handlePlatformLink:', error);
          showToast(toast, "Error opening link", { type: TOAST_TYPES.DANGER });
        }
      };

    //Loading state render
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                {/* Back Navigation Button */}
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                {/* Action Buttons */}
                <View style={styles.headerActions}>
                    {isExternalCollection ? (
                        //Disabled buttons for external collections
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
                        //Enabled buttons for user own collections
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

            {/* Post Content - Using the specialized content renderer component */}
            <RenderPosts post={post} toast={toast} />

            {/* Post Notes Section */}
            <LinkTexts text={post?.notes} style={styles.notes} />

            {/* Post Metadata Section */}
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

            {/* Post Tags Section */}
            <View style={styles.tagsContainer}>
                {post?.tags?.map((tag, index) => (
                    <Text key={index} style={styles.tag}>
                        #{tag}
                    </Text>
                ))}
            </View>

            {/* Platform Link Button - Using platform service to determine visibility */}
            {shouldShowPlatformLink(post) && (
                <TouchableOpacity style={styles.platformButton} onPress={handlePlatformLink}>
                    <Text style={styles.platformButtonText}>
                        View on {getPlatformDisplayName(post)}
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
    ...commonStyles,
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
    disabledIcon: {
        opacity: 0.4,
    }
});

export default PostDetails;