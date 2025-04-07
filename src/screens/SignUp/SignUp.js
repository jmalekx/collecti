//React and React Native core imports
import React, { useState } from 'react';
import { View, TouchableOpacity, KeyboardAvoidingView, StyleSheet, Image } from 'react-native';

//Third-party library external imports
import { useToast } from 'react-native-toast-notifications';
import { Ionicons } from '@expo/vector-icons';

//Project services and utilities
import { signUp } from '../../services/auth';

import formValidation from '../../utils/formValidation';

//Custom component imports and styling
import { showToast, TOAST_TYPES } from '../../components/utilities/Toasts';
import { AppText, AppButton, AppTextInput } from '../../components/utilities/Typography';
import commonStyles, { colours } from '../../styles/commonStyles';
import registerstyles from '../../styles/registerstyles';
import LoadingIndicator from '../../components/utilities/LoadingIndicator';
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
        style={registerstyles.thumbnail}
        resizeMode="contain"
      />
      <View style={registerstyles.root}>

        <View style={registerstyles.UpheaderContainer}>
          <AppText style={registerstyles.subHeaderText}>Create. Collect. Organise.</AppText>
          <AppText style={registerstyles.subHeaderText}>Your inspo deserves a home — join today.</AppText>
        </View>

        <View style={commonStyles.divider} />

        {/* Update the KeyboardAvoidingView with similar styling to SignIn */}
        <KeyboardAvoidingView behavior='padding' style={[registerstyles.formContainer, { width: '80%' }]}>
          <View style={registerstyles.authInputContainer}>
            <AppTextInput
              value={username}
              placeholder="Username (optional)"
              autoCapitalize="none"
              onChangeText={setUsername}
              style={registerstyles.input}
              leftIcon={<Ionicons name="person-outline" size={18} color={colours.buttonsHighlight} />}
            />
          </View>

          <View style={registerstyles.authInputContainer}>
            <AppTextInput
              value={email}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              style={registerstyles.input}
              leftIcon={<Ionicons name="mail-outline" size={18} color={colours.buttonsHighlight} />}
            />
          </View>

          <View style={registerstyles.authInputContainer}>
            <AppTextInput
              secureTextEntry={true}
              value={password}
              placeholder="Password"
              autoCapitalize="none"
              onChangeText={setPassword}
              style={registerstyles.input}
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colours.buttonsHighlight} />}
            />
          </View>

          <View style={registerstyles.authInputContainer}>
            <AppTextInput
              secureTextEntry={true}
              value={confirmPassword}
              placeholder="Confirm Password"
              autoCapitalize="none"
              onChangeText={setConfirmPassword}
              style={registerstyles.input}
              leftIcon={<Ionicons name="shield-checkmark-outline" size={18} color={colours.buttonsHighlight} />}
            />
          </View>

          {loading ? (
            <View style={registerstyles.loadingContainer}>
              <LoadingIndicator />
            </View>
          ) : (
            <>
              <AppButton
                style={registerstyles.authButton}
                textStyle={registerstyles.authButtonText}
                title='Sign Up'
                onPress={handleSignUp}
              />

              <View style={registerstyles.signContainer}>
                <AppText>Already have an account? </AppText>
                <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                  <AppText style={registerstyles.authLink}>Sign In</AppText>
                </TouchableOpacity>
              </View>
            </>
          )}
        </KeyboardAvoidingView>


      </View>
    </commonStyles.Bg>
  );
};

export default SignUp;