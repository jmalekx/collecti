import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../FirebaseConfig';
import { collectionGroup, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { DEFAULT_THUMBNAIL } from '../../constants';
import CollectionDetails from '../Collections/CollectionDetails';

const SearchPage = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Effect to search when query changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        performSearch(searchQuery);
      } else {
        // Show some recent or popular collections when no search query
        fetchRecentCollections();
      }
    }, 300); // Debounce for better performance

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const fetchRecentCollections = async () => {
    try {
      setLoading(true);
      const recentCollectionsQuery = query(
        collectionGroup(FIREBASE_DB, 'collections'),
        orderBy('createdAt', 'desc'),
        limit(20)  // Increased limit to ensure we get enough collections after filtering
      );

      const snapshot = await getDocs(recentCollectionsQuery);
      const collections = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          ownerId: doc.ref.parent.parent.id // Get the user ID from the document path
        }))
        .filter(collection => collection.name !== 'Unsorted Collection');  // Filter out Unsorted Collection

      // Limit to 10 collections after filtering
      setResults(collections.slice(0, 10));
    } catch (error) {
      console.error('Error fetching recent collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (term) => {
    try {
      setLoading(true);
      const normalizedSearchTerm = term.toLowerCase();

      // Query collections where name starts with the search term
      const collectionsQuery = query(
        collectionGroup(FIREBASE_DB, 'collections'),
        where('name', '>=', normalizedSearchTerm),
        where('name', '<=', normalizedSearchTerm + '\uf8ff')
      );

      const snapshot = await getDocs(collectionsQuery);
      
      const collections = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          ownerId: doc.ref.parent.parent.id // Get the user ID from the document path
        }))
        .filter(collection => collection.name !== 'Unsorted Collection');  // Filter out Unsorted Collection

      setResults(collections);
    } catch (error) {
      console.error('Error searching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const bookmarkCollection = async (collectionId) => {
    // Implement bookmark functionality here
    console.log("Bookmarking collection:", collectionId);
    //  save this to the user's bookmarks in Firestore
  };

  const navigateToCollection = (collectionId, ownerId) => {
    navigation.navigate('CollectionDetails', { 
      collectionId: collectionId,
      ownerId: ownerId,  // Pass the owner's ID explicitly
      isExternalCollection: ownerId !== FIREBASE_AUTH.currentUser?.uid
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search collections..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Display search results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.resultGrid}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.collectionCard}
            onPress={() => navigateToCollection(item.id, item.ownerId)}
          >
            <Image 
              source={{ uri: item.thumbnail || DEFAULT_THUMBNAIL }} 
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={styles.cardContent}>
              <Text style={styles.collectionName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.collectionSubtext} numberOfLines={1}>
                {item.ownerId === FIREBASE_AUTH.currentUser?.uid 
                  ? 'Your Collection' 
                  : 'Public Collection'}
              </Text>
              
              {item.ownerId !== FIREBASE_AUTH.currentUser?.uid && (
                <TouchableOpacity
                  onPress={() => bookmarkCollection(item.id)}
                  style={styles.bookmarkButton}
                >
                  <Ionicons name="bookmark-outline" size={16} color="#007AFF" />
                  <Text style={styles.bookmarkText}>Save</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery.trim() === '' 
                ? 'Try searching for collections' 
                : 'No results found'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  resultGrid: {
    justifyContent: 'space-between',
  },
  collectionCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: '#eee',
  },
  cardContent: {
    padding: 12,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  collectionSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bookmarkButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    maxWidth: '80%',
  }
});

export default SearchPage;