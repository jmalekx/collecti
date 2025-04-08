//React and React Native core imports
import React, { useState, useLayoutEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

//Third-party library external imports
import { useNavigation } from '@react-navigation/native';
import { Ionicons, AntDesign } from '@expo/vector-icons';

//Project services and utilities
import { useUserData } from '../../hooks/useUserData';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { DEFAULT_PROFILE_PICTURE } from '../../constants';

//Custom component imports and styling
import commonStyles, { shadowStyles, colours } from '../../styles/commonStyles';
import collectionstyles from '../../styles/collectionstyles';
import RenderThumbnail from '../../components/utilities/RenderThumbnail';
import SearchBar from '../../components/utilities/SearchBar';

/*
  Collections component displays the user's collections and allows searching through them.
  Props:
  - userProfile: The user's profile data.
  - collections: The user's collections data.
  
*/

const Collections = ({ }) => {
  const navigation = useNavigation();
  const { userProfile, collections } = useUserData();
  const [searchQuery, setSearchQuery] = useState('');

  //Header with settings button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('UserSettings')}
          style={commonStyles.headerButton}
        >
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  //Username and pfp
  const username = userProfile?.username || FIREBASE_AUTH.currentUser?.email?.split('@')[0] || 'User';
  const profilePicture = userProfile?.profilePicture || DEFAULT_PROFILE_PICTURE;

  //Filter collections based on search query
  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  //Sort collections by creation date (newest first), with "Unsorted" always at the top
  const sortedCollections = [...filteredCollections].sort((a, b) => {
    //Always keep "Unsorted" collection at the top
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
          numColumns={3} // Adjusted to display 3 items per row
          contentContainerStyle={collectionstyles.grid}
          columnWrapperStyle={{ justifyContent: 'flex-start' }} // Ensures items don't stretch
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[collectionstyles.collectionCard, { marginRight: '5%' }]}
              onPress={() => navigation.navigate('CollectionDetails', { collectionId: item.id })}
            >
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
      </View>
    </commonStyles.Bg>
  );
};
export default Collections;
