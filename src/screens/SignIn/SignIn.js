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
          <View style={styles.logoContainer}>
            <Image
              source={Name}
              style={[{ height: 170 }, styles.nameImage]}
              resizeMode='contain'
            />
            <Image
              source={Logo}
              style={styles.logo}
              resizeMode='contain'
            />
          </View>

          {/* Bottom content container */}
          <View style={styles.bottomContainer}>
            {/* Header text */}
            <View style={styles.headerContainer}>
              <AppHeading style={styles.headerText}>Welcome</AppHeading>
              <AppText style={styles.subHeaderText}>Please enter your details below</AppText>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Form */}
            <View style={[styles.formContainer, { width: '80%' }]}>
              {/* Email */}
              <View style={styles.inputContainer}>
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

              {/* Password */}
              <View style={styles.inputContainer}>
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

              {loading ? (
                <View style={styles.loadingContainer}>
                  <LoadingIndicator />
                </View>
              ) : (
                <>
                  {/* Login button */}
                  <AppButton
                    style={[styles.authButton, { alignSelf: 'stretch' }]}
                    textStyle={styles.authButtonText}
                    title="Login"
                    onPress={handleSignIn}
                  />

                  {/* Sign up link */}
                  <View style={styles.signContainer}>
                    <AppText>Don't have an account? </AppText>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('SignUp')}
                    >
                      <AppText style={styles.authLink}>Sign Up</AppText>
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


const styles = StyleSheet.create({
  ...commonStyles,
  root: {
    flex: 1,
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: -10,
  },
  logo: {
    width: 150,
    height: 150,
    maxWidth: 200,
    marginTop: -70,
  },
  nameImage: {
    marginLeft: 20,
  },
  headerText: {
    ...commonStyles.headerText,
    fontSize: 32,
  },
  subHeaderText: {
    ...commonStyles.subHeaderText,
    marginTop: 0,
  },
  headerContainer: {
    ...commonStyles.headerContainer,
    marginBottom: 8,
    alignItems: 'flex-start',
    marginLeft: 40,
    alignSelf: 'stretch',
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
})

export default SignIn;