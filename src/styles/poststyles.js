//React and React Native core imports
import React from 'react';
import { StyleSheet } from 'react-native';

//Custom component imports and styling
import { colours, shadowStyles } from './commonStyles';
import addbuttonstyles from './addbuttonstyles';

const poststyles = StyleSheet.create({
  //===== CONTAINER STYLES =====
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 4,
  },
  standardInputContainer: {
    ...addbuttonstyles.standardInputContainer,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  //===== BUTTON STYLES =====
  saveButton: {
    backgroundColor: colours.buttonsTextPink,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    ...shadowStyles.light,
  },
  disabledButton: {
    opacity: 0.7,
  },
  platformButton: {
    backgroundColor: colours.buttonsTextPink,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    ...shadowStyles.light,
  },
  platformButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  //===== FORM SECTION STYLES =====
  section: {
    ...addbuttonstyles.section,
    marginBottom: 5,
  },
  sectionTitle: {
    ...addbuttonstyles.sectionTitle,
  },
  //===== INPUT STYLES =====
  standardInput: {
    ...addbuttonstyles.standardInput,
  },
  textArea: {
    ...addbuttonstyles.textArea,
    minHeight: 120,
  },
  //===== HELPER TEXT STYLES =====
  helperText: {
    fontSize: 12,
    color: colours.subTexts,
    marginTop: 4,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  //===== POST DETAIL STYLES =====
  notes: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 16,
    marginTop: -6,
    color: colours.mainTexts,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  tag: {
    backgroundColor: colours.grey,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    color: colours.subTexts,
  },
  metaContainer: {
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: colours.buttonsTextPink,
    paddingLeft: 12,
  },
  dateText: {
    fontSize: 14,
    color: colours.subTexts,
    fontStyle: 'italic',
  },
  platformText: {
    fontSize: 12,
    color: colours.subTexts,
    fontStyle: 'italic',
  },
  //===== POST RENDER STYLES =====
  renderThumbnail: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 20,
  },
  embedContainer: {
    alignItems: 'center',
    marginBottom: 6,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginVertical: 10,
  },
  errorText: {
    color: '#666',
    fontSize: 16,
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 16,
    textDecorationLine: 'underline',
  }
});

export default poststyles;