//React and React Native core imports
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and styling
import collectionstyles from '../../../styles/collectionstyles';
import { colours } from '../../../styles/commonStyles';
import RenderThumbnail from '../../utilities/RenderThumbnail';

/*
  PostGridItem Component

  Displays a single post item in the collection grid.
  Handles rendering the thumbnail, platform icon, selection state,
  and handles press/long-press interactions.
*/

const PostGrid = ({
  item,
  isSelectionMode,
  selectedPosts,
  toggleItemSelection,
  selectSingleItem,
  navigation,
  collectionId,
  effectiveUserId
}) => {
  //UI Helper functions
  const getPlatformIcon = (post) => {
    if (post.thumbnail.includes('instagram.com')) {
      return <Ionicons name="logo-instagram" size={20} color={colours.instagram} />;
    }
    else if (post.thumbnail.includes('tiktok.com')) {
      return <Ionicons name="logo-tiktok" size={20} color={colours.tiktok} />;
    }
    else if (post.thumbnail.includes('youtube.com') || post.thumbnail.includes('youtu.be')) {
      return <Ionicons name="logo-youtube" size={20} color={colours.youtube} />;
    }
    else if (post.platform === 'pinterest' || post.thumbnail.includes('pinterest.com') || post.thumbnail.includes('pin.it')) {
      return <Ionicons name="logo-pinterest" size={20} color={colours.pinterest} />;
    }
    else {
      return <Ionicons name="images-outline" size={20} color={colours.gallery} />;
    }
  };

  const renderThumbnail = (item) => {
    return (
      <RenderThumbnail
        thumbnail={item.thumbnail}
        containerStyle={collectionstyles.postContentContainer}
        thumbnailStyle={collectionstyles.thumbnail}
        scale={
          item.thumbnail.includes('tiktok.com') ? 0.7 :
            (item.thumbnail.includes('pinterest.com') || item.thumbnail.includes('pin.it')) ? 0.45 :
              undefined // Default scale for other platforms
        }
      />
    );
  };

  return (
    <TouchableOpacity
      style={[
        collectionstyles.postCard,
        isSelectionMode && selectedPosts.includes(item.id) && collectionstyles.selectedPostCard
      ]}
      onPress={() => {
        if (isSelectionMode) {
          toggleItemSelection(item.id);
        } else {
          navigation.navigate('PostDetails', {
            postId: item.id,
            collectionId: collectionId,
            ownerId: effectiveUserId
          });
        }
      }}
      onLongPress={() => {
        if (!isSelectionMode) {
          selectSingleItem(item.id);
        }
      }}
    >
      {/* Platform Icon */}
      <View style={collectionstyles.platformIconContainer}>
        {getPlatformIcon(item)}
      </View>

      {isSelectionMode && (
        <View style={collectionstyles.checkboxContainer}>
          <Ionicons
            name={selectedPosts.includes(item.id) ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={selectedPosts.includes(item.id) ? colours.buttonsText : colours.subTexts}
          />
        </View>
      )}

      {/* Post Content */}
      {renderThumbnail(item)}
      <Text
        style={collectionstyles.postTitle}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.notes}
      </Text>
    </TouchableOpacity>
  );
};

export default PostGrid;