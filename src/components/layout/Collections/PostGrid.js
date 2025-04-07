//React and React Native core imports
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and styling
import colldetailstyles from '../../../styles/colldetailstyles';
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
        containerStyle={colldetailstyles.postContentContainer}
        thumbnailStyle={colldetailstyles.thumbnail}
        scale={0.42}
      />
    );
  };

  return (
    <TouchableOpacity
      style={[
        colldetailstyles.postCard,
        isSelectionMode && selectedPosts.includes(item.id) && colldetailstyles.selectedPostCard
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
      <View style={colldetailstyles.platformIconContainer}>
        {getPlatformIcon(item)}
      </View>

      {isSelectionMode && (
        <View style={colldetailstyles.checkboxContainer}>
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
        style={colldetailstyles.postTitle}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.notes}
      </Text>
    </TouchableOpacity>
  );
};

export default PostGrid;