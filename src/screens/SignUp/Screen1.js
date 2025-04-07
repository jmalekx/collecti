//React and React Native core imports
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Image, Animated, Dimensions } from 'react-native';

//Custom component imports and styling
import ProgressBar from '../../components/utilities/ProgressBar';
import commonStyles, { colours } from "../../styles/commonStyles";
import onboardingstyles from '../../styles/onboardingstyles';
import { AppText, AppHeading, AppButton } from '../../components/utilities/Typography';
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
      <View style={onboardingstyles.container}>
        <ProgressBar currentStep={1} totalSteps={4} />

        {/* Animated shareintent ss with rotation and slide */}
        <Animated.Image
          source={ShareScreen}
          style={[
            onboardingstyles.shareImage,
            {
              transform: [
                { translateX: slideAnim },
                { rotate: rotateInterpolation }
              ]
            }
          ]}
          resizeMode='contain'
        />

        {/* Heading */}
        <View style={onboardingstyles.onboardHeading}>
          <AppHeading style={onboardingstyles.welcomeText}>Welcome</AppHeading>
          <View style={onboardingstyles.toNameContainer}>

            <AppText style={onboardingstyles.toText}>to</AppText>
            <Image
              source={Name}
              style={onboardingstyles.nameImage}
              resizeMode='cover'
              tintColor={colours.mainTexts}
            />

          </View>

          {/* What is it */}
          <View style={onboardingstyles.howItWorksContainer}>
            <AppText style={onboardingstyles.headerTexts}>What is Collecti?</AppText>

            <AppText style={[onboardingstyles.SubTexts, onboardingstyles.SubText]}>
              A space for all your scroll-stopping finds.
            </AppText>

            <AppText style={[onboardingstyles.SubTexts, onboardingstyles.SubText]}>
              With Collecti, inspiration sticks – no more endless searching.
              Organise your fav content into one central hub.
            </AppText>

          </View>
        </View>

        {/* How it works */}
        <View style={onboardingstyles.centerContent}>
          <AppText style={onboardingstyles.headerTexts}>How does Collecti work?</AppText>

          <AppText style={onboardingstyles.SubText}>
            Use the share feature from your favourite apps to save
            content directly into Collecti.You can easily organise,
            categorise, revisit and stay inspired.
          </AppText>

          <AppText style={onboardingstyles.SubText}>
            It's your content, organised your way.
          </AppText>
        </View>

        {/* Continue Button */}
        <AppButton
          style={onboardingstyles.button}
          onPress={() => navigation.navigate('Screen2')}
          title='Continue'
        />
      </View>
    </commonStyles.Bg >
  );
};

export default Screen1;