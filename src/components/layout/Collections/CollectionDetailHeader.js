//React and React Native core imports
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and styling
import commonStyles, { colours } from '../../../styles/commonStyles';
import colldetailstyles from '../../../styles/colldetailstyles';

/*
  CollectionHeader Component

  Displays the header section of a collection detail screen, including the collection name,
  back button, and action buttons based on current mode (selection mode or normal mode).
*/

const CollectionDetailHeader = ({ 
  navigation, 
  collectionName, 
  collectionDescription, 
  postsCount,
  isSelectionMode, 
  selectedPosts, 
  toggleSelectionMode, 
  handleGroupMove, 
  handleGroupDelete,
  isExternalCollection,
  canEditCollection,
  setShowDeleteCollectionModal
}) => {
  return (
    <>
      <View style={commonStyles.customHeader}>
        {/* Back Navigation Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={commonStyles.customHeaderBackButton}
        >
          <Ionicons name="chevron-back" size={24} color={colours.mainTexts} />
        </TouchableOpacity>
        <Text style={colldetailstyles.collectionName}>{collectionName}</Text>

        {/* Action Buttons */}
        <View style={commonStyles.customHeaderActions}>
          {isSelectionMode ? (
            <>
              <TouchableOpacity
                onPress={toggleSelectionMode}
                style={commonStyles.customActionButton}
              >
                <Ionicons name="close" size={24} color={colours.mainTexts} />
              </TouchableOpacity>
              <Text style={colldetailstyles.selectionCount}>{selectedPosts.length} selected</Text>
              <TouchableOpacity
                onPress={handleGroupMove}
                style={[commonStyles.customActionButton, isExternalCollection && colldetailstyles.disabledIcon]}
                disabled={isExternalCollection}
              >
                <Ionicons name="move" size={22} color={isExternalCollection ? colours.mainTexts : colours.buttonsText} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleGroupDelete}
                style={[commonStyles.customActionButton, isExternalCollection && colldetailstyles.disabledIcon]}
                disabled={isExternalCollection}
              >
                <Ionicons name="trash" size={22} color={isExternalCollection ? colours.mainTexts : colours.delete} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={toggleSelectionMode}
                style={[commonStyles.customActionButton, isExternalCollection && colldetailstyles.disabledIcon]}
                disabled={isExternalCollection}
              >
                <Ionicons name="checkmark-circle-outline" size={24} color={isExternalCollection ? "#ccc" : colours.mainTexts} />
              </TouchableOpacity>
              {canEditCollection ? (
                <>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('EditCollection', { collectionId })}
                    style={commonStyles.customActionButton}
                  >
                    <Ionicons name="create-outline" size={24} color={colours.buttonsTextPink} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowDeleteCollectionModal(true)}
                    style={commonStyles.customActionButton}
                  >
                    <Ionicons name="trash" size={24} color={colours.delete} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    disabled={true}
                    style={[commonStyles.customActionButton, colldetailstyles.disabledIcon]}
                  >
                    <Ionicons name="create-outline" size={24} color="#ccc" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={true}
                    style={[commonStyles.customActionButton, colldetailstyles.disabledIcon]}
                  >
                    <Ionicons name="trash" size={24} color="#ccc" />
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </View>

      {/* Description line */}
      <View style={colldetailstyles.headerBottom}>
        <Text style={colldetailstyles.collectionDescription}>{collectionDescription}</Text>
        <Text style={colldetailstyles.postCount}>{postsCount} posts</Text>
      </View>
    </>
  );
};

export default CollectionDetailHeader;