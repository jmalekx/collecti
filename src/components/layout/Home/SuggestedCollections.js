//React and React Native core imports
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

//Third-party library external imports
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

//Project services and utilities
import { useRecommendations } from '../../../hooks/useRecommendations';
import { useBookmarks } from '../../../hooks/useBookmarks';
import RenderThumbnail from '../../utilities/RenderThumbnail';
import { DEFAULT_THUMBNAIL } from '../../../constants';
import { FIREBASE_AUTH } from '../../../../FirebaseConfig';

//Custom component imports and styling
import commonStyles, { colours } from '../../../styles/commonStyles';
import homestyles from '../../../styles/homestyles';
import { AppSubheading } from '../../utilities/Typography';
import LoadingIndicator from '../../utilities/LoadingIndicator';

/*
  SuggestedCollections Component

  Implements visual representation layer of recommendation system
  MVM principles applied:
  1. Visual display in horizontally scrollable format
  2. Loading state management
  3. Empty state handling
  4. Interactive UI elements
  5. Bookmark functionality
  
*/

const SuggestedCollections = () => {
  const { recommendations, loading, refreshRecommendations } = useRecommendations(6);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const navigation = useNavigation();
  const currentUserId = FIREBASE_AUTH.currentUser?.uid;

  const navigateToCollection = (collectionId, ownerId) => {
    navigation.navigate('CollectionDetails', {
      collectionId,
      ownerId,
      isExternalCollection: ownerId !== currentUserId
    });
  };

  //Handle bookmark toggling
  const handleBookmarkToggle = async (collection, event) => {
    event.stopPropagation(); //Prevent card click navigation

    try {
      const bookmarkData = {
        id: collection.id,
        name: collection.name,
        ownerId: collection.ownerId,
        imageUrl: collection.thumbnail || DEFAULT_THUMBNAIL,
        description: collection.description || '',
      };

      await toggleBookmark(bookmarkData);
    }
    catch (error) {
      // Error handling done in hook
    }
  };

  if (loading) {
    return (
      <View style={commonStyles.loadingContainer}>
        <LoadingIndicator />
      </View>
    );
  }

  if (recommendations.length === 0) {
    return null; //Dont show section if no recommendations
  }

  return (
    <View style={homestyles.container}>
      <View style={homestyles.headerContainer}>
        <AppSubheading>Suggested Collections</AppSubheading>
        <TouchableOpacity onPress={refreshRecommendations}>
          <Ionicons name="refresh-outline" size={20} color={colours.buttonsText} />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={recommendations}
        keyExtractor={(item) => `${item.ownerId}_${item.id}`}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={homestyles.collectionCard}
            onPress={() => navigateToCollection(item.id, item.ownerId)}
          >
            <View style={homestyles.thumbnailContainer}>
              <RenderThumbnail
                thumbnail={item.thumbnail || DEFAULT_THUMBNAIL}
                scale={0.5}
                containerStyle={homestyles.thumbnailWrapper}
                thumbnailStyle={homestyles.thumbnail}
              />

              {/* Only show bookmark option for collections not owned by current user */}
              {item.ownerId !== currentUserId && (
                <TouchableOpacity
                  style={homestyles.bookmarkButton}
                  onPress={(e) => handleBookmarkToggle(item, e)}
                >
                  <Ionicons
                    name={isBookmarked(item.id) ? "bookmark" : "bookmark-outline"}
                    size={18}
                    color={colours.buttonsTextPink}
                  />
                </TouchableOpacity>
              )}
            </View>
            <View style={homestyles.cardContent}>
              <Text style={homestyles.collectionName} numberOfLines={1}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default SuggestedCollections;