//React and React Native core imports
import React from 'react';
import { View, StyleSheet } from 'react-native';

//Custom component imports and styling
import { colours } from '../styles/commonStyles';

/*
  ProgressBar Component

  Visual inidcator component to represent sequential progress.
  Segment based approach to represent steps in process rather than continuous bar
  (Discrete visual representation)

*/

const ProgressBar = ({ currentStep, totalSteps }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            index < currentStep ? styles.activeBar : styles.inactiveBar,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  bar: {
    height: 4,
    borderRadius: 2,
    flex: 1,
    marginHorizontal: 2,
  },
  activeBar: {
    backgroundColor: colours.buttonsTextPink, 
  },
  inactiveBar: {
    backgroundColor: colours.tertiary,
  },
});

export default ProgressBar;