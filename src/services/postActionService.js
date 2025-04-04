//Project services and utilities
import { deletePost as deletePostService, getPost as fetchPost, updatePost as modifyPost } from './posts';
import { openInPlatform } from './platformService';
import { showToast, TOAST_TYPES } from '../components/Toasts';

/*
  Post Actions Service Module

  Provides a centralized service for post-related actions.
  - Post deletions
  - Opening in platform
  - Post updates
*/

//Post deletions
export const handlePostDeletion = async (collectionId, postId, toast) => {
    try {
        await deletePostService(collectionId, postId);
        showToast(toast, "Post deleted successfully", { type: TOAST_TYPES.SUCCESS });
        return true;
    }
    catch (error) {
        showToast(toast, "Failed to delete post", { type: TOAST_TYPES.DANGER });
        return false;
    }
};

//Opening in platform
export const handleOpenInPlatform = async (post, toast) => {
    try {
        await openInPlatform(post);
        return true;
    }
    catch (error) {
        showToast(toast, "Failed to open content", { type: TOAST_TYPES.WARNING });
        return false;
    }
};

//Load post data for editing
export const loadPostForEditing = async (collectionId, postId, toast) => {
    try {
        const post = await fetchPost(collectionId, postId);

        if (!post) {
            showToast(toast, "Post not found", { type: TOAST_TYPES.DANGER });
            return null;
        }

        return {
            notes: post.notes || '',
            tags: post.tags?.join(', ') || '',
            originalPost: post // Keep original for reference
        };
    }
    catch (error) {
        showToast(toast, "Failed to load post", { type: TOAST_TYPES.DANGER });
        return null;
    }
};

//Save edited post metadata
export const saveEditedPost = async (collectionId, postId, formData, toast) => {
    try {
        // Process form data
        const updateData = {
            notes: formData.notes,
            tags: processTags(formData.tags),
            updatedAt: new Date().toISOString()
        };

        // Update post in database
        await modifyPost(collectionId, postId, updateData);

        showToast(toast, "Post updated", { type: TOAST_TYPES.SUCCESS });
        return true;
    }
    catch (error) {
        showToast(toast, "Failed to update post", { type: TOAST_TYPES.DANGER });
        return false;
    }
};

//Process tags
const processTags = (tagsString) => {
    if (!tagsString) return [];
    return tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
};