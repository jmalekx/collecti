//React and React Native core imports
import React, { useState, useLayoutEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

//Third-party library external imports
import { useNavigation } from '@react-navigation/native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';

//Project services and utilities
import { useUserData } from '../../hooks/useUserData';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { DEFAULT_PROFILE_PICTURE } from '../../constants';
import { deleteCollection } from '../../services/collections';
import { showToast, TOAST_TYPES } from '../../components/utilities/Toasts';

//Custom component imports and styling
import commonStyles, { colours } from '../../styles/commonStyles';
import collectionstyles from '../../styles/collectionstyles';
import RenderThumbnail from '../../components/utilities/RenderThumbnail';
import SearchBar from '../../components/utilities/SearchBar';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import { useSelectionMode } from '../../hooks/useSelectionMode';

/*
  Collections component displays the user's collections and allows searching through them.
  Props:
  - userProfile: The user's profile data.
  - collections: The user's collections data.
  
*/

const Collections = ({ }) => {
  const navigation = useNavigation();
  const { userProfile, collections, refreshData } = useUserData();
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  //Use selection mode hook
  const {
    isSelectionMode,
    selectedItems: selectedCollections,
    toggleSelectionMode,
    toggleItemSelection,
    selectSingleItem,
    clearSelections,
  } = useSelectionMode();

  //Header with settings button or selection mode actions
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        isSelectionMode ? (
          <TouchableOpacity
            onPress={toggleSelectionMode}
            style={[commonStyles.headerButton, { marginLeft: 8 }]}
          >
            <Ionicons name="close" size={24} color={colours.mainTexts} />
          </TouchableOpacity>
        ) : undefined
      ),
      headerRight: () => (
        isSelectionMode ? (
          <TouchableOpacity
            onPress={handleDeleteSelected}
            style={commonStyles.headerButton}
            disabled={selectedCollections.length === 0}
          >
            <Ionicons
              name="trash-outline"
              size={24}
              color={selectedCollections.length === 0 ? colours.grey : colours.delete}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.navigate('UserSettings')}
            style={commonStyles.headerButton}
          >
            <Ionicons name="settings-outline" size={24} color={colours.mainTexts} />
          </TouchableOpacity>
        )
      ),
      headerTitle: isSelectionMode ? `${selectedCollections.length} selected` : 'Collections'
    });
  }, [navigation, isSelectionMode, selectedCollections]);

  //Handle deletion of selected collections
  const handleDeleteSelected = () => {
    if (selectedCollections.length === 0) {
      showToast(toast, "No collections selected", { type: TOAST_TYPES.WARNING });
      return;
    }
    setShowDeleteModal(true);
  };

  //Delete multiple collections
  const deleteSelectedCollections = async () => {
    try {
      //Filter out the Unsorted collection ifselected
      const collectionsToDelete = selectedCollections.filter(id => {
        const collection = collections.find(c => c.id === id);
        return collection && collection.name !== 'Unsorted';
      });

      if (collectionsToDelete.length !== selectedCollections.length) {
        showToast(toast, "Cannot delete Unsorted", { type: TOAST_TYPES.WARNING });
      }

      if (collectionsToDelete.length === 0) {
        setShowDeleteModal(false);
        return;
      }

      //Process each deletion
      const promises = collectionsToDelete.map(id => deleteCollection(id));
      await Promise.all(promises);

      showToast(toast, `${collectionsToDelete.length} collections deleted`, { type: TOAST_TYPES.SUCCESS });
      clearSelections();
      toggleSelectionMode();
      setShowDeleteModal(false);
    }
    catch (error) {
      showToast(toast, "Failed to delete collections", { type: TOAST_TYPES.DANGER });
    }
  };

  //Title AND tag matchig search functionality
  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;

    const query = searchQuery.toLowerCase().trim();

    //PHASE 1: find collections with matching names (higher priority)
    const nameMatches = collections.filter(collection =>
      collection.name.toLowerCase().includes(query)
    );

    //Get IDs of collections that already matched by name
    const nameMatchIds = new Set(nameMatches.map(c => c.id));

    //PHASE 2: find collections with matching tags in their posts
    const tagMatches = collections.filter(collection => {
      //Skip if already matched by name
      if (nameMatchIds.has(collection.id)) return false;

      //Check if any post in this collection has a tag matching the query
      return collection.items.some(post =>
        post.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    });

    //Combine results: name matches first, then tag matches
    return [...nameMatches, ...tagMatches];
  }, [collections, searchQuery]);

  //Sort collections by creation date- newest first with Unsorted always at the top
  const sortedCollections = [...filteredCollections].sort((a, b) => {
    //Always keep Unsorted collection at the top
    if (a.name === "Unsorted") return -1;
    if (b.name === "Unsorted") return 1;

    return b.createdAt - a.createdAt;
  });

  return (
    <commonStyles.Bg>
      <View style={[commonStyles.container, { marginTop: -15 }]}>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search collections..."
        />

        {/* Collection Grid */}
        <FlatList
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={sortedCollections}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={collectionstyles.grid}
          columnWrapperStyle={{ justifyContent: 'flex-start' }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                collectionstyles.collectionCard,
                { marginRight: '5%' },
                isSelectionMode && selectedCollections.includes(item.id) && collectionstyles.selectedCollectionCard
              ]}
              onPress={() => {
                if (isSelectionMode) {
                  toggleItemSelection(item.id);
                }
                else {
                  //Normal mode: navigate to details
                  navigation.navigate('CollectionDetails', { collectionId: item.id });
                }
              }}
              onLongPress={() => {
                if (!isSelectionMode) {
                  //Long press initiates selection mode
                  selectSingleItem(item.id);
                }
              }}
            >
              {/* Selection indicator */}
              {isSelectionMode && (
                <View style={collectionstyles.checkboxContainer2}>
                  <Ionicons
                    name={selectedCollections.includes(item.id) ? "checkmark-circle" : "ellipse-outline"}
                    size={24}
                    color={selectedCollections.includes(item.id) ? colours.buttonsText : colours.subTexts}
                  />
                </View>
              )}

              {/* Collection Thumbnail */}
              <RenderThumbnail
                thumbnail={item.thumbnail}
                thumbnailStyle={collectionstyles.MainThumbnail}
                scale={
                  item.thumbnail.includes('tiktok.com') ? 0.51 :
                    (item.thumbnail.includes('pinterest.com') || item.thumbnail.includes('pin.it')) ? 0.3 :
                      undefined
                }
              />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.name === "Unsorted" && (
                  <AntDesign name="pushpino" size={12} color={colours.mainTexts} style={{ marginRight: 4 }} />
                )}
                <Text
                  style={collectionstyles.MainCollectionName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.name}
                </Text>
              </View>
              <Text style={collectionstyles.collectionStats}>{item.items.length} posts</Text>
            </TouchableOpacity>
          )}
        />

        {/* Deletion Confirmation Modal */}
        <ConfirmationModal
          visible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title={`Delete ${selectedCollections.length} Collections`}
          message="Are you sure you want to delete these collections? This action cannot be undone and all posts within them will be removed."
          primaryAction={deleteSelectedCollections}
          primaryText="Delete"
          primaryStyle="danger"
          icon="trash-outline"
        />
      </View>
    </commonStyles.Bg>
  );
};

export default Collections;