// React and React Native core imports
import React, { useState } from 'react';
import { View, Image, Platform, ScrollView, StyleSheet, useWindowDimensions, KeyboardAvoidingView, TouchableOpacity } from 'react-native';

// Third-party library external imports
import { useToast } from 'react-native-toast-notifications';
import { Ionicons } from '@expo/vector-icons';

// Project services and utilities
import { signIn } from '../../services/auth';
import { showToast, TOAST_TYPES } from '../../components/Toasts';
import formValidation from '../../utils/formValidation';

// Custom component imports and styling
import Logo from '../../images/logo.png';
import Name from '../../images/name.png';
import commonStyles, { colours } from '../../styles/commonStyles';
import registerstyles from '../../styles/registerstyles';
import { AppText, AppHeading, AppButton, AppTextInput } from '../../components/Typography';
import LoadingIndicator from '../../components/LoadingIndicator';

/*
  SignIn Screem

  Implements user auth interfacte following MVC architecture pattern. Handles view aspect,
  delegating data manipulato to auth layer.
  
*/

const SignIn = ({ navigation }) => {

  //Content managing
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //State transitions
  const [loading, setLoading] = useState(false);

  //Context states
  const toast = useToast();
  const { height } = useWindowDimensions();

  //Function to handle sign in
  const handleSignIn = async () => {
    //Form validation
    if (!formValidation.validateSignInForm({ email, password }, toast)) {
      return;
    }

    setLoading(true);
    try {
      //Auth service
      const user = await signIn(email, password);

      if (user) {
        //Clear on success
        setEmail('');
        setPassword('');
        showToast(toast, "Login successful", { type: TOAST_TYPES.SUCCESS });
      }
      else {
        showToast(toast, "Incorrect email or password. Please try again.", { type: TOAST_TYPES.DANGER });
      }
    }
    catch (error) {
      showToast(toast, "Login failed", { type: TOAST_TYPES.DANGER });
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <commonStyles.Bg style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 65,
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo section */}
          <View style={registerstyles.logoContainer}>
            <Image
              source={Name}
              style={[{ height: 170 }, registerstyles.nameImage]}
              resizeMode='contain'
            />
            <Image
              source={Logo}
              style={registerstyles.logo}
              resizeMode='contain'
            />
          </View>

          {/* Bottom content container */}
          <View style={registerstyles.bottomContainer}>
            {/* Header text */}
            <View style={registerstyles.UpheaderContainer}>
              <AppHeading style={registerstyles.headerText}>Welcome</AppHeading>
              <AppText style={registerstyles.subHeaderText}>Please enter your details below</AppText>
            </View>

            {/* Divider */}
            <View style={commonStyles.divider} />

            {/* Form */}
            <View style={[registerstyles.formContainer, { width: '80%' }]}>
              {/* Email */}
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

              {/* Password */}
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

              {loading ? (
                <View style={commonStyles.loadingContainer}>
                  <LoadingIndicator />
                </View>
              ) : (
                <>
                  {/* Login button */}
                  <AppButton
                    style={registerstyles.authButton}
                    textStyle={registerstyles.authButtonText}
                    title="Login"
                    onPress={handleSignIn}
                  />

                  {/* Sign up link */}
                  <View style={registerstyles.signContainer}>
                    <AppText>Don't have an account? </AppText>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('SignUp')}
                    >
                      <AppText style={registerstyles.authLink}>Sign Up</AppText>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </commonStyles.Bg>
    </KeyboardAvoidingView>
  );
};

export default SignIn;