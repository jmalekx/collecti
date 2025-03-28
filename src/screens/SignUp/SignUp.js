//React and React Native core imports
import React, { useState, useLayoutEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView } from 'react-native';

//Third-party library external imports
import { useToast } from 'react-native-toast-notifications';

//Project services and utilities
import { signUp } from '../../services/auth';
import { showToast, TOAST_TYPES } from '../../components/Toasts';
import formValidation from '../../utils/formValidation';

//Custom component imports and styling
import { AppText, AppButton, AppTextInput } from '../../components/Typography';
import commonStyles from '../../styles/commonStyles';

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

    //Nav header config
    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'Create Account',
            headerTitleStyle: {
                fontFamily: 'Inter_700Bold',
                fontSize: 18,
            },
            headerStyle: {
                backgroundColor: '#F9F6F2',
                shadowColor: 'transparent',
                shadowOffset: { height: 0, width: 0 },
                shadowOpacity: 0,
                shadowRadius: 0,
                elevation: 0,
                borderBottomWidth: 0,
            },
            headerShadowVisible: false,
            headerTitleAlign: 'center',
        });
    }, [navigation]);

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
        <View style={styles.root}>
            <KeyboardAvoidingView behavior='padding'>
                <AppTextInput
                    value={username}
                    style={styles.input}
                    placeholder="Username"
                    autoCapitalize="none"
                    onChangeText={setUsername}
                />
                <AppTextInput
                    value={email}
                    style={styles.input}
                    placeholder="Email"
                    autoCapitalize="none"
                    onChangeText={setEmail}
                />
                <AppTextInput
                    secureTextEntry={true}
                    value={password}
                    style={styles.input}
                    placeholder="Password"
                    autoCapitalize="none"
                    onChangeText={setPassword}
                />
                <AppTextInput
                    secureTextEntry={true}
                    value={confirmPassword}
                    style={styles.input}
                    placeholder="Confirm Password"
                    autoCapitalize="none"
                    onChangeText={setConfirmPassword}
                />

                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <>
                        <AppButton
                            style={styles.button}
                            title='Sign Up'
                            onPress={handleSignUp}
                        />

                        <View style={styles.signContainer}>
                            <AppText>Already have an account? </AppText>
                            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                                <AppText style={styles.signLink}>Sign In</AppText>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = {
    ...commonStyles,
    root: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
    },
};

export default SignUp;