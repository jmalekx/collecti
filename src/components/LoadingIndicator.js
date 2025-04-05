//React and React Native core imports
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

//Custom component imports and styling
import { colours } from '../styles/commonStyles';

const LoadingIndicator = ({
  text = '',
}) => {

  // Animation values for dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const dot4 = useRef(new Animated.Value(0)).current;
  const dot5 = useRef(new Animated.Value(0)).current;

  const animateDot = (dot, delay) => {
    return Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dot, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
  };

  useEffect(() => {
    const animations = [
      animateDot(dot1, 0),
      animateDot(dot2, 150),
      animateDot(dot3, 300),
      animateDot(dot4, 450),
      animateDot(dot5, 600),
    ];

    animations.forEach((animation) => animation.start());

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, []);

  const getDotStyle = (dot) => ({
    transform: [
      {
        scale: dot.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.2],
        }),
      },
    ],
    backgroundColor: dot.interpolate({
      inputRange: [0, 1],
      outputRange: [colours.primary, colours.buttonsTextPink],
    }),
  });

  return (
    <View style={styles.loadingContainer}>
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, getDotStyle(dot1)]} />
        <Animated.View style={[styles.dot, getDotStyle(dot2)]} />
        <Animated.View style={[styles.dot, getDotStyle(dot3)]} />
        <Animated.View style={[styles.dot, getDotStyle(dot4)]} />
        <Animated.View style={[styles.dot, getDotStyle(dot5)]} />
      </View>
      {text && <Text style={styles.loadingText}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  }
});

export default LoadingIndicator;