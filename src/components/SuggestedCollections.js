//React and React Native core imports
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';

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
import { AppSubheading } from './Typography';

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }

  if (recommendations.length === 0) {
    return null; //Dont show section if no recommendations
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
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
            style={styles.collectionCard}
            onPress={() => navigateToCollection(item.id, item.ownerId)}
          >
            <View style={styles.thumbnailContainer}>
              <RenderThumbnail
                thumbnail={item.thumbnail || DEFAULT_THUMBNAIL}
                scale={0.5}
                containerStyle={styles.thumbnailWrapper}
                thumbnailStyle={styles.thumbnail}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.collectionName} numberOfLines={1}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  container: {
    marginVertical: 16,
    width: '100%',
    height: 170,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionCard: {
    width: 130,
    height: 130,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  thumbnailContainer: {
    height: 90,
    width: '100%',
  },
  thumbnailWrapper: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 10,
  },
  collectionName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  collectionStats: {
    fontSize: 12,
    color: '#666',
  }
});

export default SuggestedCollections;