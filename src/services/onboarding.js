// Project services and utilities
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { completeOnboarding as markUserOnboardingComplete } from './users';
import { createCollection } from './collections';

/*
  Onboarding Service Module

  Provides centralised functionality for onboarding process.
  Gets collection suggestions and creates initial collections for new users.
*/

export const getCollectionSuggestions = () => [
  '📖 recipes',
  '💅🏻 nails',
  '✈️ travel',
  '👗 fashion',
  '💄 beauty',
  '🏋️ fitness',
  '🧶 crafts',
  '🎨 art'
];

//Creates collections for new user during onboarding
export const createInitialCollections = async (collectionNames = [], userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required to create collections');
    }

    //Create collections in parallel
    await Promise.all(
      collectionNames.map(name =>
        createCollection({
          name,
          description: '',
          createdAt: new Date().toISOString(),
        }, userId)
      )
    );
    return true;
  }
  catch (error) {
    console.log('Error creating initial collections:', error);
  }
};

//Complete onboarding
export const completeOnboardingProcess = async (selectedCollections = []) => {
  try {
    const userId = FIREBASE_AUTH.currentUser?.uid;
    if (!userId) {
      throw new Error('No authenticated user found');
    }

    //Create initial collections if any were selected
    if (selectedCollections.length > 0) {
      await createInitialCollections(selectedCollections, userId);
    }

    //Mark user onboarding as complete
    await markUserOnboardingComplete(userId);

    return true;
  }
  catch (error) {
    console.log('Error completing onboarding process:', error);
  }
};