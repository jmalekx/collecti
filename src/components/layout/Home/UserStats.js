//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

//Custom component imports and stylingy
import { colours } from '../../../styles/commonStyles';
import homestyles from '../../../styles/homestyles';

/*
  UserStats Component

  Implements data visualisation for user profile statistics.
  Metrics displayed in responsive card-based layout
  Component handles:"
  - Calculating time-based engagement metrics from user metadata (join date)
  - Computing content metrics from collections and posts data
  - Rendering responsive visualisation cards with icons and labels
  
*/

const UserStats = ({ user, collections }) => {
  //Local state for calculated metrics
  const [daysSinceCreation, setDaysSinceCreation] = useState(0);
  const [collectionsCount, setCollectionsCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);

  const navigation = useNavigation();

  //Calculate all metrics when props change
  useEffect(() => {
    //Calculate days since account creation
    if (user && user.metadata && user.metadata.creationTime) {
      const creationDate = new Date(user.metadata.creationTime);
      const today = new Date();
      const diffTime = Math.abs(today - creationDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysSinceCreation(diffDays);
    }

    //Update collections count
    setCollectionsCount(collections?.length || 0);

    //Calculate total posts across all collections
    const total = collections?.reduce((sum, collection) =>
      sum + (collection.items?.length || 0), 0) || 0;
    setPostsCount(total);
  }, [user, collections]);

  const goToCollections = () => {
    navigation.navigate('CollectionScreen');
  };

  const goToCollectingStats = () => {
    navigation.navigate('CollectiStats', { collections });
  };

  return (
    <View style={homestyles.statsCollage}>
      {/* Days Collecting Card - Largest */}
      <TouchableOpacity
        style={[homestyles.statsCard, homestyles.statsCardLarge, { backgroundColor: colours.primary }]}
        onPress={goToCollectingStats}
        activeOpacity={0.7}
      >
        <Text style={[homestyles.statsLabel, homestyles.statsLabelLarge]}>Collecting days</Text>
        <View style={homestyles.statsDetails}>
          <View style={homestyles.iconContainerLarge}>
            <Ionicons name="calendar-outline" size={34} color={colours.buttonsTextPink} />
          </View>
          <Text style={[homestyles.statsNumber, homestyles.statsNumberLarge]}>{daysSinceCreation}</Text>
        </View>
      </TouchableOpacity>

      <View style={homestyles.statsColumn}>
        {/* Collections Card */}
        <TouchableOpacity
          style={[homestyles.statsCard, homestyles.statsCardSmall, { backgroundColor: colours.buttons }]}
          onPress={goToCollections}
          activeOpacity={0.7}
        >
          <Text style={homestyles.statsLabel}>Collections</Text>
          <View style={homestyles.statsDetails}>
            <View style={homestyles.iconContainerSmall}>
              <Ionicons name="folder-outline" size={18} color={colours.buttonsText} />
            </View>
            <Text style={homestyles.statsNumber}>{collectionsCount}</Text>
          </View>
        </TouchableOpacity>

        {/* Posts Card */}
        <TouchableOpacity
          style={[homestyles.statsCard, homestyles.statsCardSmall, { backgroundColor: colours.lightestpink }]}
          onPress={goToCollections}
          activeOpacity={0.7}
        >
          <Text style={homestyles.statsLabel}>Posts</Text>
          <View style={homestyles.statsDetails}>
            <View style={[homestyles.iconContainerSmall, { backgroundColor: colours.grey }]}>
              <Ionicons name="images-outline" size={18} color={colours.darkergrey} />
            </View>
            <Text style={homestyles.statsNumber}>{postsCount}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserStats;