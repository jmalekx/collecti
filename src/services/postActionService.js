//Project services and utilities
import { deletePost as deletePostService } from './posts';
import { openInPlatform } from './platformService';
import { showToast, TOAST_TYPES } from '../components/Toasts';

/*
  Post Actions Service Module

  Provides a centralized service for post-related actions.
*/

//Post deletions
export const handlePostDeletion = async (collectionId, postId, toast) => {
    try {
        await deletePostService(collectionId, postId);
        showToast(toast, "Post deleted successfully", { type: TOAST_TYPES.SUCCESS });
        return true;
    } catch (error) {
        console.error('Error deleting post:', error);
        showToast(toast, "Failed to delete post", { type: TOAST_TYPES.DANGER });
        return false;
    }
};

//Opening in platform
export const handleOpenInPlatform = async (post, toast) => {
    try {
        await openInPlatform(post);
        return true;
    } catch (error) {
        console.error('Error opening in platform:', error);
        showToast(toast, error.message || "Failed to open content", { type: TOAST_TYPES.WARNING });
        return false;
    }
};