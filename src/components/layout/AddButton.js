//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, TouchableWithoutFeedback, Animated } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

//Third-party library external imports
import { useToast } from 'react-native-toast-notifications';

//Custom component imports and styling
import PostCreationModal from '../modals/PostCreationModal';
import CollectionCreationModal from '../modals/CollectionCreationModal';
import useMenuAnimation from '../../hooks/useMenuAnimation';
import addbuttonstyles from '../../styles/addbuttonstyles';

/*
  AddButton Component

  Floating action button (FAB) serving as main entry point for user content creation
  Implements multi modal interface for addingf posts from different sources (gallery, URL)
  This is the modal you see when sharing content to the app from other platforms.

  State mahcine:
  - Idle: FAB visible, not expanded
  - Options open: FAB menu options visible
  - Collection creation: modal for creating new collections
  - Post creation: modal with sub-states for content types
    - Gallery selection
    - URL input
    - Collection selection
    - New collection creation
*/

const AddButton = ({ onAddPost, onCreateCollection, collections = [], sharedUrl, platform }) => {
  //UI options and modal visibility
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  
  //Context states
  const toast = useToast(); //Notification service singleton
  const isScreenFocused = useIsFocused(); //Navigation focus observer
  
  //Animation hook - moved from component to its own hook
  const {
    rotateInterpolation,
    postButtonTranslateY,
    collectionButtonTranslateY,
    scaleInterpolation,
    opacityInterpolation
  } = useMenuAnimation(isOptionsOpen);

  //Focus observer
  useEffect(() => {
    if (!isScreenFocused) {
      setIsOptionsOpen(false);
    }
  }, [isScreenFocused]);

  return (
    <View style={addbuttonstyles.container}>
      {isOptionsOpen && (
        <TouchableWithoutFeedback onPress={() => setIsOptionsOpen(false)}>
          <View style={addbuttonstyles.backdrop} />
        </TouchableWithoutFeedback>
      )}
      
      {/* Collection Creation Modal */}
      <CollectionCreationModal
        visible={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        onCreateCollection={onCreateCollection}
        toast={toast}
      />

      {/* Post Creation Modal */}
      <PostCreationModal
        visible={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        collections={collections}
        onAddPost={onAddPost}
        onCreateCollection={onCreateCollection}
        sharedUrl={sharedUrl}
        platform={platform}
        toast={toast}
      />

      {/* Post Button */}
      <Animated.View
        style={[
          addbuttonstyles.menuItemContainer,
          {
            transform: [
              { translateY: postButtonTranslateY },
              { scale: scaleInterpolation }
            ],
            opacity: opacityInterpolation
          }
        ]}
      >
        <TouchableOpacity
          style={addbuttonstyles.menuItem}
          onPress={() => {
            setIsPostModalOpen(true);
            setIsOptionsOpen(false);
          }}
        >
          <View style={addbuttonstyles.menuItemButton}>
            <MaterialIcons name="post-add" size={20} color="#fff" />
          </View>
          <Text style={addbuttonstyles.menuItemLabel}>Post</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Collection Button */}
      <Animated.View
        style={[
          addbuttonstyles.menuItemContainer,
          {
            transform: [
              { translateY: collectionButtonTranslateY },
              { scale: scaleInterpolation }
            ],
            opacity: opacityInterpolation
          }
        ]}
      >
        <TouchableOpacity
          style={addbuttonstyles.menuItem}
          onPress={() => {
            setIsCollectionModalOpen(true);
            setIsOptionsOpen(false);
          }}
        >
          <View style={addbuttonstyles.menuItemButton}>
            <Ionicons name="folder-open" size={20} color="#fff" />
          </View>
          <Text style={addbuttonstyles.menuItemLabel}>Collection</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Add Button */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, pointerEvents: 'box-none' }}>
        <TouchableOpacity
          style={addbuttonstyles.addBtn}
          onPress={() => setIsOptionsOpen(!isOptionsOpen)}
        >
          <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
            <Ionicons name="add-outline" size={30} color="#D67A98" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddButton;