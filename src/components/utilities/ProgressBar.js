//React and React Native core imports
import React from 'react';
import { View } from 'react-native';

//Custom component imports and styling
import commonStyles, { colours } from '../../styles/commonStyles';

/*
  ProgressBar Component

  Visual inidcator component to represent sequential progress.
  Segment based approach to represent steps in process rather than continuous bar
  (Discrete visual representation)

*/

const ProgressBar = ({ currentStep, totalSteps }) => {
  return (
    <View style={commonStyles.progressContainer}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            commonStyles.progressBar,
            index < currentStep ? commonStyles.progressActiveBar : commonStyles.progressInactiveBar,
          ]}
        />
      ))}
    </View>
  );
};

export default ProgressBar;