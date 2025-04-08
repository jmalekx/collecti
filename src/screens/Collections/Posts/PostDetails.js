//React and React Native core imports
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { useToast } from 'react-native-toast-notifications';
import { useFocusEffect } from '@react-navigation/native';

//Project services and utilities
import { getPost } from '../../../services/posts';
import { handlePostDeletion, handleOpenInPlatform } from '../../../services/postActionService';
import { shouldShowPlatformLink, getPlatformDisplayName } from '../../../services/platformService';
import { formatDate, formatPlatform } from '../../../utils/formatting';

//Custom component imports and styling
import { showToast, TOAST_TYPES } from '../../../components/utilities/Toasts';
import commonStyles, { colours } from '../../../styles/commonStyles';
import poststyles from '../../../styles/poststyles';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import LinkTexts from '../../../components/utilities/LinkTexts';
import RenderPosts from '../../../components/utilities/RenderPosts';
import LoadingIndicator from '../../../components/utilities/LoadingIndicator';

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
        Linking.openURL(post.sourceUrl).catch(error => {
          showToast(toast, "Could not open Pinterest URL", { type: TOAST_TYPES.DANGER });
        });
      }
      else {
        await handleOpenInPlatform(post, toast);
      }
    }
    catch (error) {
      showToast(toast, "Error opening link", { type: TOAST_TYPES.DANGER });
    }
  };

  //Loading state render
  if (loading) {
    return (
      <View style={poststyles.loadingContainer}>
        <LoadingIndicator />
      </View>
    );
  }

  return (
    <commonStyles.Bg>
      <View style={[commonStyles.container, { marginTop: -10 }]}>
        {/* Header Section */}
        <View style={commonStyles.customHeader}>
          {/* Back Navigation Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={commonStyles.customHeaderBackButton}
          >
            <Ionicons name="chevron-back" size={24} color={colours.mainTexts} />
          </TouchableOpacity>
          {/* Action Buttons */}
          <View style={commonStyles.customHeaderActions}>
            {isExternalCollection ? (
              //Disabled buttons for external collections
              <>
                <TouchableOpacity
                  disabled={true}
                  style={[commonStyles.customActionButton, commonStyles.customActionButton]}
                >
                  <Ionicons name="create-outline" size={24} color={colours.grey} />
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={true}
                  style={[commonStyles.customActionButton, commonStyles.customActionButton]}
                >
                  <Ionicons name="trash" size={24} color={colours.grey} />
                </TouchableOpacity>
              </>
            ) : (
              //Enabled buttons for user own collections
              <>
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditPost', { collectionId, postId })}
                  style={[commonStyles.customActionButton, commonStyles.customActionButton]}
                >
                  <Ionicons name="create-outline" size={24} color={colours.buttonsTextPink} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  style={[commonStyles.customActionButton, commonStyles.customActionButton]}
                >
                  <Ionicons name="trash" size={24} color={colours.delete} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Post Content  */}
        <ScrollView
          style={[commonStyles.container, { marginTop: -10 }]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          <RenderPosts post={post} toast={toast} />

          {/* Post Notes Section */}
          <LinkTexts text={post?.notes} style={poststyles.notes} />

          {/* Post Metadata Section */}
          <View style={poststyles.metaContainer}>
            {post?.createdAt && (
              <Text style={poststyles.dateText}>
                Saved on {formatDate(post.createdAt)}
              </Text>
            )}
            <Text style={poststyles.platformText}>
              From {formatPlatform(post?.platform)}
            </Text>
          </View>

          {/* Post Tags Section */}
          <View style={poststyles.tagsContainer}>
            {post?.tags?.map((tag, index) => (
              <Text key={index} style={poststyles.tag}>
                #{tag}
              </Text>
            ))}
          </View>

          {/* Platform Link Button - Using platform service to determine visibility */}
          {shouldShowPlatformLink(post) && (
            <TouchableOpacity style={poststyles.platformButton} onPress={handlePlatformLink}>
              <Text style={poststyles.platformButtonText}>
                View on {getPlatformDisplayName(post)}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

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
    </commonStyles.Bg>
  );
};

export default PostDetails;