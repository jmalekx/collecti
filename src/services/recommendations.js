//Third-party library external imports
import { collectionGroup, query, limit, orderBy, getDocs } from 'firebase/firestore';
import { getCurrentUserId } from './firebase';

//Project services and utilities
import { FIREBASE_DB } from '../../FirebaseConfig';

/*
  Recommendations Service

  Implementation of content-based recommendation utilising natural
  language processing techniques for keyword extraction and relevance scoring.
  Algorithm employs vector space model for measuring similarity.

  Content-based filtering: matching user preferences derivded from their existing
  collections and bookmarks
  Other recommendations: fallback when there is not enough user data
*/

//Get collections similar to user bookmarks or collections
export const getSimilarCollections = async (userCollections = [], bookmarkedCollections = [], maxResults = 6) => {
  try {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return [];

    //Phase 1: feature extraction from user data - keywords representing user interests
    const userKeywords = extractKeywords([...userCollections, ...bookmarkedCollections]);

    //If insufficent data, fallback
    if (userKeywords.length === 0) {
      return getRecentCollections(maxResults);
    }

    //Phase 2: candidate generation - query collections that match user interests
    const collectionsRef = collectionGroup(FIREBASE_DB, 'collections');
    const collectionsQuery = query(
      collectionsRef,
      orderBy('name'),
      limit(30) //Retrieve candidate set larger than final result for filtering
    );

    const snapshot = await getDocs(collectionsQuery);

    //Phase 3: candidaste filtering - remove collections that are already owned/bookmarked
    const existingCollectionIds = new Set([
      ...userCollections.map(c => c.id),
      ...bookmarkedCollections.map(c => c.id)
    ]);

    //Phase 4: scoring/ranking - calculate relevance for each collection
    let recommendedCollections = [];

    snapshot.forEach(doc => {
      const ownerId = doc.ref.parent.parent.id;
      const collectionId = doc.id;

      //Apply filtering rules
      if (ownerId === currentUserId ||
        existingCollectionIds.has(collectionId) ||
        collectionId.toLowerCase() === 'unsorted') {
        return;
      }

      const collection = {
        id: collectionId,
        ...doc.data(),
        ownerId
      };

      //Calculate relevance score using vector space similarity model
      const relevanceScore = calculateRelevanceScore(collection, userKeywords);
      if (relevanceScore > 0) {
        recommendedCollections.push({
          ...collection,
          relevanceScore
        });
      }
    });

    //Phase 5: Result optimisation - sort and limit results 
    recommendedCollections.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return recommendedCollections.slice(0, maxResults);
  }
  catch (error) {
    console.log('Error getting recommendations:', error);
    return [];
  }
};

//Get recent collections as fallback
export const getRecentCollections = async (maxResults = 6) => {
  try {
    const currentUserId = getCurrentUserId();

    const collectionsQuery = query(
      collectionGroup(FIREBASE_DB, 'collections'),
      orderBy('createdAt', 'desc'), //Most recent appear first - newer collections more relevant
      limit(maxResults * 2)
    );

    const snapshot = await getDocs(collectionsQuery);
    let collections = [];

    snapshot.forEach(doc => {
      const ownerId = doc.ref.parent.parent.id;
      const collectionId = doc.id;

      //Skip user own collections and unsorted collections
      if (ownerId !== currentUserId && collectionId.toLowerCase() !== 'unsorted') {
        collections.push({
          id: collectionId,
          ...doc.data(),
          ownerId
        });
      }
    });

    return collections.slice(0, maxResults);
  }
  catch (error) {
    console.log('Error getting popular collections:', error);
    return [];
  }
};

//NLP utility to extract meaningful keywords
const extractKeywords = (collections) => {
  const keywords = new Set(); //Set data structure = unique keywords

  collections.forEach(collection => {
    //Extract from collection name (primary metadata)
    const nameWords = (collection.name || '').toLowerCase()
      .replace(/[^\w\s]/g, '') //Remove special characters
      .split(/\s+/) //Split by whitespace
      .filter(word => word.length > 2); //Only words longer than 2 chars

    //Extract from collection description (secondary metadata)
    const descWords = (collection.description || '').toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);

    //Extract from post tags if available (tertiary metadata) for deeper semantic analysis
    const tagWords = [];
    if (collection.items && Array.isArray(collection.items)) {
      collection.items.forEach(item => {
        if (item.tags && Array.isArray(item.tags)) {
          tagWords.push(...item.tags.map(tag => tag.toLowerCase()));
        }
      });
    }

    //Feature vector construction - add all keywords to the set
    [...nameWords, ...descWords, ...tagWords].forEach(word => keywords.add(word));
  });

  return Array.from(keywords);
};

//Calculate relevance score based on keyword matching
const calculateRelevanceScore = (collection, userKeywords) => {
  let score = 0;

  //Content vector from metadata
  const collectionWords = [
    ...(collection.name || '').toLowerCase().split(/\s+/),
    ...(collection.description || '').toLowerCase().split(/\s+/)
  ];

  //Check for keyword matches
  userKeywords.forEach(keyword => {
    //Partial word matching
    if (collectionWords.some(word => word.includes(keyword) || keyword.includes(word))) {
      score += 2;
    }

    //Exact collection name match gets higher score
    if (collection.name.toLowerCase().includes(keyword)) {
      score += 3;
    }
  });

  return score;
};