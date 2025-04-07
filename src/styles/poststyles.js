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
//===== HEADER STYLES =====
header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
  paddingVertical: 12,
},
headerButton: {
  padding: 8,
  borderRadius: 8,
},
headerTitle: {
  flex: 1,
  textAlign: 'center',
  color: colours.mainTexts,
},
//===== BUTTON STYLES =====
saveButton: {
  backgroundColor: colours.buttonsTextPink,
  borderRadius: 12,
  justifyContent: 'center',
  alignItems: 'center',
  width: 35,
  height: 35,
  ...shadowStyles.light,
},
disabledButton: {
  opacity: 0.7,
},
//===== FORM SECTION STYLES =====
section: {
  ...addbuttonstyles.section,
  marginBottom: 40,
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

});

export default poststyles;