//React and React Native core imports
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

//Custom component imports and styling
import commonStyles, { colours } from '../../styles/commonStyles';

/*
  LoadingIndicator Component

  Decorative animated loading indicator displaying sequence
  of pusling circles with cascading animation pattern to indicate loading or processing state.
  The component is reusable and can be used in various parts of the application 
  where loading state needs to be indicated.
*/

const LoadingIndicator = ({ text = '', size = 'normal', style }) => {
  //Optional text prop with default empty string

  //Circle animation values to enable individual animations
  const loadCircle1 = useRef(new Animated.Value(0)).current;
  const loadCircle2 = useRef(new Animated.Value(0)).current;
  const loadCircle3 = useRef(new Animated.Value(0)).current;
  const loadCircle4 = useRef(new Animated.Value(0)).current;
  const loadCircle5 = useRef(new Animated.Value(0)).current;

  //Creating loop for sequence of single circle
  const animateLoad = (loadCircle, delay) => {
    return Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(loadCircle, {
          toValue: 1, //Fully expanded
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true, //Better performance
        }),
        Animated.timing(loadCircle, {
          toValue: 0, //Back to initial state
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
  };

  //Start and manage animation lifecycle
  useEffect(() => {
    const animations = [
      //Different delay values for effect like a wave
      animateLoad(loadCircle1, 0),
      animateLoad(loadCircle2, 150),
      animateLoad(loadCircle3, 300),
      animateLoad(loadCircle4, 450),
      animateLoad(loadCircle5, 600),
    ];

    animations.forEach((animation) => animation.start());

    //Cleanup - stopping when unmounted
    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, []);

  //Determine sizes based on the size prop
  const getSizes = () => {
    switch (size) {
      case 'small':
        return {
          containerHeight: 12,
          circleSize: 4,
          circleMargin: 1,
          textSize: 9
        };
      case 'large':
        return {
          containerHeight: 32,
          circleSize: 10,
          circleMargin: 3,
          textSize: 14
        };
      case 'normal':
      default:
        return {
          containerHeight: 24,
          circleSize: 8,
          circleMargin: 2,
          textSize: 12
        };
    }
  };

  const sizes = getSizes();

  //Styles for each loading circle based on animation value
  const getLoadCircleStyle = (loadCircle) => ({
    transform: [
      {
        scale: loadCircle.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.2],
        }),
      },
    ],
    //Colour animation between them
    backgroundColor: loadCircle.interpolate({
      inputRange: [0, 1],
      outputRange: [colours.primary, colours.buttonsTextPink],
    }),
    width: sizes.circleSize,
    height: sizes.circleSize,
    borderRadius: sizes.circleSize / 2,
    marginHorizontal: sizes.circleMargin,
  });

  return (
    <View style={[commonStyles.loadingContainer, style]}>
      <View style={[commonStyles.loadCirclesContainer, { height: sizes.containerHeight }]}>
        <Animated.View style={[getLoadCircleStyle(loadCircle1)]} />
        <Animated.View style={[getLoadCircleStyle(loadCircle2)]} />
        <Animated.View style={[getLoadCircleStyle(loadCircle3)]} />
        <Animated.View style={[getLoadCircleStyle(loadCircle4)]} />
        <Animated.View style={[getLoadCircleStyle(loadCircle5)]} />
      </View>
      {text && <Text style={[commonStyles.loadingText, { fontSize: sizes.textSize }]}>{text}</Text>}
    </View>
  );
};

export default LoadingIndicator;