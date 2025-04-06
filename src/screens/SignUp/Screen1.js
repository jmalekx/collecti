//React and React Native core imports
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Image, Animated, Dimensions } from 'react-native';

//Custom component imports and styling
import ProgressBar from '../../components/ProgressBar';
import commonStyles, { colours } from "../../styles/commonStyles";
import { AppText, AppHeading, AppButton, AppSmallText } from '../../components/Typography';
import ShareScreen from '../../images/share.png';
import Name from '../../images/nameSmall.png';

/*
  Onboarding Screen1 Component

  Implements first onboarding screen for app. Introduces user to 
  application and core value proposition. Pure UI component, no business logic.
*/

const { width } = Dimensions.get('window');

const Screen1 = ({ navigation }) => {

  //Animatiion values
  const slideAnim = useRef(new Animated.Value(width)).current; //From right
  const rotateAnim = useRef(new Animated.Value(15)).current; //Tilted to right

  useEffect(() => {
    //Run anims together
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -40,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: -10,
        duration: 700,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  //Convert rotation degrees to string interpolation for transform
  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [-10, 20],
    outputRange: ['-10deg', '20deg']
  });

  return (
    <commonStyles.Bg>
      <View style={styles.container}>
        <ProgressBar currentStep={1} totalSteps={4} />

        {/* Animated shareintent ss with rotation and slide */}
        <Animated.Image
          source={ShareScreen}
          style={[
            styles.shareImage,
            {
              transform: [
                { translateX: slideAnim },
                { rotate: rotateInterpolation }
              ]
            }
          ]}
          resizeMode='contain'
        />

        {/* Heading and nameSmall.png - Moved to right side */}
        <View style={styles.onboardHeading}>
          <AppHeading style={styles.welcomeText}>Welcome</AppHeading>
          <View style={styles.toNameContainer}>
            <AppText style={styles.toText}>to</AppText>
            <Image
              source={Name}
              style={styles.nameImage}
              resizeMode='cover'
              tintColor={'#333'}
            />
          </View>
          <View style={styles.howItWorksContainer}>
            <AppText style={styles.howItWorksText}>How does Collecti work?</AppText>
            <AppSmallText style={styles.howItWorksSubText} >Share your favourite content into one central hub.</AppSmallText>
          </View>
        </View>

        {/* Descriptive text */}
        <View style={styles.centerContent}>
          <AppText>How does Collecti work?</AppText>
          <AppSmallText>
            With collecti, inspiration sticks
          </AppSmallText>
        </View>

        {/* Continue Button */}
        <AppButton
          style={styles.button}
          onPress={() => navigation.navigate('Screen2')}
          title='Continue'
        />
      </View>
    </commonStyles.Bg >
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  onboardHeading: {
    marginRight: 20,
    marginTop: 20,
    marginBottom: 0,
  },
  howItWorksContainer: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginTop: 30,
  },
  howItWorksText: {
    textAlign: 'right',
    width: '60%',
    color: '#333',
    fontSize: 15,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  howItWorksSubText: {
    textAlign: 'right',
    width: '50%',
    color: '#333',
    fontStyle: 'italic',
  },
  shareImage: {
    position: 'absolute',
    top: 80,
    left: -60,
    height: 350,
    width: 320,
    zIndex: 1,
  },
  centerContent: {
    alignItems: 'flex-end',
    marginTop: 160,
    paddingRight: 20,
    width: '100%',
  },
  welcomeText: {
    textAlign: 'right',
    fontSize: 40,
    width: '100%',
    color: '#333',
  },
  toNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    width: '100%',
    justifyContent: 'flex-end',
    color: '#333',
  },
  toText: {
    marginRight: 5,
    fontSize: 24,
  },
  nameImage: {
    width: 150,
    height: 50,
  },
  button: {
    marginBottom: 20,
  },
});

export default Screen1;