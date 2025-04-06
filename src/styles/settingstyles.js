//React and React Native core imports
import React from 'react';
import { StyleSheet } from 'react-native';

//Custom component imports and styling
import commonStyles, { colours } from './commonStyles';

const settingstyles = StyleSheet.create({
  settingsContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flex: 1,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: colours.tertiary, 
  },
  lastSettingButton: {
    borderBottomWidth: 0,
  },
  settingButtonText: {
    flex: 1,
    fontSize: 16,
    color: colours.mainTexts,
  },
  iconContainer: {
    marginRight: 12,
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronIcon: {
    color: colours.darkergrey,
  },
  dangerButton: {
    backgroundColor: '#ffe6e6',
  },
  dangerText: {
    color: '#e53935',
  },
  versionText: {
    textAlign: 'center',
    color: colours.darkergrey,
    fontSize: 12,
    paddingVertical: 20,
  },
});

export default settingstyles;