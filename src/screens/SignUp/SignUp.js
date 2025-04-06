//React and React Native core imports
import React, { useState } from 'react';
import { View, TouchableOpacity, KeyboardAvoidingView, StyleSheet, Image } from 'react-native';

//Third-party library external imports
import { useToast } from 'react-native-toast-notifications';
import { Ionicons } from '@expo/vector-icons';

//Project services and utilities
import { signUp } from '../../services/auth';
import { showToast, TOAST_TYPES } from '../../components/Toasts';
import formValidation from '../../utils/formValidation';

//Custom component imports and styling
import { AppText, AppButton, AppTextInput, AppHeading } from '../../components/Typography';
import commonStyles, { colours } from '../../styles/commonStyles';
import LoadingIndicator from '../../components/LoadingIndicator';
import Thumbnail from '../../images/thumbnailNOBG.png';

/*
  SignUp Screen

  Implements user registration flow following MVC architecture (handling view aspect
  while auth service acts as model and controller for data manipulation)
  - Component only handling UI and user interaction
*/

const SignUp = ({ navigation }) => {

  //Content managing
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  //State transitions
  const [loading, setLoading] = useState(false);

  //Context states
  const toast = useToast();

  //Sign up handled with service
  const handleSignUp = async () => {
    //Validate form data
    if (!formValidation.validateSignupForm({
      username,
      email,
      password,
      confirmPassword
    },
      toast)) {
      return;
    }

    setLoading(true);
    try {
      //Auth to handle sign up
      await signUp(email, password, {
        username: username.trim()
      });

      showToast(toast, "Sign up successful", { type: TOAST_TYPES.SUCCESS });
      navigation.navigate('Onboarding');
    }
    catch (error) {
      showToast(toast, "Sign up failed", { type: TOAST_TYPES.DANGER });
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <commonStyles.Bg>
      <Image
        source={Thumbnail}
        style={styles.thumbnail}
        resizeMode="contain"
      />
      <View style={styles.root}>

        <View style={styles.headerContainer}>
          <AppText style={styles.subHeaderText}>Create. Collect. Organise.</AppText>
          <AppText style={styles.subHeaderText}>Your inspo deserves a home — join today.</AppText>
        </View>

        <View style={styles.divider} />

        <KeyboardAvoidingView behavior='padding' style={styles.formContainer}>
          <View style={styles.authInputContainer}>
            <AppTextInput
              value={username}
              placeholder="Username (optional)"
              autoCapitalize="none"
              onChangeText={setUsername}
              style={styles.input}
              leftIcon={<Ionicons name="person-outline" size={18} color={colours.buttonsHighlight} />}
            />
          </View>

          <View style={styles.authInputContainer}>
            <AppTextInput
              value={email}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              style={styles.input}
              leftIcon={<Ionicons name="mail-outline" size={18} color={colours.buttonsHighlight} />}
            />
          </View>

          <View style={styles.authInputContainer}>
            <AppTextInput
              secureTextEntry={true}
              value={password}
              placeholder="Password"
              autoCapitalize="none"
              onChangeText={setPassword}
              style={styles.input}
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colours.buttonsHighlight} />}
            />
          </View>

          <View style={styles.authInputContainer}>
            <AppTextInput
              secureTextEntry={true}
              value={confirmPassword}
              placeholder="Confirm Password"
              autoCapitalize="none"
              onChangeText={setConfirmPassword}
              style={styles.input}
              leftIcon={<Ionicons name="shield-checkmark-outline" size={18} color={colours.buttonsHighlight} />}
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <LoadingIndicator />
            </View>
          ) : (
            <>
              <AppButton
                style={styles.authButton}
                textStyle={styles.authButtonText}
                title='Sign Up'
                onPress={handleSignUp}
              />

              <View style={styles.signContainer}>
                <AppText>Already have an account? </AppText>
                <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                  <AppText style={styles.authLink}>Sign In</AppText>
                </TouchableOpacity>
              </View>
            </>
          )}
        </KeyboardAvoidingView>


      </View>
    </commonStyles.Bg>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  root: {
    flex: 1,
    alignItems: 'center',
  },
  headerContainer: {
    ...commonStyles.headerContainer,
    marginBottom: 8,
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    marginLeft: 40,
    marginTop: 30,
  },
  formContainer: {
    width: '80%',
    alignItems: 'center',
  },
  thumbnail: {
    position: 'absolute',
    bottom: -30,
    right: -80,
    width: 200,
    height: 200,
    opacity: 0.9,
    zIndex: 0,
  },
});

export default SignUp;