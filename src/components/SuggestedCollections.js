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
import commonStyles from '../styles/commonStyles';

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
    return null; //Don't show section if no recommendations
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Suggested Collections</Text>
        <TouchableOpacity onPress={refreshRecommendations}>
          <Ionicons name="refresh-outline" size={20} color="#007AFF" />
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
            <RenderThumbnail
              thumbnail={item.thumbnail || DEFAULT_THUMBNAIL}
              containerStyle={styles.thumbnailContainer}
              thumbnailStyle={styles.thumbnail}
              scale={0.5}
            />
            <Text style={styles.collectionName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.collectionStats} numberOfLines={1}>
              {item.items?.length || 0} posts
            </Text>
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
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionCard: {
    width: 150,
    marginLeft: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnailContainer: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  collectionName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  collectionStats: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  }
});

export default SuggestedCollections;