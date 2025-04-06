//React and React Native core imports
import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

/*
  usemenuAnimation Hook

  Animation logic for the addbutton component handling:
  - Animation timing and interpolation 
  - Button rotation animation
  - Menu items translate, scale and opacity animations
  - Staggered animation sequence
*/

const useMenuAnimation = (isOpen) => {
  //Animation values for menu items
  const animation = useRef(new Animated.Value(0)).current;
  const postButtonAnimation = useRef(new Animated.Value(0)).current;
  const collectionButtonAnimation = useRef(new Animated.Value(0)).current;

  //Toggle animation when menu opens/closes
  useEffect(() => {
    const animations = [
      Animated.timing(animation, {
        toValue: isOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.stagger(100, [
        Animated.timing(postButtonAnimation, {
          toValue: isOpen ? 1 : 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(collectionButtonAnimation, {
          toValue: isOpen ? 1 : 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ];

    Animated.parallel(animations).start();
  }, [isOpen, animation, postButtonAnimation, collectionButtonAnimation]);

  //Calculate transforms for main buton
  const rotateInterpolation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

  //Calculate transforms for menu items
  const postButtonTranslateY = postButtonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -165]
  });

  const collectionButtonTranslateY = collectionButtonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -85]
  });

  const scaleInterpolation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  const opacityInterpolation = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1]
  });

  return {
    //Animation transforms
    rotateInterpolation,
    postButtonTranslateY,
    collectionButtonTranslateY,
    scaleInterpolation,
    opacityInterpolation
  };
};

export default useMenuAnimation;