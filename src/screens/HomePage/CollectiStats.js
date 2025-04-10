//React and React Native core imports
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

//Third-party library external imports
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

//Project services and utilities
import statUtils from '../../utils/statUtils';
import { AppText, AppSubheading } from '../../components/utilities/Typography';

//Custom component imports and styling
import commonStyles, { colours } from '../../styles/commonStyles';
import homestyles from '../../styles/homestyles';
import statstyles from '../../styles/statstyles';

/*
  CollectiStats Screen Component
  
  Implements interactive data visualization for user collection activities across different time periods.
  Features:
  - Time-based analysis with configurable periods (week/month/year/all-time)
  - Interactive line charts displaying post frequency over selected timeframe
  - Collection metrics including most popular collection and most active day
  - Card-based layout with consistent styling across the application
  - Optimized data processing using memoization for performance
  
  Props received via navigation params:
  - collections: Array of user collection objects containing post items
*/

const CollectiStats = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { collections = [] } = route.params || {};

  //Time period selection state
  const [selectedIndex, setSelectedIndex] = useState(0);
  const timeFrames = ['Week', 'Month', 'Year', 'All'];

  //Chart data generation based on selected time period
  const collectionStats = useMemo(() =>
    statUtils.generateChartData(collections, selectedIndex),
    [collections, selectedIndex]);

  //Collection metrics calculation
  const totalStats = useMemo(() =>
    statUtils.calculateTotalStats(collections),
    [collections]);

  return (
    <commonStyles.Bg>
      <View style={[commonStyles.container, { marginTop: -10 }]}>

        {/* Custom header with back button */}
        <View style={commonStyles.customHeader}>
          <TouchableOpacity
            style={commonStyles.customHeaderBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colours.mainTexts} />
          </TouchableOpacity>
          <AppSubheading style={commonStyles.customHeaderTitle}>
            Your Collecting Stats
          </AppSubheading>
          <View style={{ width: 25 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={true}
        >

          {/* Time period selector section */}
          <View style={statstyles.timeFilterContainer}>
            <AppSubheading style={commonStyles.textSubheading}>Time Period</AppSubheading>
            <View style={statstyles.periodButtonsContainer}>
              {timeFrames.map((period, index) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    statstyles.periodButton,
                    selectedIndex === index && statstyles.periodButtonSelected
                  ]}
                  onPress={() => setSelectedIndex(index)}
                >
                  <Text
                    style={[
                      statstyles.periodButtonText,
                      selectedIndex === index && statstyles.periodButtonTextSelected
                    ]}
                  >
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Activity chart section */}
          <View style={[homestyles.card, { marginHorizontal: 16, marginBottom: 16 }]}>
            <AppText style={statstyles.cardTitle}>
              Posts Added: {timeFrames[selectedIndex]}
            </AppText>

            <LineChart
              data={collectionStats}
              width={Dimensions.get('window').width - 64}
              height={220}
              chartConfig={statUtils.getChartConfig(selectedIndex)}
              bezier
              style={statstyles.chart}
              fromZero={true}
              segments={4}
              horizontalLabelRotation={0}
            />
          </View>

          {/* Metrics cards section */}
          <View style={statstyles.metricsContainer}>
            <AppSubheading style={[commonStyles.textSubheading, { marginBottom: 12 }]}>
              Collection Metrics
            </AppSubheading>

            <View style={statstyles.smallCardsRow}>

              {/* Most active day card */}
              <View style={statstyles.smallCard}>
                <AppText style={statstyles.smallCardLabel}>Most Active Day To Date</AppText>
                <View style={statstyles.smallCardContent}>
                  <View style={statstyles.smallIconContainer}>
                    <Ionicons name="star" size={18} color={colours.buttonsText} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={statstyles.smallValue}>{totalStats.most}</Text>
                    <AppText style={statstyles.dateLabel}>{totalStats.mostDate}</AppText>
                  </View>
                </View>
              </View>

              {/* Most popular collection card */}
              <View style={[statstyles.smallCard, { marginRight: 0, marginLeft: 8 }]}>
                <AppText style={statstyles.smallCardLabel}>Most Popular Collection</AppText>
                <TouchableOpacity
                  onPress={() => {
                    if (totalStats.mostPopularCollection.id) {
                      navigation.navigate('CollectionDetails', {
                        collectionId: totalStats.mostPopularCollection.id
                      });
                    }
                  }}
                  style={statstyles.smallCardContent}
                  disabled={!totalStats.mostPopularCollection.id}
                >
                  <View style={statstyles.smallIconContainer}>
                    <Ionicons name="folder" size={18} color={colours.buttonsText} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={statstyles.smallValue}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {totalStats.mostPopularCollection.name}
                    </Text>
                    <AppText style={statstyles.dateLabel}>
                      {totalStats.mostPopularCollection.count} posts
                    </AppText>
                  </View>
                </TouchableOpacity>
              </View>

            </View>
          </View>

        </ScrollView>
      </View>
    </commonStyles.Bg>
  );
};

export default CollectiStats;