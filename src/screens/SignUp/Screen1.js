import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ProgressBar from '../../components/ProgressBar';
import commonStyles from "../../commonStyles";
import { AppText, AppHeading, AppButton, AppSmallText } from '../../components/Typography';

//picture and introduction to collecti and what its about
const Screen1 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ProgressBar currentStep={1} totalSteps={4} />
      <AppHeading>Welcome to Collecti!</AppHeading>
      <AppSmallText>Let's set up your profile</AppSmallText>
      <AppText>How does Collecti work?</AppText>
      <AppSmallText>Share your favourite content into one central hub.</AppSmallText>
      <AppButton
        style={styles.button}
        onPress={() => navigation.navigate('Screen2')}
        title='Continue'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
});

export default Screen1;