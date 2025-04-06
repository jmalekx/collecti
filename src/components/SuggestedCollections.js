//React and React Native core imports
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

//Third-party library external imports
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

//Project services and utilities
import { useRecommendations } from '../hooks/useRecommendations';
import RenderThumbnail from './RenderThumbnail';
import { DEFAULT_THUMBNAIL } from '../constants';
import { FIREBASE_AUTH } from '../../FirebaseConfig';

//Custom component imports and styling
import commonStyles, { colours } from '../styles/commonStyles';
import homestyles from '../styles/homestyles';
import { AppSubheading } from './Typography';
import LoadingIndicator from './LoadingIndicator';

/*
  SuggestedCollections Component

  Implements visual representation layer of recommendation system
  MVM principles applied:
  1. Visual display in horizontally scrollable format
  2. Looading state management
  3. Empty state handling
  4. Interactive UI elements
*/

const SuggestedCollections = () => {
  const { recommendations, loading, refreshRecommendations } = useRecommendations(6);
  const navigation = useNavigation();
  const currentUserId = FIREBASE_AUTH.currentUser?.uid;

  const navigateToCollection = (collectionId, ownerId) => {
    navigation.navigate('CollectionDetails', {
      collectionId,
      ownerId,
      isExternalCollection: ownerId !== currentUserId
    });
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