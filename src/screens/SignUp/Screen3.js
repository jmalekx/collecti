import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ProgressBar from '../../components/ProgressBar';
import PinterestButton from '../../components/PinterestButton';
import { Ionicons } from '@expo/vector-icons';
import commonStyles from "../../commonStyles";
import { AppText, AppHeading, AppButton} from '../../components/Typography';

const Screen3 = ({ route, navigation }) => {
  const { selectedOptions } = route.params;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <ProgressBar currentStep={3} totalSteps={4} />
      {selectedOptions.includes('Pinterest') ? (
        <View>
          <Text style={styles.title}>Connect to Pinterest</Text>
          <PinterestButton />
        </View>
      ) : (
        <AppHeading>Almost there...</AppHeading>
      )}
      <AppButton 
        style={styles.button}
        onPress={() => navigation.navigate('Screen4', { selectedOptions })}
        title='Continue'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
});

export default Screen3;