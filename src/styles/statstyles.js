//React Native core imports
import React from 'react';
import { StyleSheet } from 'react-native';

//Custom component imports and styling
import { colours, typography, shadowStyles } from './commonStyles';

const statstyles = StyleSheet.create({
  //===== TIME PERIOD FILTER STYLES =====
  timeFilterContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  periodButtonsContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginTop: 10
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colours.grey,
    minWidth: 70,
    alignItems: 'center',
  },
  periodButtonSelected: {
    backgroundColor: colours.lightestpink,
  },
  periodButtonText: {
    color: colours.subTexts,
    fontWeight: '500',
    fontSize: 14
  },
  periodButtonTextSelected: {
    color: colours.buttonsTextPink,
  },
  cardTitle: {
    fontSize: 16,
    color: colours.subTexts,
    fontFamily: typography.fontItalic,
  },
  //===== CHART VISUALIZATION STYLES =====
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    alignSelf: 'center'
  },
  //===== METRICS DISPLAY CONTAINER STYLES =====
  metricsContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  smallCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  //===== METRIC CARD STYLES =====
  smallCard: {
    backgroundColor: colours.lightestpink,
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginRight: 8,
    ...shadowStyles.light,
    justifyContent: 'space-between',
  },
  smallCardLabel: {
    color: colours.bu,
    fontSize: 14,
    marginBottom: 6,
  },
  smallCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  //===== METRIC CARD ICON STYLES =====
  smallIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colours.buttons,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  //===== METRIC CARD TEXT STYLES =====
  smallValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colours.mainTexts,
  },
  dateLabel: {
    fontSize: 12,
    color: colours.subTexts,
  }
});

export default statstyles;