import React from 'react';
import { View, StyleSheet } from 'react-native';

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
    backgroundColor: '#000', // Color for completed steps
  },
  inactiveBar: {
    backgroundColor: '#E0E0E0', // Color for incomplete steps
  },
});

export default ProgressBar;